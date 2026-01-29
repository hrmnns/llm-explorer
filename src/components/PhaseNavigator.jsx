import React from 'react';

const PhaseNavigator = ({ activePhase, setActivePhase, theme, onOpenBriefing }) => {
  const phaseNames = ["Tokenize", "Embed", "Attention", "FFN", "Decoding", "Analysis"];
  const isDark = theme === 'dark';

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

  // Dynamische Theme-Klassen
  const navBg = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const pipelineBg = isDark ? "bg-slate-950/50 border-slate-800/50" : "bg-slate-50 border-slate-200";
  const inactiveText = isDark ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100";
  const mobileNavBg = isDark ? "bg-slate-950/90 border-white/10" : "bg-white/95 border-slate-200";

  return (
    <>
      {/* DESKTOP NAV */}
      <nav className={`hidden lg:flex flex-col items-center border-b p-3 gap-3 w-full shrink-0 ${navBg}`}>
        <div className="flex justify-center items-center gap-2 w-full">
          <button
            disabled={activePhase === 0}
            onClick={handlePrev}
            className={`${desktopBtnBase} ${activePhase === 0 ? 'opacity-10 cursor-not-allowed' : inactiveText}`}
          >
            ←
          </button>

          <div className="flex gap-2">
            {phaseNames.map((name, index) => (
              <button 
                key={index}
                onClick={() => setActivePhase(index)}
                className={`${desktopBtnBase} ${
                  activePhase === index 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : inactiveText
                }`}
              >
                <span className="opacity-50 mr-1">{index}</span> {name}
              </button>
            ))}
          </div>

          <button
            disabled={activePhase === 5}
            onClick={handleNext}
            className={`${desktopBtnBase} ${activePhase === 5 ? 'opacity-10 cursor-not-allowed' : inactiveText}`}
          >
            →
          </button>
        </div>

        {/* PIPELINE VIEW */}
        <div className={`flex items-center justify-between w-full max-w-3xl px-6 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-[0.2em] ${pipelineBg}`}>
          <div className="flex gap-2 items-center">
            <span className={isDark ? "text-slate-600" : "text-slate-400"}>In:</span>
            <span className="text-blue-500/80 font-mono">{current.in}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-blue-500/20" : "bg-blue-500/10"}`} />
            
            <button 
              onClick={onOpenBriefing}
              className={`px-4 py-1 rounded-full border transition-all flex items-center gap-2 group ${
                isDark 
                ? "border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/20" 
                : "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
              }`}
              title="Phasen-Briefing öffnen"
            >
              <span className="group-hover:animate-bounce">🚀</span>
              {current.op}
            </button>

            <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-blue-500/20" : "bg-blue-500/10"}`} />
          </div>

          <div className="flex gap-2 items-center">
            <span className={isDark ? "text-slate-600" : "text-slate-400"}>Out:</span>
            <span className="text-green-500/80 font-mono">{current.out}</span>
          </div>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] backdrop-blur-xl border-t p-4 pb-8 flex flex-col gap-4 shadow-2xl ${mobileNavBg}`}>
        
        {/* MOBILE MONITOR */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black">Input</span>
            <span className="text-[10px] text-blue-500 font-mono">{current.in}</span>
          </div>
          <div className="flex flex-col items-center">
            <div className={`text-[8px] px-2 py-0.5 rounded-full border font-black uppercase mb-1 ${
              isDark ? "bg-blue-600/20 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-100"
            }`}>
              {current.op}
            </div>
            <div className="flex gap-1">
              {phaseNames.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === activePhase ? 'w-4 bg-blue-500' : isDark ? 'w-1 bg-slate-700' : 'w-1 bg-slate-200'}`} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black text-right w-full">Output</span>
            <span className="text-[10px] text-green-500 font-mono text-right w-full">{current.out}</span>
          </div>
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex gap-2">
          <button 
            onClick={handlePrev}
            disabled={activePhase === 0}
            className={`flex-1 py-2.5 ${btnBase} ${
              activePhase === 0 
                ? 'opacity-10 text-slate-400' 
                : isDark ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            ←
          </button>

          <button 
            onClick={onOpenBriefing}
            className={`flex-1 py-2.5 ${btnBase} ${
              isDark ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'
            }`}
          >
            🚀
          </button>

          <button 
            onClick={handleNext}
            disabled={activePhase === 5}
            className={`flex-[2] py-2.5 ${btnBase} ${
              activePhase === 5
                ? 'bg-slate-200 text-slate-400 border-transparent'
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