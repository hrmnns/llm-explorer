import React from 'react';

const PhaseNavigator = ({ activePhase, setActivePhase, theme, onOpenBriefing }) => {
  const phaseNames = ["Tokenize", "Embed", "Attention", "FFN", "Decoding", "Analysis"];

  const pipelineFlow = {
    0: { in: "Prompt", op: "Tokenization", out: "Tokens" },
    1: { in: "Tokens", op: "Embedding", out: "Vectors" },
    2: { in: "Vectors", op: "Attention", out: "Context" },
    3: { in: "Context", op: "FFN / MLP", out: "Knowledge" },
    4: { in: "Knowledge", op: "Softmax", out: "Prediction" },
    5: { in: "Results", op: "Analysis", out: "Insights" }
  };

  const current = pipelineFlow[activePhase] || { in: "Debug", op: "Layout Testing", out: "UI Sync" };
  
  const btnBase = "flex items-center justify-center gap-2 rounded-lg border transition-all duration-300 font-black uppercase tracking-widest text-[10px] shadow-sm";
  const desktopBtnBase = "px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center font-bold";

  const handleNext = () => { if (activePhase < 5) setActivePhase(activePhase + 1); };
  const handlePrev = () => { if (activePhase > 0) setActivePhase(activePhase - 1); };

  return (
    <>
      {/* DESKTOP NAV */}
      <nav className="hidden lg:flex flex-col items-center bg-slate-900 border-b border-slate-800 p-3 gap-3 w-full shrink-0">
        <div className="flex justify-center items-center gap-2 w-full">
          <button
            disabled={activePhase === 0}
            onClick={handlePrev}
            className={`${desktopBtnBase} ${activePhase === 0 ? 'opacity-10 cursor-not-allowed' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
          >
            ←
          </button>

          <div className="flex gap-2">
            {phaseNames.map((name, index) => (
              <button 
                key={index}
                onClick={() => setActivePhase(index)}
                className={`${desktopBtnBase} ${activePhase === index ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
              >
                <span className="opacity-50 mr-1">{index}</span> {name}
              </button>
            ))}
          </div>

          <button
            disabled={activePhase === 5}
            onClick={handleNext}
            className={`${desktopBtnBase} ${activePhase === 5 ? 'opacity-10 cursor-not-allowed' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}
          >
            →
          </button>
        </div>

        {/* PIPELINE VIEW MIT BRIEFING-BUTTON */}
        <div className="flex items-center justify-between w-full max-w-3xl px-6 py-1.5 rounded-full bg-slate-950/50 border border-slate-800/50 text-[9px] font-bold uppercase tracking-[0.2em]">
          <div className="flex gap-2 items-center"><span className="text-slate-600">In:</span><span className="text-blue-500/80 font-mono">{current.in}</span></div>
          
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
            
            {/* INTERAKTIVE OPERATION: Öffnet das Briefing */}
            <button 
              onClick={onOpenBriefing}
              className="px-4 py-1 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/20 hover:border-blue-500 transition-all flex items-center gap-2 group"
              title="Phasen-Briefing öffnen"
            >
              <span className="group-hover:animate-bounce">🚀</span>
              {current.op}
            </button>

            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
          </div>

          <div className="flex gap-2 items-center"><span className="text-slate-600">Out:</span><span className="text-green-500/80 font-mono">{current.out}</span></div>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-slate-950/90 backdrop-blur-xl border-t border-white/10 p-4 pb-8 flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        
        {/* MOBILE MONITOR */}
        <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
          <div className="flex flex-col gap-1">
            <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black">Input</span>
            <span className="text-[10px] text-blue-400 font-mono">{current.in}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[8px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-black uppercase mb-1">
              {current.op}
            </div>
            <div className="flex gap-1">
              {phaseNames.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === activePhase ? 'w-4 bg-blue-500' : 'w-1 bg-slate-700'}`} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black text-right w-full">Output</span>
            <span className="text-[10px] text-green-400 font-mono text-right w-full">{current.out}</span>
          </div>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex gap-2">
          {/* Zurück */}
          <button 
            onClick={handlePrev}
            disabled={activePhase === 0}
            className={`flex-1 py-2.5 ${btnBase} ${
              activePhase === 0 ? 'opacity-10 text-slate-600' : 'bg-white/5 border-white/5 text-slate-400'
            }`}
          >
            ←
          </button>

          {/* NEU: Zentraler Briefing Button für Mobile */}
          <button 
            onClick={onOpenBriefing}
            className={`flex-1 py-2.5 ${btnBase} bg-blue-600/10 border-blue-500/30 text-blue-400 active:bg-blue-600/20`}
          >
            🚀
          </button>

          {/* Weiter */}
          <button 
            onClick={handleNext}
            disabled={activePhase === 5}
            className={`flex-[2] py-2.5 ${btnBase} ${
              activePhase === 5
                ? 'bg-slate-800 text-slate-500 border-transparent'
                : 'bg-blue-600 border-blue-500 text-white'
            }`}
          >
            {activePhase === 5 ? 'Check' : 'Next →'}
          </button>
        </div>
      </nav>
    </>
  );
};

export default PhaseNavigator;