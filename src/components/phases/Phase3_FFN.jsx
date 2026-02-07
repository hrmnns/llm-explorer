import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import PhaseLayout from './../PhaseLayout';


const Phase3_FFN = ({
  mlpThreshold,
  setMlpThreshold,
  activeFFN = [],
  activeAttention = { avgSignal: 1.0 },
  noise,
  scenarioId,
  theme,
  setHoveredItem,
  resetKey
}) => {
  // Removed useScenarios import

  const [selectedLabel, setSelectedLabel] = useState(null);
  const lastScenarioId = useRef(scenarioId);

  const pipelineSignal = activeAttention?.avgSignal || 0.0;
  const isDegraded = pipelineSignal < 0.7;
  const isCritical = pipelineSignal < 0.4;

  const getEffectiveActivation = useCallback((cat) => {
    return (cat.activation || 0) * pipelineSignal;
  }, [pipelineSignal]);

  useEffect(() => {
    setSelectedLabel(null);
    setHoveredItem(null);
  }, [resetKey, setHoveredItem]);

  useEffect(() => {
    if (scenarioId !== lastScenarioId.current) {
      setSelectedLabel(null);
      setHoveredItem(null);
      lastScenarioId.current = scenarioId;
    }
  }, [scenarioId, setHoveredItem]);

  const topCategory = useMemo(() => {
    if (!activeFFN || activeFFN.length === 0) return null;
    return [...activeFFN].sort((a, b) => getEffectiveActivation(b) - getEffectiveActivation(a))[0];
  }, [activeFFN, getEffectiveActivation]);

  useEffect(() => {
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
    // The activeFFN items should contain the original scenario data properties like explanation
    // distinct from the dynamic activation.
    // If not, we might need access to the raw scenario.
    // But typically our LLMEngine merges everything.
    // Let's check LLMEngine:
    // computeFFN map: { ...cat, activation: ..., isActive: ... }
    // So 'cat' here has all properties from the scenario JSON.
    const explanation = cat.explanation || `Dieses Cluster repräsentiert gelerntes Wissen. Angesteuert durch Head ${cat.linked_head}.`;
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
  }, [pipelineSignal, mlpThreshold, getEffectiveActivation]);

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
        { text: `Aktiv: ${activeCategoryLabel}`, className: isCritical ? "bg-error/20 text-error border-error/20" : "bg-success/20 text-success border-success/20" },
        { text: `Integrität: ${(pipelineSignal * 100).toFixed(0)}%`, className: isDegraded ? "text-warning" : "text-primary" }
      ]}
      visualization={
        <div className="w-full h-full flex flex-col justify-center items-center py-4 bg-explore-viz rounded-lg"
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
                borderColor: !isActuallyActive ? 'var(--color-explore-border)' : (isPassed ? baseColor : `${baseColor}66`),
                backgroundColor: isActuallyActive ? `var(--color-explore-nav)` : 'transparent',
                color: !isActuallyActive ? 'var(--color-content-dim)' : (isPassed ? 'var(--color-content-main)' : baseColor),
                boxShadow: (isActuallyActive && isPassed) ? `0 0 30px ${baseColor}22, inset 0 0 15px ${baseColor}05` : 'none',
                opacity: isActuallyActive ? 1 : 0.4,
                transform: isSelected ? 'scale(1.03)' : 'scale(1)'
              };

              return (
                <div key={cat.id || label}
                  style={dynamicStyles}
                  onMouseEnter={() => setHoveredItem(getInspectorData(cat))}
                  onMouseLeave={() => {
                    if (!selectedLabel) {
                      setHoveredItem(null);
                    } else {
                      const selectedCat = activeFFN.find(c => (c.label || c.id) === selectedLabel);
                      if (selectedCat) setHoveredItem(getInspectorData(selectedCat));
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextLabel = isSelected ? null : label;
                    setSelectedLabel(nextLabel);
                    if (!nextLabel) setHoveredItem(null);
                  }}
                  className={`relative flex flex-col items-center justify-center p-10 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm ${isSelected ? 'z-20 border-primary' : 'z-10'}`}
                >
                  {/* Aktivierungs-Balken im Hintergrund */}
                  <div className="absolute bottom-0 left-0 w-full transition-all duration-1000 opacity-10 pointer-events-none"
                    style={{ height: `${effAct * 100}%`, backgroundColor: baseColor }} />

                  {/* Status-Icon */}
                  <div className="absolute top-4 right-5 text-lg">
                    {isPassed && isActuallyActive ? "✅" : (isActuallyActive ? "🚫" : "")}
                  </div>

                  <div className="z-10 text-[12px] font-black uppercase tracking-[0.25em] text-center">{label}</div>

                  <div className={`z-10 text-[9px] font-mono mt-3 px-3 py-1 rounded-full ${isPassed ? 'bg-success/10 text-success' : 'bg-explore-item text-content-dim'}`}>
                    {isPassed ? "Kausalität aktiv" : (pipelineSignal <= 0.05 ? "Kein Input" : "Gating aktiv")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
      controls={
        <div className="col-span-full px-8 py-6 bg-explore-card rounded-[2rem] border border-explore-border shadow-xl"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-black text-primary tracking-[0.15em]">MLP Activation Threshold</label>
              <span className="text-[11px] text-content-dim italic">Unterdrückt Rauschen und schwache neuronale Pfade</span>
            </div>
            <div className="text-xl font-mono font-black text-primary bg-primary/10 px-4 py-1 rounded-xl border border-primary/20">
              {mlpThreshold.toFixed(2)}
            </div>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={mlpThreshold}
            onChange={(e) => setMlpThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-explore-item rounded-lg appearance-none cursor-pointer accent-primary" />
        </div>
      }
    />
  );
};

export default Phase3_FFN;