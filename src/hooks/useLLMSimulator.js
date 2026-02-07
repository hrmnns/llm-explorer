import { useState, useMemo, useEffect, useRef } from 'react';
import { LLMEngine } from '../core/LLMEngine';

export const useLLMSimulator = (activeScenario) => {
  // 1. React State für UI-Kontrollen (Source of Truth für die UI)
  const [noise, setNoise] = useState(0);
  const [temperature, setTemperature] = useState(0.7);
  const [activeProfileId, setActiveProfileId] = useState('scientific');
  const [mlpThreshold, setMlpThreshold] = useState(0.5);
  const [positionWeight, setPositionWeight] = useState(0);
  const [headOverrides, setHeadOverrides] = useState({});
  const [selectedToken, setSelectedToken] = useState(null);

  // 2. Instanziere die Engine (persistent über Renders hinweg)
  const engineRef = useRef(new LLMEngine({
    noise,
    temperature,
    activeProfileId,
    mlpThreshold,
    positionWeight,
    headOverrides
  }));

  const engine = engineRef.current;

  // 3. Synchronisiere React State -> Engine Config
  useEffect(() => {
    engine.updateConfig({
      noise,
      temperature,
      activeProfileId,
      mlpThreshold,
      positionWeight,
      headOverrides
    });
  }, [noise, temperature, activeProfileId, mlpThreshold, positionWeight, headOverrides]);


  // 4. Pipeline-Ausführung (Memoized, damit nicht unnötig gerechnet wird)
  // Wir nutzen useMemo hier als "Computation Layer", der getriggert wird, wenn sich Inputs ändern.
  const pipelineResult = useMemo(() => {
    if (!activeScenario) return null;

    // Wir übergeben das Szenario. Die Config ist bereits via useEffect (oder hier direkt) aktuell.
    // Sicherheitshalber updaten wir hier nochmal explizit vor der Berechnung, 
    // falls React-Batching den useEffect verzögert hat.
    engine.updateConfig({
      noise,
      temperature,
      activeProfileId,
      mlpThreshold,
      positionWeight,
      headOverrides
    });

    return engine.runPipeline(activeScenario);
  }, [
    activeScenario,
    noise,
    temperature,
    activeProfileId,
    mlpThreshold,
    positionWeight,
    headOverrides
  ]);

  // 5. Helper & Utilities für die UI
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

  // 6. Initialer Reset bei Szenario-Wechsel
  useEffect(() => {
    if (activeScenario) {
      resetParameters();
    }
  }, [activeScenario?.id]);


  // Return API
  return {
    // Daten aus der Pipeline
    phase_0_tokenization: activeScenario?.phase_0_tokenization,
    processedVectors: pipelineResult?.processedVectors || [],
    activeAttention: pipelineResult?.activeAttention || { avgSignal: 1.0, profiles: [] },
    activeFFN: pipelineResult?.activeFFN || [],
    finalOutputs: pipelineResult?.finalOutputs || [],

    // Controls & State
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