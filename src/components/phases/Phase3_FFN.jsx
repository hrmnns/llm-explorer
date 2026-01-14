import React, { useState, useMemo, useEffect } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase3_FFN = ({ simulator, setHoveredItem, theme }) => {
  const { mlpThreshold, setMlpThreshold, activeFFN, activeAttention } = simulator;
  const [selectedLabel, setSelectedLabel] = useState(null);

  // Extraktion der Pipeline-Integrität
  const pipelineSignal = activeAttention?.avgSignal || 1.0;
  const isDegraded = pipelineSignal < 0.7;
  const isCritical = pipelineSignal < 0.4;

  if (!activeFFN || activeFFN.length === 0) {
    return <div className="p-10 text-center text-slate-500 animate-pulse font-mono text-xs">Warte auf Aktivierungsdaten der Neuronen-Matrix...</div>;
  }

  const activeCategory = useMemo(() => {
    return activeFFN.find(cat => cat.isActive)?.label || "Keine Dominanz";
  }, [activeFFN]);

  const colorMap = {
    "Wissenschaftlich": "border-blue-500 shadow-blue-500/20 text-blue-400 bg-blue-500/5",
    "Scientific": "border-blue-500 shadow-blue-500/20 text-blue-400 bg-blue-500/5",
    "Sozial": "border-green-500 shadow-green-500/20 text-green-400 bg-green-500/5",
    "Social": "border-green-500 shadow-green-500/20 text-green-400 bg-green-500/5",
    "Poetisch": "border-purple-500 shadow-purple-500/20 text-purple-400 bg-purple-500/5",
    "Poetic": "border-purple-500 shadow-purple-500/20 text-purple-400 bg-purple-500/5",
    "Evolutionär": "border-orange-500 shadow-orange-500/20 text-orange-400 bg-orange-500/5",
    "Ancestral": "border-orange-500 shadow-orange-500/20 text-orange-400 bg-orange-500/5"
  };

  const getInspectorData = (cat) => ({
    title: `🧠 Wissens-Extraktion: ${cat.label}`,
    subtitle: `Pipeline-Integrität: ${(pipelineSignal * 100).toFixed(0)}%`,
    data: {
      "--- Mechanik": "---",
      "Status": cat.isActive ? "AKTIVIERT" : "UNTERDRÜCKT",
      "Signal-Einfluss": isCritical ? "KRITISCH (Rauschen)" : isDegraded ? "GEDÄMPFT" : "OPTIMAL",
      "--- Mathematik": "---",
      "Netz-Spannung": (cat.activation * 100).toFixed(1) + "%",
      "Basis-Aktivierung": ((cat.activation / (pipelineSignal || 0.01)) * 100).toFixed(0) + "%",
      "--- Erkenntnis": "---",
      "Information": cat.isActive 
        ? `Das FFN-Netzwerk erkennt das Muster. Durch die Signalqualität von ${(pipelineSignal * 100).toFixed(0)}% ist die Zuordnung zum Cluster "${cat.label}" ${isCritical ? 'extrem unsicher' : 'stabil'}.` 
        : `Die Energie reicht nicht aus, um den MLP-Filter zu passieren.`
    }
  });

  useEffect(() => {
    if (selectedLabel) {
      const cat = activeFFN.find(c => c.label === selectedLabel);
      if (cat) setHoveredItem(getInspectorData(cat));
    }
  }, [activeFFN, mlpThreshold, selectedLabel, setHoveredItem, pipelineSignal]);

  const handleCategoryClick = (cat, e) => {
    e.stopPropagation();
    if (selectedLabel === cat.label) {
      setSelectedLabel(null);
      setHoveredItem(null);
    } else {
      setSelectedLabel(cat.label);
      setHoveredItem(getInspectorData(cat));
    }
  };

  return (
    <PhaseLayout
      title="Phase 3: FFN Knowledge Mapping"
      subtitle="Mustererkennung & Kategorisierung"
      theme={theme}
      badges={[
        { text: `Fokus: ${activeCategory}`, className: isCritical ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400" },
        { text: `Signal: ${(pipelineSignal * 100).toFixed(0)}%`, className: isDegraded ? "text-orange-400" : "text-slate-500" }
      ]}
      visualization={
        <div 
          className="w-full h-full flex flex-col justify-center items-center py-4"
          onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}
        >
          {/* Warn-Overlay bei kritischem Signal */}
          {isCritical && (
            <div className="absolute top-4 text-[10px] font-black text-red-500 animate-pulse z-50 uppercase tracking-widest">
              ⚠️ High Entropy Interference - Neural Mapping Unstable
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-6 relative">
            {activeFFN.map((cat) => {
              const isSelected = selectedLabel === cat.label;
              
              // Pipeline-Effekt: Flackern bei schlechtem Signal
              const glitchClass = isCritical && cat.isActive ? "animate-pulse skew-x-1" : "";
              
              return (
                <div
                  key={cat.label}
                  className={`
                    relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-500 cursor-pointer overflow-hidden
                    ${cat.isActive
                      ? `${colorMap[cat.label] || 'border-blue-500'} opacity-100 shadow-xl`
                      : 'border-white/5 bg-slate-900/40 opacity-20 grayscale'
                    }
                    ${isSelected ? 'ring-2 ring-white scale-105 z-20' : 'z-10 hover:border-slate-500'}
                    ${glitchClass}
                  `}
                  onMouseEnter={() => setHoveredItem(getInspectorData(cat))}
                  onMouseLeave={() => !selectedLabel && setHoveredItem(null)}
                  onClick={(e) => handleCategoryClick(cat, e)}
                >
                  {/* Progress-Fill im Hintergrund */}
                  <div
                    className="absolute bottom-0 left-0 w-full transition-all duration-1000 opacity-10 pointer-events-none"
                    style={{
                      height: `${cat.activation * 100}%`,
                      backgroundColor: 'currentColor',
                      filter: isDegraded ? `blur(${5 * (1 - pipelineSignal)}px)` : 'none'
                    }}
                  />

                  <div className={`z-10 text-[10px] font-black uppercase tracking-widest text-center px-2 ${isCritical && cat.isActive ? 'blur-[0.5px]' : ''}`}>
                    {cat.label}
                  </div>

                  <div className="z-10 text-[9px] font-mono mt-2 opacity-60">
                    {(cat.activation * 100).toFixed(0)}% Active
                  </div>

                  {/* Icons mit Pipeline-Reaktion */}
                  {cat.isActive && (
                    <div className={`absolute top-4 right-4 text-xl transition-all duration-500 ${isCritical ? 'rotate-12 scale-150' : ''}`}>
                      {(cat.label.includes("Wissenschaft") || cat.label.includes("Scientific")) && "🔬"}
                      {(cat.label.includes("Sozial") || cat.label.includes("Social")) && "🤝"}
                      {(cat.label.includes("Poetisch") || cat.label.includes("Poetic")) && "✨"}
                      {(cat.label.includes("Evolution") || cat.label.includes("Ancestral")) && "🦴"}
                    </div>
                  )}
                  
                  <div className={`absolute top-4 left-4 w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-current shadow-[0_0_10px_currentColor]' : 'bg-slate-800'}`} />
                </div>
              );
            })}
          </div>
        </div>
      }
      controls={
        <div className="col-span-full px-6 py-4 bg-slate-900/80 rounded-xl border border-white/5 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-3">
            <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest">
              MLP Filter (Threshold)
            </label>
            <div className="text-sm font-mono font-black text-blue-400">
              {mlpThreshold.toFixed(2)}
            </div>
          </div>
          <input
            type="range" min="0" max="1" step="0.01"
            value={mlpThreshold}
            onChange={(e) => setMlpThreshold(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between mt-2 text-[7px] font-bold text-slate-600 uppercase tracking-tighter">
            <span className={isCritical ? "text-red-500 animate-pulse" : ""}>High Entropy (Chaos)</span>
            <span>Deterministic (Strict)</span>
          </div>
        </div>
      }
    />
  );
};

export default Phase3_FFN;