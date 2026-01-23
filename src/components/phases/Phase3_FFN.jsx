import React, { useState, useMemo, useEffect } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase3_FFN = ({ simulator, setHoveredItem, theme, activeScenario }) => {

  const {
    mlpThreshold,
    setMlpThreshold,
    activeFFN,
    activeAttention
  } = simulator;

  const [selectedLabel, setSelectedLabel] = useState(null);

  const pipelineSignal = activeAttention?.avgSignal || 0.0; // Fallback auf 0, wenn kein Signal
  const isDegraded = pipelineSignal < 0.7;
  const isCritical = pipelineSignal < 0.4;

  // Hilfsfunktion zur Berechnung der realen Stärke unter Berücksichtigung von Phase 2
  const getEffectiveActivation = (cat) => {
    return (cat.activation || 0) * pipelineSignal;
  };

  const getInspectorData = (cat) => {
    const scenarioData = activeScenario?.phase_3_ffn?.activations?.find(a => a.id === cat.id);
    const explanation = scenarioData?.explanation || `Dieses Cluster repräsentiert gelerntes Wissen im MLP-Layer. Es wird durch Head ${cat.linked_head} angesteuert.`;
    const effAct = getEffectiveActivation(cat);

    return {
      title: `🧠 Wissens-Extraktion: ${cat.label || cat.id}`,
      subtitle: `Resonanz-Analyse des Feed-Forward-Layers`,
      data: {
        "Status": effAct >= mlpThreshold ? "DOMINANT (Passiert)" : (effAct > 0.1 ? "UNTERDRÜCKT (Gated)" : "INAKTIV"),
        "Steuerung": `Attention Head ${cat.linked_head}`,
        "--- Mathematik": "---",
        "Roh-Aktivierung": (cat.activation * 100).toFixed(1) + "%",
        "Pipeline-Signal": (pipelineSignal * 100).toFixed(0) + "%",
        "Effektive Stärke": (effAct * 100).toFixed(1) + "%",
        "Filter-Limit": mlpThreshold.toFixed(2),
        
        "--- KI-Begründung": "---",
        "Information": pipelineSignal < 0.1 
          ? "Kein Signal aus Phase 2 (Attention) vorhanden. Die Wissensextraktion ist blockiert." 
          : explanation
      }
    };
  };

  const activeCategoryLabel = useMemo(() => {
    if (!activeFFN || activeFFN.length === 0) return "Keine Daten";
    
    // Sortiere nach effektiver Aktivierung (Basis * Signal)
    const sorted = [...activeFFN].sort((a, b) => getEffectiveActivation(b) - getEffectiveActivation(a));
    const top = sorted[0];
    const effAct = top ? getEffectiveActivation(top) : 0;
    
    return (effAct >= mlpThreshold) ? (top.label || top.id) : "Gefiltert";
  }, [activeFFN, mlpThreshold, pipelineSignal]);

  useEffect(() => {
    if (selectedLabel) {
      const cat = activeFFN.find(c => (c.label || c.id) === selectedLabel);
      if (cat) setHoveredItem(getInspectorData(cat));
    }
  }, [activeFFN, mlpThreshold, selectedLabel, setHoveredItem, pipelineSignal]);

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
        <div className="w-full h-full flex flex-col justify-center items-center py-4" onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-6 relative">
            {activeFFN && activeFFN.map((cat) => {
              const label = cat.label || cat.id;
              const isSelected = selectedLabel === label;
              const baseColor = cat.color || "#3b82f6";
              
              // Hier die entscheidende Logik-Verknüpfung
              const effAct = getEffectiveActivation(cat);
              const isPassed = effAct >= mlpThreshold;
              const isActuallyActive = cat.isActive && pipelineSignal > 0.05;
              
              const dynamicStyles = {
                borderColor: !isActuallyActive ? (theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.05)') : baseColor,
                backgroundColor: !isActuallyActive ? (theme === 'light' ? '#f8fafc' : 'rgba(15, 23, 42, 0.4)') : `${baseColor}10`,
                color: !isActuallyActive ? (theme === 'light' ? '#cbd5e1' : 'rgba(255,255,255,0.2)') : baseColor,
                boxShadow: (isActuallyActive && isPassed) ? `0 0 25px ${baseColor}44` : 'none',
                opacity: (isPassed && pipelineSignal > 0) ? 1 : 0.4
              };

              return (
                <div key={cat.id || label} style={dynamicStyles}
                  onMouseEnter={() => !selectedLabel && setHoveredItem(getInspectorData(cat))}
                  onMouseLeave={() => !selectedLabel && setHoveredItem(null)}
                  className={`relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-500 cursor-pointer overflow-hidden ${isSelected ? 'ring-2 ring-blue-500 scale-105 z-20' : 'z-10'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedLabel(isSelected ? null : label); }}
                >
                  {/* Progress-Fill zeigt nun die effektive Stärke */}
                  <div className="absolute bottom-0 left-0 w-full transition-all duration-700 opacity-20 pointer-events-none"
                    style={{ height: `${effAct * 100}%`, backgroundColor: 'currentColor' }} />
                  
                  <div className="absolute top-3 right-3 text-xs">
                    {isPassed && isActuallyActive ? "✅" : (isActuallyActive ? "🚫" : "")}
                  </div>

                  <div className="z-10 text-[11px] font-black uppercase tracking-[0.2em] text-center px-2">{label}</div>
                  <div className={`z-10 text-[9px] font-mono mt-2 ${isPassed ? 'opacity-100' : 'opacity-40'}`}>
                    {isPassed ? "Signal Passed" : (pipelineSignal <= 0.05 ? "No Input Signal" : "Below Threshold")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
      controls={
        <div className="col-span-full px-6 py-4 bg-slate-900/80 rounded-2xl border border-white/5" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <label className="text-[9px] uppercase font-black text-blue-500 tracking-widest">MLP Activation Threshold</label>
              <span className="text-[10px] text-slate-500 italic">Filtert schwache Assoziationen und Rauschen</span>
            </div>
            <div className="text-sm font-mono font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded">{mlpThreshold.toFixed(2)}</div>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={mlpThreshold} onChange={(e) => setMlpThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
        </div>
      }
    />
  );
};

export default Phase3_FFN;