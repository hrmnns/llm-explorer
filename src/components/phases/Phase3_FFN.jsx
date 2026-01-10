import React, { useState, useMemo, useEffect } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase3_FFN = ({ simulator, setHoveredItem, theme }) => {
  const { mlpThreshold, setMlpThreshold, activeFFN } = simulator;
  const [selectedLabel, setSelectedLabel] = useState(null);

  if (!activeFFN || activeFFN.length === 0) {
    return <div className="p-10 text-center text-slate-500 animate-pulse">Warte auf Aktivierungsdaten...</div>;
  }

  const activeCategory = useMemo(() => {
    return activeFFN.find(cat => cat.isActive)?.label || "Neutral";
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
    title: `Wissens-Cluster: ${cat.label}`,
    subtitle: "FFN Aktivierung",
    data: {
      "Netz-Aktivierung": (cat.activation * 100).toFixed(1) + "%",
      "MLP-Filter": mlpThreshold.toFixed(2),
      "Status": cat.isActive ? "Aktiviert" : "Gefiltert",
      "Input-Quelle": "Feed-Forward-Network",
      "Vektorklasse": cat.label
    }
  });

  // Reagiert auf Änderungen am Schwellenwert für das bereits selektierte Element
  useEffect(() => {
    if (selectedLabel) {
      const cat = activeFFN.find(c => c.label === selectedLabel);
      if (cat) setHoveredItem(getInspectorData(cat));
    }
  }, [activeFFN, mlpThreshold]);

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

  const handleMouseEnter = (cat) => {
    // Zeige immer das Element an, über dem die Maus gerade schwebt
    setHoveredItem(getInspectorData(cat));
  };

  const handleMouseLeave = () => {
    if (selectedLabel) {
      // Wenn etwas markiert ist, springe zur Markierung zurück
      const selectedCat = activeFFN.find(c => c.label === selectedLabel);
      if (selectedCat) setHoveredItem(getInspectorData(selectedCat));
    } else {
      // Wenn nichts markiert ist, leere den Inspektor
      setHoveredItem(null);
    }
  };

  return (
    <PhaseLayout
      title="Phase 3: Feed-Forward Network (FFN)"
      subtitle="Wissens-Aktivierung & MLP-Processing"
      theme={theme}
      badges={[
        { text: `Fokus: ${activeCategory}`, className: "border-blue-500/30 text-blue-400 bg-blue-500/5" },
        { text: `Filter: ${mlpThreshold.toFixed(2)}`, className: "border-slate-500/30 text-slate-500 bg-white/5" }
      ]}
      visualization={
        <div 
          className="w-full h-full flex flex-col justify-center items-center py-4"
          onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
            {activeFFN.map((cat) => {
              const isSelected = selectedLabel === cat.label;
              return (
                <div
                  key={cat.label}
                  className={`
                    relative flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all duration-500 cursor-pointer overflow-hidden
                    ${cat.isActive
                      ? `${colorMap[cat.label] || 'border-blue-500'} opacity-100 shadow-xl`
                      : 'border-white/5 bg-slate-900/20 opacity-20 text-slate-600 grayscale'
                    }
                    ${isSelected ? 'ring-2 ring-white ring-offset-4 ring-offset-slate-950 scale-105 z-20' : 'z-10'}
                  `}
                  onMouseEnter={() => handleMouseEnter(cat)}
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => handleCategoryClick(cat, e)}
                >
                  <div
                    className="absolute bottom-0 left-0 w-full transition-all duration-1000 opacity-10 pointer-events-none"
                    style={{
                      height: `${cat.activation * 100}%`,
                      backgroundColor: 'currentColor'
                    }}
                  />

                  <div className="z-10 text-xs font-black uppercase tracking-widest text-center px-2">
                    {cat.label}
                  </div>

                  <div className="z-10 text-[9px] font-mono mt-1 opacity-60">
                    {(cat.activation * 100).toFixed(0)}% Power
                  </div>

                  {cat.isActive && (
                    <div className="absolute top-3 right-3 animate-pulse text-lg">
                      {cat.label.includes("Wissenschaft") || cat.label.includes("Scientific") ? "🔬" : ""}
                      {cat.label.includes("Sozial") || cat.label.includes("Social") ? "🤝" : ""}
                      {cat.label.includes("Poetisch") || cat.label.includes("Poetic") ? "✨" : ""}
                      {cat.label.includes("Evolution") || cat.label.includes("Ancestral") ? "🦴" : ""}
                    </div>
                  )}
                  
                  <div className={`absolute top-3 left-3 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-400 animate-ping' : (cat.isActive ? 'bg-current opacity-40' : 'bg-slate-800')}`} />
                </div>
              );
            })}
          </div>
        </div>
      }
      controls={
        <div className="col-span-full px-4 py-3 bg-slate-900/80 rounded-lg border border-white/5" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest leading-none">
              Aktivierungsschwelle (MLP-Threshold)
            </label>
            <div className="text-[10px] font-mono font-black text-blue-400">
              {mlpThreshold.toFixed(2)}
            </div>
          </div>
          <input
            type="range" min="0" max="1" step="0.05"
            value={mlpThreshold}
            onChange={(e) => setMlpThreshold(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      }
    />
  );
};

export default Phase3_FFN;