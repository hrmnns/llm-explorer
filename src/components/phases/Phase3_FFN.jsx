import React, { useState, useMemo, useEffect } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase3_FFN = ({ simulator, setHoveredItem, theme, activeScenario }) => {

  // 1. Hooks auf oberster Ebene
  // Wir extrahieren nur noch die berechneten Werte und den MLP-Filter
  const {
    mlpThreshold,
    setMlpThreshold,
    activeFFN,
    activeAttention
  } = simulator;

  const [selectedLabel, setSelectedLabel] = useState(null);

  // Status-Badges berechnen (basierend auf dem Signal aus Phase 2)
  const pipelineSignal = activeAttention?.avgSignal || 1.0;
  const isDegraded = pipelineSignal < 0.7;
  const isCritical = pipelineSignal < 0.4;

  // 2. Hilfsfunktion für den Inspektor
  const getInspectorData = (cat) => ({
    title: `🧠 Wissens-Extraktion: ${cat.label || cat.id}`,
    subtitle: `Resonanz auf Phase 2 Heads`,
    data: {
      "Status": cat.isActive ? "AKTIVIERT" : "UNTERDRÜCKT",
      "Gesteuert über": `Head ${cat.linked_head}`,
      "--- Mathematik": "---",
      "Netz-Spannung": (cat.activation * 100).toFixed(1) + "%",
      "MLP-Gate": mlpThreshold.toFixed(2)
    }
  });

  // Ermittlung der dominanten Kategorie für das Badge
  const activeCategoryLabel = useMemo(() => {
    if (!activeFFN || activeFFN.length === 0) return "Keine Daten";
    const sorted = [...activeFFN].sort((a, b) => b.activation - a.activation);
    const top = sorted[0];
    return (top && top.activation >= mlpThreshold) ? (top.label || top.id) : "Keine Dominanz";
  }, [activeFFN, mlpThreshold]);

  // Effekt: Sync zum Inspektor bei Auswahl oder Hover
  useEffect(() => {
    if (selectedLabel) {
      const cat = activeFFN.find(c => (c.label || c.id) === selectedLabel);
      if (cat) setHoveredItem(getInspectorData(cat));
    }
  }, [activeFFN, mlpThreshold, selectedLabel, setHoveredItem]);

  // 3. RENDERING
  return (
    <PhaseLayout
      title="Phase 3: FFN Knowledge Mapping"
      subtitle="Mustererkennung & Kategorisierung (Live-Engine)"
      theme={theme}
      badges={[
        { text: `Fokus: ${activeCategoryLabel}`, className: isCritical ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400" },
        { text: `Signal: ${(pipelineSignal * 100).toFixed(0)}%`, className: isDegraded ? "text-orange-400" : "text-slate-500" }
      ]}
      visualization={
        <div className="w-full h-full flex flex-col justify-center items-center py-4" onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-6 relative">
            {activeFFN && activeFFN.map((cat) => {
              const label = cat.label || cat.id;
              const isSelected = selectedLabel === label;
              const baseColor = cat.color || "#3b82f6";
              
              // Styles basierend auf der Live-Aktivierung aus dem Hook
              const dynamicStyles = {
                borderColor: !cat.isActive ? (theme === 'light' ? '#e2e8f0' : 'rgba(255,255,255,0.05)') : baseColor,
                backgroundColor: !cat.isActive ? (theme === 'light' ? '#f8fafc' : 'rgba(15, 23, 42, 0.4)') : `${baseColor}15`,
                color: !cat.isActive ? (theme === 'light' ? '#cbd5e1' : 'rgba(255,255,255,0.2)') : baseColor,
                boxShadow: cat.isActive ? `0 10px 15px -3px ${baseColor}33` : 'none'
              };

              return (
                <div key={cat.id || label} style={dynamicStyles}
                  onMouseEnter={() => !selectedLabel && setHoveredItem(getInspectorData(cat))}
                  onMouseLeave={() => !selectedLabel && setHoveredItem(null)}
                  className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-500 cursor-pointer overflow-hidden ${isSelected ? 'ring-2 ring-blue-500 scale-105 z-20' : 'z-10'}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedLabel(isSelected ? null : label); }}
                >
                  {/* Visualisierung der Füllmenge (Aktivierungsgrad) */}
                  <div className="absolute bottom-0 left-0 w-full transition-all duration-1000 opacity-10 pointer-events-none"
                    style={{ height: `${cat.activation * 100}%`, backgroundColor: 'currentColor' }} />
                  
                  <div className="z-10 text-[10px] font-black uppercase tracking-widest text-center px-2">{label}</div>
                  <div className="z-10 text-[9px] font-mono mt-2 opacity-60">{(cat.activation * 100).toFixed(0)}% Active</div>
                </div>
              );
            })}
          </div>
        </div>
      }
      controls={
        <div className="col-span-full px-6 py-4 bg-slate-900/80 rounded-xl border border-white/5 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-3">
            <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest">MLP Filter (Threshold)</label>
            <div className="text-sm font-mono font-black text-blue-400">{mlpThreshold.toFixed(2)}</div>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={mlpThreshold} onChange={(e) => setMlpThreshold(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
        </div>
      }
    />
  );
};

export default Phase3_FFN;