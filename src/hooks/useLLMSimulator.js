import { useState, useMemo, useEffect } from 'react';

export const useLLMSimulator = (activeScenario) => {
  const [noise, setNoise] = useState(0);
  const [temperature, setTemperature] = useState(1.0);
  const [activeProfileId, setActiveProfileId] = useState('scientific');
  const [mlpThreshold, setMlpThreshold] = useState(0.5);
  const [positionWeight, setPositionWeight] = useState(0);
  const [headOverrides, setHeadOverrides] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);

  // Hilfsfunktion zur Ermittlung der Slider-Werte aus Phase 2 (Wichtig für UI-Sync)
  const getSliderVal = (hNum) => {
    const targetSuffix = `_h${hNum}`;
    const allKeys = Object.keys(headOverrides);

    if (selectedToken) {
      const specificKey = allKeys.find(k => k.includes(`_s${selectedToken.id || selectedToken.token_index}_`) && k.endsWith(targetSuffix));
      if (specificKey !== undefined) return parseFloat(headOverrides[specificKey]);
    }

    const activeKeys = allKeys.filter(k => k.endsWith(targetSuffix));
    if (activeKeys.length > 0) {
      const primaryKey = activeKeys.find(k => k.includes("_s1_")) || activeKeys[0];
      return parseFloat(headOverrides[primaryKey]);
    }
    return 0.7; // Default Head-Stärke
  };

  const updateHeadWeight = (key, value) => {
    setHeadOverrides(prev => ({ ...prev, [key]: value }));
  };

  // Reset-Logik bei Szenario-Wechsel
  useEffect(() => {
    if (!activeScenario) return;

    const SESSION_STORAGE_KEY = `sim_overrides_${activeScenario.id}`;
    const PERSIST_HEAD_KEY = `sim_lastHead_${activeScenario.id}`;
    const PERSIST_TOKEN_KEY = `sim_lastToken_${activeScenario.id}`;

    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(PERSIST_HEAD_KEY);
    sessionStorage.removeItem(PERSIST_TOKEN_KEY);

    const settings = activeScenario.phase_4_decoding?.settings || {};
    setTemperature(settings.default_temperature || 0.7);
    setNoise(settings.default_noise || 0.0);
    setMlpThreshold(settings.default_mlp_threshold || 0.5);

    setHeadOverrides({});
    setSelectedToken(null);

    const firstProfileId = activeScenario.phase_2_attention?.attention_profiles?.[0]?.id;
    if (firstProfileId) {
      setActiveProfileId(firstProfileId);
    }

  }, [activeScenario?.id]);

  // 1. PHASE 1: ARBEITSVEKTOREN
  const processedVectors = useMemo(() => {
    if (!activeScenario?.phase_1_embedding) return [];
    return activeScenario.phase_1_embedding.token_vectors.map(v => {
      const xBase = v.base_vector[0];
      const yBase = v.base_vector[1];
      const xPos = (v.positional_vector?.[0] || 0) * positionWeight;
      const yPos = (v.positional_vector?.[1] || 0) * positionWeight;

      // Jitter wird 0, wenn Noise 0 ist (deterministisch)
      const noiseX = (Math.random() - 0.5) * noise * 25;
      const noiseY = (Math.random() - 0.5) * noise * 25;
      const signalQuality = Math.max(0, 1 - (noise / 5));

      return {
        ...v,
        displayX: (xBase + xPos) * 150 + noiseX,
        displayY: (yBase + yPos) * 150 + noiseY,
        signalQuality
      };
    });
  }, [activeScenario, noise, positionWeight]);

  // 2. PHASE 2: ATTENTION
  const activeAttention = useMemo(() => {
    if (!activeScenario?.phase_2_attention?.attention_profiles) return { avgSignal: 1.0, profiles: [] };
    const avgSignal = processedVectors.reduce((acc, v) => acc + v.signalQuality, 0) / (processedVectors.length || 1);
    return { avgSignal, profiles: activeScenario.phase_2_attention.attention_profiles };
  }, [activeScenario, processedVectors]);

  // 3. PHASE 3: FFN (Optimierte Logik: Aggregation aller Signale)
  const activeFFN = useMemo(() => {
    const activationsSource = activeScenario?.phase_3_ffn?.activations;
    const tokens = activeScenario?.phase_0_tokenization?.tokens;
    if (!activationsSource || !tokens) return [];

    const activeAttProfile = activeAttention.profiles.find(p => String(p.id) === String(activeProfileId)) || activeAttention.profiles[0];
    const rules = activeAttProfile?.rules || [];
    const globalSignal = activeAttention.avgSignal || 0;

    return activationsSource.map((cat, index) => {
      const linkedHeadId = cat.linked_head || (index + 1);
      let totalActivation = 0;

      tokens.forEach(t => {
        const tokenKey = `${activeProfileId}_s${t.id}_h${linkedHeadId}`;

        // Override-Werte abrufen (z.B. vom Goal-Seeking)
        const sliderVal = headOverrides[tokenKey] !== undefined
          ? parseFloat(headOverrides[tokenKey])
          : 0.7;

        // --- UPDATE: .filter statt .find ---
        // Wir suchen ALLE Regeln für diesen Head & Token.
        // Das macht das System immun gegen doppelte Regeln oder Sortier-Reihenfolge.
        const relevantRules = rules.filter(r =>
          Number(r.head) === Number(linkedHeadId) &&
          String(r.source) === String(t.id)
        );

        // Summiere die Stärke aller gefundenen Regeln auf
        relevantRules.forEach(rule => {
          totalActivation += (sliderVal / 0.7) * parseFloat(rule.strength) * globalSignal;
        });
      });

      // Clamp auf 0.0 bis 1.0 mit Scaling-Faktor
      const finalActivation = Math.max(0, Math.min(1.0, totalActivation * 0.33));

      return {
        ...cat,
        activation: finalActivation,
        isActive: finalActivation >= mlpThreshold,
        linked_head: linkedHeadId
      };
    });
  }, [activeScenario, headOverrides, activeProfileId, mlpThreshold, activeAttention]);

  // 4. PHASE 4: DECODING (Reagiert auf activeFFN, Noise und Temperature)
  const finalOutputs = useMemo(() => {
    if (!activeScenario?.phase_4_decoding) return [];
    const tokens = activeScenario.phase_4_decoding.top_k_tokens || [];
    const multiplier = activeScenario.phase_4_decoding.settings?.logit_bias_multiplier || 12;

    const calculatedData = tokens.map(tokenItem => {
      const matchingCat = activeFFN.find(f => String(f.id).toLowerCase() === String(tokenItem.category_link).toLowerCase());
      const liveActivation = matchingCat ? matchingCat.activation : 0.5;

      // Logit-Bias Berechnung
      const bias = (liveActivation - 0.5) * multiplier;
      const baseLogit = tokenItem.base_logit !== undefined ? tokenItem.base_logit : 4.0;

      // Wenn Noise 0 ist, ist decay 1.0 (keine Dämpfung)
      const decay = 1 - (Math.min(1, noise / 2) * (tokenItem.noise_sensitivity || 0.5));
      const adjustedLogit = (baseLogit + bias) * decay;

      return {
        ...tokenItem,
        logit: adjustedLogit,
        liveActivation,
        ffnBoost: bias,
        exp: Math.exp(adjustedLogit / Math.max(temperature, 0.01))
      };
    });

    const sumExponents = calculatedData.reduce((acc, curr) => acc + curr.exp, 0) || 1;

    return calculatedData.map(item => ({
      ...item,
      probability: item.exp / sumExponents
    })).sort((a, b) => b.probability - a.probability);
  }, [activeScenario, activeFFN, temperature, noise]);

  const resetParameters = () => {
    const settings = activeScenario?.phase_4_decoding?.settings || {};
    setNoise(settings.default_noise || 0);
    setTemperature(settings.default_temperature || 0.7);
    setMlpThreshold(settings.default_mlp_threshold || 0.5);
    setHeadOverrides({});
    setPositionWeight(0);
    setSelectedToken(null);
    setActiveProfileId(activeScenario?.phase_2_attention?.attention_profiles[0]?.id || 'scientific');
  };

  return {
    phase_0_tokenization: activeScenario?.phase_0_tokenization,
    processedVectors,
    activeFFN,
    finalOutputs,
    activeAttention,
    headOverrides,
    setHeadOverrides,
    updateHeadWeight,
    getSliderVal,
    noise, setNoise,
    temperature, setTemperature,
    activeProfileId, setActiveProfileId,
    mlpThreshold, setMlpThreshold,
    positionWeight, setPositionWeight,
    selectedToken, setSelectedToken,
    activeScenario,
    resetParameters
  };
};