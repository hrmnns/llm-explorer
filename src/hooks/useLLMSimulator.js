import { useState, useMemo, useEffect } from 'react';

export const useLLMSimulator = (activeScenario) => {
  const [noise, setNoise] = useState(0);
  const [temperature, setTemperature] = useState(1.0);
  const [activeProfileId, setActiveProfileId] = useState('scientific');
  const [mlpThreshold, setMlpThreshold] = useState(0.5);
  const [positionWeight, setPositionWeight] = useState(0);
  const [headOverrides, setHeadOverrides] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);

  // Hilfsfunktion zur Ermittlung der Slider-Werte aus Phase 2
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

  // In useLLMSimulator.js

  // In useLLMSimulator.js

  useEffect(() => {
    if (!activeScenario) return;

    // 1. Die Browser-Speicher-Keys für dieses Szenario löschen
    const SESSION_STORAGE_KEY = `sim_overrides_${activeScenario.id}`;
    const PERSIST_HEAD_KEY = `sim_lastHead_${activeScenario.id}`;
    const PERSIST_TOKEN_KEY = `sim_lastToken_${activeScenario.id}`;

    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(PERSIST_HEAD_KEY);
    sessionStorage.removeItem(PERSIST_TOKEN_KEY);

    // 2. Globalen State zurücksetzen
    const settings = activeScenario.phase_4_decoding?.settings || {};
    setTemperature(settings.default_temperature || 0.7);
    setNoise(settings.default_noise || 0.0);
    setMlpThreshold(settings.default_mlp_threshold || 0.5);

    // 3. Head-Overrides im State leeren
    setHeadOverrides({});
    setSelectedToken(null);

    const firstProfileId = activeScenario.phase_2_attention?.attention_profiles?.[0]?.id;
    if (firstProfileId) {
      setActiveProfileId(firstProfileId);
    }

    console.log(`♻️ Globaler Reset für ${activeScenario.id} durchgeführt.`);
  }, [activeScenario?.id]);

  // 1. PHASE 1: ARBEITSVEKTOREN
  const processedVectors = useMemo(() => {
    if (!activeScenario?.phase_1_embedding) return [];
    return activeScenario.phase_1_embedding.token_vectors.map(v => {
      const xBase = v.base_vector[0];
      const yBase = v.base_vector[1];
      const xPos = (v.positional_vector?.[0] || 0) * positionWeight;
      const yPos = (v.positional_vector?.[1] || 0) * positionWeight;
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

  // --- NEU & ZENTRAL: PHASE 3 BERECHNUNG DIREKT IM HOOK ---
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

        const sliderVal = headOverrides[tokenKey] !== undefined
          ? parseFloat(headOverrides[tokenKey])
          : 0.7;

        // KORREKTUR: Zusätzlicher Check auf cat.id
        const rule = rules.find(r =>
          Number(r.head) === Number(linkedHeadId) &&
          String(r.source) === String(t.id) &&
          r.label === cat.id // Die Regel muss vom Label her zur Kategorie-ID passen
        );

        if (rule) {
          totalActivation += (sliderVal / 0.7) * parseFloat(rule.strength) * globalSignal;
        }
      });

      const finalActivation = Math.max(0, Math.min(1.0, totalActivation * 0.35));

      return {
        ...cat,
        activation: finalActivation,
        isActive: finalActivation >= mlpThreshold,
        linked_head: linkedHeadId
      };
    });
  }, [activeScenario, headOverrides, activeProfileId, mlpThreshold, activeAttention]);

  // 4. PHASE 4: DECODING (Reagiert nun SOFORT auf das berechnete activeFFN)
  const finalOutputs = useMemo(() => {
    if (!activeScenario?.phase_4_decoding) return [];
    const tokens = activeScenario.phase_4_decoding.top_k_tokens || [];
    const multiplier = activeScenario.phase_4_decoding.settings?.logit_bias_multiplier || 12;

    const calculatedData = tokens.map(tokenItem => {
      // Suche Live-Aktivierung aus Phase 3 (oben berechnet)
      const matchingCat = activeFFN.find(f => f.id === tokenItem.category_link);
      const liveActivation = matchingCat ? matchingCat.activation : 0.5;

      // Logit-Bias Formel
      const bias = (liveActivation - 0.5) * multiplier;
      const currentLogit = tokenItem.base_logit !== undefined ? tokenItem.base_logit : 4.0;

      const decay = 1 - (Math.min(1, noise / 2) * (tokenItem.noise_sensitivity || 0.5));
      const adjustedLogit = (currentLogit + bias) * decay;

      return {
        ...tokenItem,
        logit: adjustedLogit,
        liveActivation, // Für den Inspektor
        ffnBoost: bias,  // Für den Inspektor
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
    setNoise(0);
    setPositionWeight(1.0);
    setHeadOverrides({});
    setMlpThreshold(0.5);
    setTemperature(0.7);
    setSelectedToken(null);
    setActiveProfileId(activeScenario?.phase_2_attention?.attention_profiles[0]?.id || 'default');
  };

  return {
    phase_0_tokenization: activeScenario?.phase_0_tokenization,
    processedVectors,
    activeFFN, // Jetzt ein berechnetes Memo, kein manueller State mehr!
    finalOutputs,
    activeAttention,
    headOverrides,
    setHeadOverrides,
    updateHeadWeight,
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