import React, { useState, useEffect, useMemo } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase4_Decoding = ({ simulator, setHoveredItem, theme }) => {
  const { temperature, setTemperature, finalOutputs } = simulator;
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [topK, setTopK] = useState(5); 
  const [minPThreshold, setMinPThreshold] = useState(0.07);

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
    let statusText = isTopK ? (isAboveThreshold ? "Aktiv" : "Gefiltert (Min-P)") : "Gefiltert (Top-K)";
    
    return {
      title: `Decoding: ${out.label}`,
      subtitle: "Kausale Analyse",
      data: {
        "Wahrscheinlichkeit": (out.probability * 100).toFixed(2) + "%",
        "Kategorie": out.type,
        "Status": statusText,
        "Rang": `#${index + 1}`,
        "Trace-Analyse": out.causality_trace || `Token aus dem Bereich ${out.type}.`
      }
    };
  };

  useEffect(() => {
    if (selectedLabel) {
      const index = sortedOutputs.findIndex(o => o.label === selectedLabel);
      if (index !== -1) setHoveredItem(getInspectorData(sortedOutputs[index], index));
    }
  }, [sortedOutputs, selectedLabel, setHoveredItem, topK, minPThreshold]);

  return (
    <PhaseLayout
      title="Phase 4: Softmax Decoding"
      subtitle="Vom Vektor zum Output-Token"
      theme={theme}
      badges={[
        { text: `K-Rank: ${topK}`, className: "border-blue-500/30 text-blue-400 bg-blue-500/5" },
        { text: `Min-P: ${(minPThreshold * 100).toFixed(0)}%`, className: "border-red-500/30 text-red-400 bg-red-500/5" }
      ]}
      visualization={
        <div className="flex flex-row h-[380px] lg:h-full w-full gap-4" onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}>
          
          {/* Y-ACHSE */}
          <div className="flex flex-col justify-between items-end pb-10 pt-4 text-[8px] font-black text-slate-600 w-8 shrink-0 select-none">
            <span>100%</span>
            <span>50%</span>
            <span className="text-slate-800 text-[10px]">0%</span>
          </div>

          {/* DIAGRAMM-BEREICH */}
          <div className="relative flex-1 h-full flex flex-col justify-end group/chart">
            
            {/* GRID LINES */}
            <div className="absolute inset-0 pb-10 pt-4 pointer-events-none">
              <div className="absolute top-4 left-0 w-full border-t border-white/5"></div>
              <div className="absolute top-1/2 left-0 w-full border-t border-white/5"></div>
              <div className="absolute bottom-10 left-0 w-full border-t border-slate-800"></div>
            </div>

            {/* MIN-P LINE */}
            <div 
              className="absolute left-0 w-full border-t border-dashed border-red-500/40 z-20 transition-all duration-500 pointer-events-none"
              style={{ bottom: `calc(${(minPThreshold * 85)}% + 40px)` }} 
            >
              <div className="absolute right-0 -top-2 px-1.5 py-0.5 bg-slate-900 rounded border border-red-500/20 text-[6px] text-red-500 font-black tracking-widest uppercase">
                Min-P
              </div>
            </div>

            {/* BALKEN */}
            <div className="relative flex items-end justify-around gap-1 lg:gap-2 h-full pb-10">
              {sortedOutputs.map((out, i) => {
                const isTopK = i < topK;
                const isSelected = selectedLabel === out.label;
                const isWinner = out.label === winner.label;
                const isAboveThreshold = out.probability >= minPThreshold;

                return (
                  <div 
                    key={i} 
                    className={`relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer transition-all duration-500 ${
                      isSelected ? 'scale-105 z-30' : 'z-10'
                    } ${!isTopK || !isAboveThreshold ? 'opacity-10 grayscale' : 'opacity-100'}`}
                    onMouseEnter={() => !selectedLabel && setHoveredItem(getInspectorData(out, i))}
                    onMouseLeave={() => !selectedLabel && setHoveredItem(null)}
                    onClick={(e) => { e.stopPropagation(); setSelectedLabel(out.label); }}
                  >
                    {/* Prozent-Anzeige (Immer oben drüber) */}
                    <span className={`text-[7px] font-mono mb-1 ${isSelected ? 'text-white font-black' : 'text-slate-600'}`}>
                      {(out.probability * 100).toFixed(0)}%
                    </span>
                    
                    <div 
                      className={`w-full max-w-[36px] rounded-t-md transition-all duration-500 relative ${
                        isSelected ? 'ring-1 ring-white shadow-2xl' : 'border border-transparent'
                      }`}
                      style={{ 
                        height: `${out.probability * 85}%`, /* Auf 85% begrenzt für Headroom */
                        backgroundColor: isTopK ? (colorMap[out.type] || '#475569') : '#1e293b',
                      }}
                    >
                      {/* WINNER SYMBOL: Jetzt INNEN im Balken am oberen Rand */}
                      {isWinner && isTopK && isAboveThreshold && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] animate-pulse z-30 pointer-events-none">🎯</div>
                      )}
                    </div>
                    
                    <div className="absolute top-full pt-2 w-full text-center">
                      <span className={`text-[8px] lg:text-[9px] uppercase tracking-tighter block truncate px-0.5 ${
                        isSelected || (isWinner && isTopK && isAboveThreshold) 
                          ? 'font-black text-white' 
                          : 'font-medium text-slate-500'
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
      }
      controls={
        <>
          <div className="px-3 py-2 bg-slate-900/80 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] uppercase font-black text-blue-500 tracking-widest leading-none">Creativity (Temp)</label>
              <div className="text-[10px] font-mono font-black text-blue-400">{temperature.toFixed(2)}</div>
            </div>
            <input type="range" min="0.1" max="2.0" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>

          <div className="px-3 py-2 bg-slate-900/80 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] uppercase font-black text-green-500 tracking-widest leading-none">Filter (Top-K)</label>
              <div className="text-[10px] font-mono font-black text-green-400">{topK}</div>
            </div>
            <input type="range" min="1" max="10" step="1" value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
          </div>

          <div className="px-3 py-2 bg-slate-900/80 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] uppercase font-black text-red-500 tracking-widest leading-none">Min-P Quality</label>
              <div className="text-[10px] font-mono font-black text-red-400">{(minPThreshold * 100).toFixed(0)}%</div>
            </div>
            <input type="range" min="0.01" max="0.25" step="0.01" value={minPThreshold} onChange={(e) => setMinPThreshold(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500" />
          </div>
        </>
      }
    />
  );
};

export default Phase4_Decoding;