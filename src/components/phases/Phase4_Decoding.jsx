import React, { useState, useMemo } from 'react';

const Phase4_Decoding = ({ simulator, setHoveredItem }) => {
  const { temperature, setTemperature, finalOutputs } = simulator;
  const [selectedLabel, setSelectedLabel] = useState(null);
  
  // Die mathematische Schwelle (z.B. 0.07 für 7%)
  const visualMinThreshold = 0.07; 

  const colorMap = {
    "Wissenschaftlich": "#3b82f6",
    "Sozial": "#22c55e",
    "Poetisch": "#a855f7",
    "Evolutionär": "#f97316"
  };

  const winner = useMemo(() => {
    return [...finalOutputs].sort((a, b) => b.probability - a.probability)[0];
  }, [finalOutputs]);

  if (!finalOutputs || finalOutputs.length === 0) return null;

  return (
    <div className="flex flex-col h-full w-full p-6 text-white" onClick={() => {
      setSelectedLabel(null);
      setHoveredItem(null);
    }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-slate-500 uppercase tracking-[0.2em] text-[10px] font-black">
          Phase 4: Softmax Decoding
        </h2>
        <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-white/5 font-mono">
          STOCHASTIC SAMPLING
        </span>
      </div>

      {/* Das Diagramm-Panel */}
      <div className="relative flex-1 min-h-[250px] bg-slate-950/40 rounded-[2rem] border border-white/5 shadow-inner mb-4 overflow-hidden">
        
        {/* Die "Todeszone" (Bereich unter der Schwelle) */}
        <div 
          className="absolute bottom-0 left-0 w-full bg-red-500/5 border-t border-dashed border-red-500/40 z-0 transition-all duration-500"
          style={{ height: `calc(8rem + ${visualMinThreshold * 100}%)` }} // 8rem korrigiert das Padding (p-8 oben/unten)
        >
          <span className="absolute left-6 top-2 text-[7px] text-red-500/60 uppercase font-black tracking-widest">
            Sampling Cut-off (Noise Filter)
          </span>
        </div>

        {/* Die Container-Box für die Balken (nutzt nun Flex-End und das gleiche Padding wie die Todeszone) */}
        <div className="absolute inset-0 flex items-end justify-around gap-2 p-8 pb-12">
          {finalOutputs.map((out, i) => {
            const isWinner = out.label === winner.label;
            const isSelected = selectedLabel === out.label;
            const isBelowThreshold = out.probability < visualMinThreshold;

            return (
              <div 
                key={i} 
                className={`relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer transition-all duration-500 ${
                  isSelected ? 'scale-110 z-20' : 'z-10'
                } ${isBelowThreshold && !isSelected ? 'opacity-20' : 'opacity-80 hover:opacity-100'}`}
                onMouseEnter={() => setHoveredItem({
                  title: `Decoding: ${out.label}`,
                  data: {
                    "Wahrscheinlichkeit": (out.probability * 100).toFixed(2) + "%",
                    "Status": isBelowThreshold ? "Gefiltert" : "Aktiv",
                    "Halluzination": out.hallucination_risk > 0.5 ? "Hoch" : "Gering"
                  }
                })}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedLabel(isSelected ? null : out.label);
                }}
              >
                {/* Prozentzahl */}
                <span className={`text-[9px] font-mono mb-2 ${isWinner ? 'text-white font-black underline decoration-blue-500 underline-offset-4' : 'text-slate-500'}`}>
                  {(out.probability * 100).toFixed(0)}%
                </span>
                
                {/* Der Balken */}
                <div 
                  className={`w-full max-w-[30px] rounded-t-lg transition-all duration-500 relative ${
                    isSelected ? 'border-2 border-white' : 'border border-transparent'
                  }`}
                  style={{ 
                    height: `${out.probability * 100}%`, 
                    backgroundColor: out.hallucination_risk > 0.5 ? '#ef4444' : (colorMap[out.type] || '#475569'),
                    boxShadow: isWinner ? `0 0 25px ${colorMap[out.type] || '#ffffff'}33` : 'none'
                  }}
                >
                  {/* Grain/Noise Effekt bei hoher Temperatur (Hund-Szenario Halluzination) */}
                  {temperature > 1.3 && (
                    <div className="absolute inset-0 opacity-20 bg-white/20 animate-pulse"></div>
                  )}
                </div>
                
                {/* Wort-Label */}
                <span className={`mt-3 text-[9px] truncate w-full text-center uppercase tracking-tighter ${
                  isSelected || isWinner ? 'font-black text-white' : 'font-medium text-slate-600'
                }`}>
                  {out.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Winner Display */}
      <div className="mb-4 p-4 bg-blue-500/5 rounded-[1.5rem] border border-blue-500/10 flex items-center justify-between">
        <div>
            <div className="text-[8px] uppercase font-black text-blue-500 tracking-[0.2em] mb-0.5">Top Prediction</div>
            <div className="text-xl font-black text-white tracking-tight uppercase">
                {winner.label}
            </div>
        </div>
        <div className="text-right">
            <div className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] mb-0.5">Confidence</div>
            <div className="text-lg font-mono text-blue-400 font-bold">
                {(winner.probability * 100).toFixed(1)}%
            </div>
        </div>
      </div>

      {/* Slider Bereich */}
      <div className="p-5 bg-slate-900/50 rounded-[1.5rem] border border-white/5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col">
            <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Temperature</label>
            <span className="text-[8px] text-slate-600 italic">
              Steuert Kreativität vs. Fakten-Treue
            </span>
          </div>
          <div className="text-sm font-mono font-black text-white bg-slate-800 px-2.5 py-0.5 rounded-lg">
            {temperature.toFixed(2)}
          </div>
        </div>
        <input 
          type="range" min="0.1" max="2.0" step="0.05" 
          value={temperature} 
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>
    </div>
  );
};

export default Phase4_Decoding;