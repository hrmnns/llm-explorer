import React, { useState, useEffect, useMemo } from 'react';

const Phase4_Decoding = ({ simulator, setHoveredItem }) => {
  const { temperature, setTemperature, finalOutputs } = simulator;
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [topK, setTopK] = useState(5); 
  const [minPThreshold, setMinPThreshold] = useState(0.07); // Jetzt als State (1% bis 25%)

  const colorMap = {
    "Wissenschaftlich": "#3b82f6",
    "Sozial": "#22c55e",
    "Poetisch": "#a855f7",
    "Evolutionär": "#f97316"
  };

  const sortedOutputs = useMemo(() => {
    return [...finalOutputs]
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 10);
  }, [finalOutputs]);

  const winner = sortedOutputs[0];

  const getInspectorData = (out, index) => {
    const isTopK = index < topK;
    const isAboveThreshold = out.probability >= minPThreshold;
    
    let statusText = "Aktiv";
    let traceExplanation = out.causality_trace || `Aktiviert durch Phase 3 (${out.type}).`;

    if (!isTopK) {
      statusText = "Gefiltert (Top-K)";
      traceExplanation = `Dieses Wort wurde durch den Top-K Filter (${topK}) ausgeschlossen, um den Suchraum zu begrenzen.`;
    } else if (!isAboveThreshold) {
      statusText = "Instabil (Min-P)";
      traceExplanation = `Obwohl unter den Top-${topK}, liegt das Wort unter der aktuellen Qualitäts-Hürde von ${(minPThreshold * 100).toFixed(0)}%. Es wird als statistisches Rauschen gewertet.`;
    }

    return {
      title: `Decoding: ${out.label}`,
      subtitle: "Kausale Rückverfolgung",
      data: {
        "Wahrscheinlichkeit": (out.probability * 100).toFixed(2) + "%",
        "Kategorie": out.type,
        "Status": statusText,
        "Rang": `#${index + 1}`,
        "---": "---",
        "Trace-Analyse": traceExplanation
      }
    };
  };

  useEffect(() => {
    if (selectedLabel) {
      const index = sortedOutputs.findIndex(o => o.label === selectedLabel);
      if (index !== -1) setHoveredItem(getInspectorData(sortedOutputs[index], index));
    }
  }, [sortedOutputs, selectedLabel, setHoveredItem, topK, minPThreshold]);

  const handleSelection = (out, index, e) => {
    e.stopPropagation();
    if (selectedLabel === out.label) {
      setSelectedLabel(null);
      setHoveredItem(null);
    } else {
      setSelectedLabel(out.label);
      setHoveredItem(getInspectorData(out, index));
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white select-none" 
         onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4 text-slate-500 uppercase tracking-[0.2em] text-[10px] font-black">
        <h2>Phase 4: Softmax Decoding</h2>
        <div className="flex gap-2">
            <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 font-mono text-[8px]">K={topK}</span>
            <span className="bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 font-mono text-[8px]">P={(minPThreshold * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Haupt-Diagramm Bereich */}
      <div className="relative flex-1 min-h-[300px] bg-slate-950/40 rounded-[2.5rem] border border-white/5 shadow-inner mb-6 overflow-hidden">
        
        <div className="absolute top-8 left-0 right-0 bottom-12">
          
          {/* --- DYNAMISCHER POSITIONIERTER THRESHOLD --- */}
          <div 
            className="absolute left-0 w-full border-t border-dashed border-red-500/50 z-0 transition-all duration-500"
            style={{ bottom: `${minPThreshold * 100}%` }}
          >
            <div className="absolute right-6 -top-2.5 px-2 py-0.5 bg-slate-900 rounded border border-red-500/30 text-[7px] text-red-500 font-black tracking-widest shadow-xl">
              MIN-P CUT-OFF: {(minPThreshold * 100).toFixed(0)}%
            </div>
          </div>

          {/* Balken-Container */}
          <div className="absolute inset-0 flex items-end justify-around gap-2 px-8">
            {sortedOutputs.map((out, i) => {
              const isTopK = i < topK;
              const isSelected = selectedLabel === out.label;
              const isWinner = out.label === winner.label;
              const isAboveThreshold = out.probability >= minPThreshold;

              return (
                <div 
                  key={i} 
                  className={`relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer transition-all duration-500 ${
                    isSelected ? 'scale-110 z-20' : 'z-10'
                  } ${!isTopK || (!isAboveThreshold && !isSelected) ? 'opacity-30 grayscale' : 'opacity-100'}`}
                  onMouseEnter={() => !selectedLabel && setHoveredItem(getInspectorData(out, i))}
                  onMouseLeave={() => !selectedLabel && setHoveredItem(null)}
                  onClick={(e) => handleSelection(out, i, e)}
                >
                  <span className={`text-[8px] font-mono mb-2 ${isSelected ? 'text-white font-black' : 'text-slate-500'}`}>
                    {(out.probability * 100).toFixed(0)}%
                  </span>
                  
                  <div 
                    className={`w-full max-w-[34px] rounded-t-xl transition-all duration-500 relative ${
                      isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-2xl' : 'border border-transparent'
                    }`}
                    style={{ 
                      height: `${out.probability * 100}%`, 
                      backgroundColor: isTopK ? (colorMap[out.type] || '#475569') : '#2d3748',
                      boxShadow: isWinner && isTopK && !isSelected ? `0 0 30px ${colorMap[out.type]}33` : 'none'
                    }}
                  >
                    {isTopK && isAboveThreshold && temperature > 1.3 && <div className="absolute inset-0 opacity-20 bg-white/20 animate-pulse rounded-t-xl" />}
                  </div>
                  
                  <div className="absolute top-full pt-3 w-full text-center">
                    <span className={`text-[9px] uppercase tracking-tighter block truncate ${
                      isSelected || (isWinner && isTopK && isAboveThreshold) ? 'font-black text-white underline decoration-blue-500 decoration-2 underline-offset-4' : 'font-medium text-slate-600'
                    }`}>
                      {out.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info-Grid für Parameter (3 Spalten auf Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Temperature */}
        <div className="p-4 bg-slate-900/50 rounded-[1.5rem] border border-white/5" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-3">
            <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest leading-none">Temperature</label>
            <div className="text-xs font-mono font-black text-blue-400">{temperature.toFixed(2)}</div>
          </div>
          <input 
            type="range" min="0.1" max="2.0" step="0.1" 
            value={temperature} 
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Top-K */}
        <div className="p-4 bg-slate-900/50 rounded-[1.5rem] border border-white/5" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-3">
            <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest leading-none">Top-K Filter</label>
            <div className="text-xs font-mono font-black text-green-400">K={topK}</div>
          </div>
          <input 
            type="range" min="1" max="5" step="1" 
            value={topK} 
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
        </div>

        {/* Min-P (Threshold) */}
        <div className="p-4 bg-slate-900/50 rounded-[1.5rem] border border-white/5" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-3">
            <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest leading-none">Min-P Cut-off</label>
            <div className="text-xs font-mono font-black text-red-400">{(minPThreshold * 100).toFixed(0)}%</div>
          </div>
          <input 
            type="range" min="0.01" max="0.25" step="0.01" 
            value={minPThreshold} 
            onChange={(e) => setMinPThreshold(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Phase4_Decoding;