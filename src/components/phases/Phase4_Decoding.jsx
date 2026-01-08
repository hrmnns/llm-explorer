import React from 'react';

// 1. Hier fügen wir setHoveredItem hinzu
const Phase4_Decoding = ({ simulator, setHoveredItem }) => {
  const { temperature, setTemperature, finalOutputs } = simulator;

  if (!finalOutputs || finalOutputs.length === 0) return null;

  const colorMap = {
    "Wissenschaftlich": "#3b82f6", // blue-500
    "Sozial": "#22c55e",           // green-500
    "Poetisch": "#a855f7",         // purple-500
    "Evolutionär": "#f97316"       // orange-500
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-white">
      <h2 className="text-center text-slate-500 uppercase tracking-widest text-[10px] mb-4">
        Softmax Distribution
      </h2>

      {/* Die Balken-Fläche */}
      <div className="flex items-end justify-around gap-2 h-64 w-full bg-slate-900/50 rounded-xl p-4 border border-slate-800">
        {finalOutputs.map((out, i) => (
          <div 
            key={i} 
            className="flex flex-col items-center flex-1 h-full justify-end group cursor-help"
            // 2. Hier hängen wir die Events an den Balken-Container
            onMouseEnter={() => setHoveredItem({
              title: `Wort-Kandidat: ${out.label}`,
              data: {
                "Wahrscheinlichkeit": (out.probability * 100).toFixed(2) + "%",
                "Kategorie": out.type,
                "Logit-Rohwert": out.logit.toFixed(4),
                "Status": out.isCritical ? "⚠️ Risiko-Wahl" : "Stabil",
                "Rank": i + 1
              }
            })}
            onMouseLeave={() => setHoveredItem(null)}
          >
            
            {/* Prozent-Zahl */}
            <span className={`text-[10px] font-mono mb-2 ${out.isCritical ? 'text-red-500' : 'text-blue-400'}`}>
              {(out.probability * 100).toFixed(1)}%
            </span>
            
            {/* Der physische Balken */}
            <div 
              className={`w-full max-w-[40px] rounded-t transition-all duration-300 ${
                out.isCritical ? 'animate-pulse' : ''
              }`}
              style={{ 
                height: `${out.probability * 100}%`, 
                backgroundColor: out.isCritical ? '#dc2626' : (colorMap[out.type] || '#64748b'),
                minHeight: '4px'
              }}
            ></div>
            
            {/* Label */}
            <span className="mt-2 text-[10px] font-bold truncate w-full text-center opacity-80 uppercase tracking-tighter">
              {out.label}
            </span>
          </div>
        ))}
      </div>

      {/* Slider-Bereich */}
      <div className="mt-auto pt-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] uppercase font-bold text-slate-500">Temperature</label>
          <span className="text-blue-400 font-mono text-xs">{temperature.toFixed(2)}</span>
        </div>
        <input 
          type="range" 
          min="0.1" 
          max="2.0" 
          step="0.05" 
          value={temperature} 
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <p className="text-[9px] text-slate-500 mt-2 italic text-center opacity-60">
          "Höhere Temperature macht die Verteilung flacher – unwahrscheinliche Wörter werden möglich."
        </p>
      </div>
    </div>
  );
};

export default Phase4_Decoding;