import { useState, useMemo } from 'react';

export const useLLMSimulator = (activeScenario) => {
  const [noise, setNoise] = useState(0);
  const [temperature, setTemperature] = useState(1.0);
  const [activeProfileId, setActiveProfileId] = useState('scientific');
  const [mlpThreshold, setMlpThreshold] = useState(0.5);
  const [positionWeight, setPositionWeight] = useState(0);

  // 1. PHASE 1: ARBEITSVEKTOREN & SIGNAL-QUALITÄT
  const processedVectors = useMemo(() => {
    if (!activeScenario?.phase_1_embedding) return [];
    
    return activeScenario.phase_1_embedding.token_vectors.map(v => {
      const xBase = v.base_vector[0];
      const yBase = v.base_vector[1];
      const xPos = v.positional_vector[0] * positionWeight;
      const yPos = v.positional_vector[1] * positionWeight;
      
      const noiseX = (Math.random() - 0.5) * noise * 25;
      const noiseY = (Math.random() - 0.5) * noise * 25;

      // Berechnung der Signalqualität (Wie nah am Ideal?)
      // Noise reduziert die Qualität linear
      const signalQuality = Math.max(0, 1 - (noise / 5)); 

      return {
        ...v,
        displayXOrig: xBase * 150,
        displayYOrig: yBase * 150,
        displayX: (xBase + xPos) * 150 + noiseX,
        displayY: (yBase + yPos) * 150 + noiseY,
        signalQuality // Wird an nächste Phasen weitergereicht
      };
    });
  }, [activeScenario, noise, positionWeight]);

  // 2. PHASE 2: DYNAMISCHE ATTENTION (Abhängig von Vektoren)
  const activeAttention = useMemo(() => {
    if (!activeScenario?.phase_2_attention?.attention_profiles) return [];
    
    // Durchschnittliche Signalqualität der Vektoren als Multiplikator
    const avgSignal = processedVectors.reduce((acc, v) => acc + v.signalQuality, 0) / (processedVectors.length || 1);
    
    // Hier könnten wir später noch Distanzberechnungen einfügen
    return {
      avgSignal,
      profiles: activeScenario.phase_2_attention.attention_profiles
    };
  }, [activeScenario, processedVectors]);

  // 3. PHASE 3: FFN (Beeinflusst durch Signal-Qualität)
  const activeFFN = useMemo(() => {
    if (!activeScenario?.phase_3_ffn?.activation_profiles) return [];
    
    let profile = activeScenario.phase_3_ffn.activation_profiles.find(
      p => String(p.ref_profile_id).toLowerCase() === String(activeProfileId).toLowerCase()
    );
    if (!profile && activeScenario.phase_3_ffn.activation_profiles.length > 0) {
      profile = activeScenario.phase_3_ffn.activation_profiles[0];
    }
    if (!profile) return [];

    // Die Aktivierung wird durch die Signalqualität gedämpft
    // Wenn Noise hoch ist, "feuern" die Neuronen schwächer oder unpräziser
    return profile.activations.map(a => {
      const dampenedActivation = a.activation * activeAttention.avgSignal;
      return {
        ...a,
        activation: dampenedActivation,
        isActive: dampenedActivation >= mlpThreshold
      };
    });
  }, [activeScenario, activeProfileId, mlpThreshold, activeAttention.avgSignal]);

  // 4. PHASE 4: DECODING (Reagiert auf die gesamte Kette)
  const finalOutputs = useMemo(() => {
    if (!activeScenario?.phase_4_decoding) return [];
    
    const outputs = activeScenario.phase_4_decoding.outputs;
    
    // Die Schärfe der Vorhersage sinkt mit dem Signal
    // Wir manipulieren die Logits basierend auf der Signalqualität
    const exponents = outputs.map(o => {
      const qualityAdjustedLogit = o.logit * activeAttention.avgSignal;
      return Math.exp(qualityAdjustedLogit / Math.max(temperature, 0.01));
    });

    const sumExponents = exponents.reduce((a, b) => a + b, 0);
    
    return outputs.map((o, i) => ({
      ...o,
      probability: exponents[i] / sumExponents,
      // Risiko steigt, wenn Signalqualität niedrig ODER Temp/Noise hoch
      isCritical: (o.hallucination_risk > 0.7) || (activeAttention.avgSignal < 0.6)
    }));
  }, [activeScenario, temperature, activeAttention.avgSignal]);

  const resetParameters = () => {
    setNoise(0);
    setPositionWeight(0);
    setTemperature(1.0);
    setMlpThreshold(0.5);
  };

  return {
    phase_0_tokenization: activeScenario?.phase_0_tokenization,
    processedVectors,
    activeAttention, // Neu: Für Phase 2 Nutzung
    activeFFN,
    finalOutputs,
    noise, setNoise,
    temperature, setTemperature,
    activeProfileId, setActiveProfileId,
    mlpThreshold, setMlpThreshold,
    positionWeight, setPositionWeight,
    resetParameters
  };
};