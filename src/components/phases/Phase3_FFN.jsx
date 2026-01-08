import React from 'react';

// setHoveredItem als Prop hinzufügen
const Phase3_FFN = ({ simulator, setHoveredItem }) => {
  const { mlpThreshold, setMlpThreshold, activeFFN } = simulator;

  if (!activeFFN || activeFFN.length === 0) {
    return <div className="p-10 text-center text-slate-500 animate-pulse">Warte auf Aktivierungsdaten...</div>;
  }

  const colorMap = {
    "Wissenschaftlich": "border-blue-500 shadow-blue-500/20 text-blue-400",
    "Scientific": "border-blue-500 shadow-blue-500/20 text-blue-400",
    "Sozial": "border-green-500 shadow-green-500/20 text-green-400",
    "Social": "border-green-500 shadow-green-500/20 text-green-400",
    "Poetisch": "border-purple-500 shadow-purple-500/20 text-purple-400",
    "Poetic": "border-purple-500 shadow-purple-500/20 text-purple-400",
    "Evolutionär": "border-orange-500 shadow-orange-500/20 text-orange-400",
    "Ancestral": "border-orange-500 shadow-orange-500/20 text-orange-400"
  };

  const glowMap = {
    "Wissenschaftlich": "bg-blue-500/10",
    "Scientific": "bg-blue-500/10",
    "Sozial": "bg-green-500/10",
    "Social": "bg-green-500/10",
    "Poetisch": "bg-purple-500/10",
    "Poetic": "bg-purple-500/10",
    "Evolutionär": "bg-orange-500/10",
    "Ancestral": "bg-orange-500/10"
  };

  return (
    <div className="flex flex-col h-full w-full p-8 animate-in fade-in duration-500">
      <h2 className="text-center text-slate-500 uppercase tracking-[0.2em] text-[10px] mb-8">
        Knowledge Dashboard (FFN Activation)
      </h2>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-6 flex-1">
        {activeFFN.map((cat) => (
          <div
            key={cat.label}
            className={`relative flex flex-col items-center justify-center rounded-3xl border-2 transition-all duration-500 cursor-help ${cat.isActive
                ? `${colorMap[cat.label]} ${glowMap[cat.label]} scale-100 opacity-100 shadow-2xl`
                : 'border-slate-800 bg-slate-900/20 scale-95 opacity-30 text-slate-600'
              }`}
            // Hover Events für den Detail-Inspektor
            onMouseEnter={() => setHoveredItem({
              title: `Wissens-Cluster: ${cat.label}`,
              data: {
                "Netz-Aktivierung": (cat.activation * 100).toFixed(1) + "%",
                "MLP-Filter": mlpThreshold.toFixed(2),
                "Status": cat.isActive ? "Aktiviert" : "Gefiltert",
                "Input-Quelle": "Feed-Forward-Network",
                "Vektorklasse": cat.label
              }
            })}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="text-lg font-bold uppercase tracking-wider text-center px-2">
              {cat.label}
            </div>

            <div className="text-[10px] font-mono mt-2 opacity-60">
              {(cat.activation * 100).toFixed(0)}% Power
            </div>

            {/* Kleines Icon-Symbol */}
            {cat.isActive && (
              <div className="absolute top-4 right-4 animate-pulse text-xl">
                {(cat.label === "Wissenschaftlich" || cat.label === "Scientific") && "🔬"}
                {(cat.label === "Sozial" || cat.label === "Social") && "🤝"}
                {(cat.label === "Poetisch" || cat.label === "Poetic") && "✨"}
                {(cat.label === "Evolutionär" || cat.label === "Ancestral") && "🦴"}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Control Panel für Phase 3 */}
      <div className="mt-8 bg-slate-800/30 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            MLP-Threshold (Filter)
          </label>
          <span className="text-xs font-mono text-white bg-slate-700 px-2 py-0.5 rounded">
            {mlpThreshold.toFixed(2)}
          </span>
        </div>
        <input
          type="range" min="0" max="1" step="0.05"
          value={mlpThreshold}
          onChange={(e) => setMlpThreshold(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <p className="text-[9px] text-slate-500 mt-2 italic text-center">
          "Bestimmt, wie stark ein Wissensmuster aktiviert sein muss, um ins Bewusstsein zu treten."
        </p>
      </div>
    </div>
  );
};

export default Phase3_FFN;