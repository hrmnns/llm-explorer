import { useState, useMemo, useEffect } from 'react';

export const useLLMSimulator = (activeScenario) => {
  const [noise, setNoise] = useState(0);
  const [temperature, setTemperature] = useState(1.0);
  const [activeProfileId, setActiveProfileId] = useState('scientific');
  const [mlpThreshold, setMlpThreshold] = useState(0.5);
  const [positionWeight, setPositionWeight] = useState(0);

  // NEU: State für die Kommunikation zwischen Phase 4 und Phase 5
  const [selectedToken, setSelectedToken] = useState(null);

  // Reset Selection wenn das Szenario wechselt
  useEffect(() => {
    setSelectedToken(null);
  }, [activeScenario]);

  // 1. PHASE 1: ARBEITSVEKTOREN
  // Wir nutzen exakt deine Original-Formel, berechnen aber zusätzlich
  // normierte x/y Werte für die neuen Visualisierungen.
  const processedVectors = useMemo(() => {
    if (!activeScenario?.phase_1_embedding) return [];

    return activeScenario.phase_1_embedding.token_vectors.map(v => {
      // 1. Originaldaten (base_vector)
      const xBase = v.base_vector[0];
      const yBase = v.base_vector[1];

      // 2. Positionaler Einfluss
      // Fallback: (v.positional_vector || [0,0]) falls mal daten fehlen
      const xPos = (v.positional_vector?.[0] || 0) * positionWeight;
      const yPos = (v.positional_vector?.[1] || 0) * positionWeight;

      // 3. Rauschen (Noise) berechnen - DEINE ORIGINAL FORMEL
      const noiseX = (Math.random() - 0.5) * noise * 25;
      const noiseY = (Math.random() - 0.5) * noise * 25;

      // DEINE ORIGINAL BERECHNUNG (Pixel-Werte)
      const finalPixelX = (xBase + xPos) * 150 + noiseX;
      const finalPixelY = (yBase + yPos) * 150 + noiseY;

      // NEU: Berechnung der Signalqualität (Wie nah am Ideal?)
      // Wird für Phase 2 (Attention) und Phase 4 (Decoding) gebraucht
      const signalQuality = Math.max(0, 1 - (noise / 5));

      return {
        ...v,
        // Original-Koordinaten (skaliert für die UI)
        displayXOrig: xBase * 150,
        displayYOrig: yBase * 150,

        // Aktueller Arbeitsvektor (Inkl. Position & Noise) - WIE GEHABT
        displayX: finalPixelX,
        displayY: finalPixelY,

        // NEU: Normalisierte Koordinaten für den neuen Phase-1-Graphen
        // Da deine Basis * 150 war, teilen wir einfach durch 150.
        // So bleibt die Relation exakt gleich, aber der Graph kann es rendern.
        x: finalPixelX / 150,
        y: finalPixelY / 150,

        signalQuality
      };
    });
  }, [activeScenario, noise, positionWeight]);

  // NEU: PHASE 2 ATTENTION SUPPORT
  // Berechnet einen Durchschnittswert für die "Gesundheit" der Pipeline
  const activeAttention = useMemo(() => {
    if (!activeScenario?.phase_2_attention?.attention_profiles) return { avgSignal: 1.0, profiles: [] };

    const avgSignal = processedVectors.reduce((acc, v) => acc + v.signalQuality, 0) / (processedVectors.length || 1);

    return {
      avgSignal,
      profiles: activeScenario.phase_2_attention.attention_profiles
    };
  }, [activeScenario, processedVectors]);

  // 3. PHASE 3: FFN
  const activeFFN = useMemo(() => {
    if (!activeScenario?.phase_3_ffn?.activation_profiles) return [];
    let profile = activeScenario.phase_3_ffn.activation_profiles.find(
      p => String(p.ref_profile_id).toLowerCase() === String(activeProfileId).toLowerCase()
    );
    if (!profile && activeScenario.phase_3_ffn.activation_profiles.length > 0) {
      profile = activeScenario.phase_3_ffn.activation_profiles[0];
    }
    if (!profile) return [];

    return profile.activations.map(a => {
      // NEU: Dämpfung durch Signalqualität (optional, macht es realistischer)
      // Wenn Noise hoch ist, sinkt die Aktivierungsstärke leicht
      const effectiveActivation = a.activation * (activeAttention.avgSignal || 1);
      return {
        ...a,
        isActive: effectiveActivation >= mlpThreshold
      };
    });
  }, [activeScenario, activeProfileId, mlpThreshold, activeAttention]);

  // 4. PHASE 4: DECODING (Generisch & Wartungsfrei)
  const finalOutputs = useMemo(() => {
    if (!activeScenario?.phase_4_decoding) return [];
    const outputs = activeScenario.phase_4_decoding.outputs;

    const noiseLevel = Math.min(1, noise / 2);

    const calculatedData = outputs.map(o => {
      // GENIALE VEREINFACHUNG:
      // Wir schauen, ob das JSON eine 'noise_sensitivity' liefert.
      // Wenn nicht, nehmen wir 0.5 als Standard.
      // Keine if-Abfragen nach Namen mehr!
      const sensitivity = o.noise_sensitivity !== undefined ? o.noise_sensitivity : 0.5;

      const decayFactor = 1 - (noiseLevel * sensitivity);
      const adjustedLogit = Math.max(0.1, o.logit * decayFactor);

      return {
        ...o,
        adjustedLogit,
        exp: Math.exp(adjustedLogit / Math.max(temperature, 0.01))
      };
    });

    const sumExponents = calculatedData.reduce((acc, curr) => acc + curr.exp, 0);

    return calculatedData.map((item) => ({
      ...item,
      logit: item.adjustedLogit,
      probability: item.exp / sumExponents,
      // Critical, wenn es Logik war (hohe Sensitivity) und wir viel Noise haben
      isCritical: (item.hallucination_risk > 0.7) || (noise > 0.5 && item.noise_sensitivity > 0.8)
    }));
  }, [activeScenario, temperature, noise]);

  const resetParameters = () => {
    setNoise(0);
    setPositionWeight(0);
    setTemperature(1.0);
    setMlpThreshold(0.5);
    setSelectedToken(null); // Auch Token resetten
  };

  return {
    phase_0_tokenization: activeScenario?.phase_0_tokenization,
    processedVectors,
    activeFFN,
    finalOutputs,
    activeAttention, // Neu exportiert

    noise, setNoise,
    temperature, setTemperature,
    activeProfileId, setActiveProfileId,
    mlpThreshold, setMlpThreshold,
    positionWeight, setPositionWeight,

    selectedToken, setSelectedToken, // Neu exportiert für Phase 4 & 5

    resetParameters
  };
};