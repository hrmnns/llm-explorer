import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import PhaseLayout from './../PhaseLayout';
import { useScenarios } from '../../context/ScenarioContext';

const Phase3_FFN = ({ simulator, setHoveredItem, theme }) => {
  // Wir nutzen den Hook für konsistenten Zugriff auf das Szenario
  const { activeScenario } = useScenarios();

  const {
    mlpThreshold,
    setMlpThreshold,
    activeFFN,
    activeAttention,
    noise // Genutzt für Goal-Seek Detektion
  } = simulator;

  const [selectedLabel, setSelectedLabel] = useState(null);
  const lastScenarioId = useRef(activeScenario?.id);

  const pipelineSignal = activeAttention?.avgSignal || 0.0;
  const isDegraded = pipelineSignal < 0.7;
  const isCritical = pipelineSignal < 0.4;

  const getEffectiveActivation = useCallback((cat) => {
    return (cat.activation || 0) * pipelineSignal;
  }, [pipelineSignal]);

  // --- Szenario-Reset Logik ---
  useEffect(() => {
    if (activeScenario?.id !== lastScenarioId.current) {
      setSelectedLabel(null);
      setHoveredItem(null);
      lastScenarioId.current = activeScenario?.id;
    }
  }, [activeScenario?.id, setHoveredItem]);

  // --- SYNC-EFFEKT FÜR GOAL-SEEKING ---
  const topCategory = useMemo(() => {
    if (!activeFFN || activeFFN.length === 0) return null;
    return [...activeFFN].sort((a, b) => getEffectiveActivation(b) - getEffectiveActivation(a))[0];
  }, [activeFFN, getEffectiveActivation]);

  useEffect(() => {
    // Wenn Noise 0 ist (Goal-Seek aktiv durch Phase 4)
    if (noise === 0 && topCategory) {
      const effAct = getEffectiveActivation(topCategory);
      if (effAct >= mlpThreshold) {
        const label = topCategory.label || topCategory.id;
        if (selectedLabel !== label) {
          setSelectedLabel(label);
        }
      }
    }
  }, [noise, topCategory, mlpThreshold, selectedLabel, getEffectiveActivation]);

  const getInspectorData = useCallback((cat) => {
    const scenarioData = activeScenario?.phase_3_ffn?.activations?.find(a => a.id === cat.id);
    const explanation = scenarioData?.explanation || `Dieses Cluster repräsentiert gelerntes Wissen. Angesteuert durch Head ${cat.linked_head}.`;
    const effAct = getEffectiveActivation(cat);

    return {
      title: `🧠 Wissen: ${cat.label || cat.id}`,
      subtitle: `Resonanz-Analyse des MLP-Layers`,
      data: {
        "Status": effAct >= mlpThreshold ? "DOMINANT (Passiert)" : (effAct > 0.1 ? "UNTERDRÜCKT (Gated)" : "INAKTIV"),
        "Kausalität": `Triggered by Attention Head ${cat.linked_head}`,
        "--- Mathematik": "---",
        "Roh-Aktivierung": (cat.activation * 100).toFixed(1) + "%",
        "Signal-Integrität": (pipelineSignal * 100).toFixed(0) + "%",
        "Finale Stärke": (effAct * 100).toFixed(1) + "%",
        "Threshold-Cutoff": mlpThreshold.toFixed(2),
        "--- Analyse": "---",
        "Info": pipelineSignal < 0.1 
          ? "Blockiert: Kein ausreichendes Signal aus Phase 2." 
          : explanation
      }
    };
  }, [activeScenario, pipelineSignal, mlpThreshold, getEffectiveActivation]);

  useEffect(() => {
    if (selectedLabel) {
      const cat = activeFFN?.find(c => (c.label || c.id) === selectedLabel);
      if (cat) setHoveredItem(getInspectorData(cat));
    }
  }, [activeFFN, selectedLabel, getInspectorData, setHoveredItem]);

  const activeCategoryLabel = useMemo(() => {
    if (!topCategory) return "Standby";
    const effAct = getEffectiveActivation(topCategory);
    return (effAct >= mlpThreshold) ? (topCategory.label || topCategory.id) : "Gefiltert";
  }, [topCategory, mlpThreshold, getEffectiveActivation]);

  return (
    <PhaseLayout
      title="Phase 3: FFN Knowledge Mapping"
      subtitle="Transformation von Aufmerksamkeit in semantische Kategorien"
      theme={theme}
      badges={[
        { text: `Aktiv: ${activeCategoryLabel}`, className: isCritical ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400" },
        { text: `Integrität: ${(pipelineSignal * 100).toFixed(0)}%`, className: isDegraded ? "text-orange-400" : "text-blue-400" }
      ]}
      visualization={
        <div className="w-full h-full flex flex-col justify-center items-center py-4" 
             onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl px-6 relative">
            {activeFFN && activeFFN.map((cat) => {
              const label = cat.label || cat.id;
              const isSelected = selectedLabel === label;
              const baseColor = cat.color || "#3b82f6";
              
              const effAct = getEffectiveActivation(cat);
              const isPassed = effAct >= mlpThreshold;
              const isActuallyActive = cat.isActive && pipelineSignal > 0.05;
              
              const dynamicStyles = {
                borderColor: !isActuallyActive ? 'rgba(255,255,255,0.05)' : (isPassed ? baseColor : `${baseColor}44`),
                backgroundColor: isActuallyActive ? `${baseColor}05` : 'transparent',
                color: !isActuallyActive ? 'rgba(255,255,255,0.2)' : (isPassed ? 'white' : baseColor),
                boxShadow: (isActuallyActive && isPassed) ? `0 0 40px ${baseColor}33, inset 0 0 20px ${baseColor}11` : 'none',
                opacity: isActuallyActive ? 1 : 0.3,
                transform: isSelected ? 'scale(1.05)' : 'scale(1)'
              };

              return (
                <div key={cat.id || label}
                  style={dynamicStyles}
                  onMouseEnter={() => !selectedLabel && setHoveredItem(getInspectorData(cat))}
                  onMouseLeave={() => !selectedLabel && setHoveredItem(null)}
                  onClick={(e) => { e.stopPropagation(); setSelectedLabel(isSelected ? null : label); }}
                  className={`relative flex flex-col items-center justify-center p-10 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden ${isSelected ? 'z-20' : 'z-10'}`}
                >
                  {/* Aktivierungs-Balken im Hintergrund */}
                  <div className="absolute bottom-0 left-0 w-full transition-all duration-1000 opacity-20 pointer-events-none"
                    style={{ height: `${effAct * 100}%`, backgroundColor: baseColor }} />
                  
                  {/* Status-Icon */}
                  <div className="absolute top-4 right-5 text-lg">
                    {isPassed && isActuallyActive ? "✅" : (isActuallyActive ? "🚫" : "")}
                  </div>

                  <div className="z-10 text-[12px] font-black uppercase tracking-[0.25em] text-center">{label}</div>
                  
                  <div className={`z-10 text-[9px] font-mono mt-3 px-3 py-1 rounded-full ${isPassed ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-500'}`}>
                    {isPassed ? "Kausalität aktiv" : (pipelineSignal <= 0.05 ? "Kein Input" : "Gating aktiv")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
      controls={
        <div className="col-span-full px-8 py-6 bg-slate-900/50 rounded-[2rem] border border-white/5 shadow-2xl" 
             onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black text-blue-500 tracking-[0.15em]">MLP Activation Threshold</label>
              <span className="text-[11px] text-slate-500 italic">Unterdrückt Rauschen und schwache neuronale Pfade</span>
            </div>
            <div className="text-xl font-mono font-black text-blue-400 bg-blue-500/10 px-4 py-1 rounded-xl border border-blue-500/20">
              {mlpThreshold.toFixed(2)}
            </div>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={mlpThreshold} 
            onChange={(e) => setMlpThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
        </div>
      }
    />
  );
};

export default Phase3_FFN;