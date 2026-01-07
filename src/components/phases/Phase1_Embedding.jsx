import React from 'react';

const Phase1_Embedding = ({ simulator }) => {
  const { 
    noise, setNoise, 
    positionWeight, setPositionWeight, 
    processedVectors 
  } = simulator;

  return (
    <div className="flex flex-col h-full p-6 text-white font-mono">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-blue-400">Phase 1: High-Dimensional Embedding</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Vektorraum-Transformation & Positional Encoding</p>
      </div>

      {/* Vektorraum-Visualisierung */}
      <div className="flex-1 relative bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
        {/* Koordinatenkreuz */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-full h-px bg-blue-500"></div>
          <div className="h-full w-px bg-blue-500"></div>
        </div>

        {processedVectors.map((vec, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-700 ease-in-out"
            style={{ 
              left: `calc(50% + ${vec.displayX}px)`, 
              top: `calc(50% + ${vec.displayY}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700 text-[9px] whitespace-nowrap pointer-events-none">
               Token #{vec.token_index}
            </div>
          </div>
        ))}
      </div>

      {/* Control Panel für Embedding Parameter */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {/* Semantic Noise Slider */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <label className="text-[10px] uppercase text-blue-400 font-bold block mb-1">
            Semantic Noise: {noise.toFixed(2)}
          </label>
          <input 
            type="range" min="0" max="5" step="0.1" 
            value={noise} 
            onChange={(e) => setNoise(parseFloat(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Positional Weight Slider */}
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <label className="text-[10px] uppercase text-purple-400 font-bold block mb-1">
            Positional Weight: {(positionWeight * 100).toFixed(0)}%
          </label>
          <input 
            type="range" min="0" max="1" step="0.01" 
            value={positionWeight} 
            onChange={(e) => setPositionWeight(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Phase1_Embedding;