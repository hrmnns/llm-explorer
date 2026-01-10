import React from 'react';

const PhaseNavigator = ({ activePhase, setActivePhase }) => {
  const phaseNames = ["Tokenize", "Embed", "Attention", "FFN", "Decoding", "Analysis"];

  // Definition der Pipeline-Logik für den Monitor
  const pipelineFlow = {
    0: { in: "Prompt", op: "Tokenization", out: "Tokens" },
    1: { in: "Tokens", op: "Embedding", out: "Vectors" },
    2: { in: "Vectors", op: "Attention", out: "Context" },
    3: { in: "Context", op: "FFN / MLP", out: "Knowledge" },
    4: { in: "Knowledge", op: "Softmax", out: "Prediction" },
    5: { in: "Results", op: "Analysis", out: "Insights" }
  };

  // --- FIX: SICHERER FALLBACK FÜR DEBUG-MODUS (99) ---
  // Wenn die Phase nicht im PipelineFlow ist, nutzen wir Platzhalter
  const current = pipelineFlow[activePhase] || { 
    in: "Debug", 
    op: "Layout Testing", 
    out: "UI Sync" 
  };

  const btnBaseClass = "px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center";

  return (
    <nav className="flex flex-col items-center bg-slate-900 border-b border-slate-800 p-3 gap-3 w-full shrink-0">
      
      {/* ZEILE 1: NAVIGATION MIT BUTTONS UND PFEILEN */}
      <div className="flex justify-center items-center gap-2 overflow-x-auto w-full no-scrollbar">
        
        {/* Pfeil Zurück */}
        <button
          disabled={activePhase === 0 || activePhase === 99}
          onClick={() => setActivePhase(activePhase - 1)}
          className={`${btnBaseClass} ${
            (activePhase === 0 || activePhase === 99)
              ? 'opacity-10 cursor-not-allowed' 
              : 'text-slate-500 hover:text-white hover:bg-slate-800'
          }`}
        >
          ←
        </button>

        {/* Phasen Buttons */}
        <div className="flex gap-2">
          {phaseNames.map((name, index) => (
            <button 
              key={index}
              onClick={() => setActivePhase(index)}
              className={`${btnBaseClass} ${
                activePhase === index 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="opacity-50 mr-1">{index}</span> {name}
            </button>
          ))}
          
          {/* Optional: Visueller Indikator wenn Debug-Mode aktiv ist */}
          {activePhase === 99 && (
            <button 
              className={`${btnBaseClass} bg-amber-600/20 text-amber-500 border border-amber-500/30`}
              onClick={() => setActivePhase(0)}
            >
              DEBUG ACTIVE (Reset)
            </button>
          )}
        </div>

        {/* Pfeil Vorwärts */}
        <button
          disabled={activePhase === 5 || activePhase === 99}
          onClick={() => setActivePhase(activePhase + 1)}
          className={`${btnBaseClass} ${
            (activePhase === 5 || activePhase === 99)
              ? 'opacity-10 cursor-not-allowed' 
              : 'text-slate-500 hover:text-white hover:bg-slate-800'
          }`}
        >
          →
        </button>
      </div>

      {/* ZEILE 2: DER KOMPAKTE PIPELINE MONITOR */}
      <div className="flex items-center justify-between w-full max-w-3xl px-6 py-1.5 rounded-full bg-slate-950/50 border border-slate-800/50 text-[9px] font-bold uppercase tracking-[0.2em]">
        {/* INPUT */}
        <div className="flex gap-2 items-center">
          <span className="text-slate-600">In:</span>
          <span className="text-blue-500/80 font-mono">{current.in}</span>
        </div>
        
        {/* OPERATION (ZENTRUM) */}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
          <span className={`px-3 py-0.5 rounded-full border border-white/5 transition-colors duration-500 ${
            activePhase === 99 ? 'text-amber-500 bg-amber-500/5 border-amber-500/20' : 'text-slate-300 bg-slate-800/50'
          }`}>
            {current.op}
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
        </div>

        {/* OUTPUT */}
        <div className="flex gap-2 items-center">
          <span className="text-slate-600">Out:</span>
          <span className="text-green-500/80 font-mono">{current.out}</span>
        </div>
      </div>
    </nav>
  );
};

export default PhaseNavigator;