import React from 'react';

const InternalHeader = ({ 
  theme, 
  toggleTheme, 
  onOpenHelp, 
  onOpenInfo,
  onRestart, 
  showScenarioSelector 
}) => {
  
  // Zentrale Stil-Klassen für maximale Konsistenz
  const baseBtnClass = "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 group shadow-sm";
  const labelClass = "text-[9px] font-black uppercase tracking-widest hidden lg:inline";

  return (
    <header className={`w-full px-6 py-2 flex items-center justify-between border-b transition-all duration-500 z-50 sticky top-0 ${
      theme === 'dark' 
        ? 'bg-slate-950/80 border-white/5 backdrop-blur-md text-white' 
        : 'bg-white/80 border-slate-200 backdrop-blur-md shadow-sm text-slate-900'
    }`}>
      
      {/* BRANDING */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-lg">
          🧠
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black uppercase tracking-tighter leading-none text-blue-500">
            LLM Explorer
          </h1>
          <span className="text-[8px] font-mono opacity-40 tracking-[0.2em] uppercase leading-tight">
            Sim Lab | CHERWARE.DE
          </span>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex items-center gap-2">
        
        {/* 1. SZENARIO WECHSELN (Rot-Akzent) */}
        {showScenarioSelector && (
          <button 
            onClick={onRestart}
            className={`${baseBtnClass} ${
              theme === 'dark' 
                ? 'bg-red-500/5 border-white/5 hover:border-red-500/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400' 
                : 'bg-red-50 border-slate-200 hover:border-red-500/40 hover:bg-red-100 text-slate-600 hover:text-red-600'
            }`}
          >
            <span className="text-xs group-hover:rotate-[-180deg] transition-transform duration-500">↺</span>
            <span className={labelClass}>Wechseln</span>
          </button>
        )}

        {/* 2. WISSENS-DB (Blau-Akzent) */}
        <button 
          onClick={onOpenHelp} 
          className={`${baseBtnClass} ${
            theme === 'dark' 
              ? 'bg-blue-500/5 border-white/5 hover:border-blue-500/40 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400' 
              : 'bg-blue-50 border-slate-200 hover:border-blue-500/40 hover:bg-blue-100 text-slate-600 hover:text-blue-600'
          }`}
        >
          <span className="text-xs">📖</span>
          <span className={labelClass}>Wissens-DB</span>
        </button>

        {/* DIVIDER */}
        <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

        {/* 3. THEME TOGGLE (Neutral/Gelb-Akzent) */}
        <button 
          onClick={toggleTheme} 
          className={`${baseBtnClass} ${
            theme === 'dark' 
              ? 'bg-white/5 border-white/5 hover:border-yellow-500/40 hover:bg-yellow-500/10 text-slate-400 hover:text-yellow-400' 
              : 'bg-slate-50 border-slate-200 hover:border-yellow-500/40 hover:bg-yellow-50 text-slate-600 hover:text-yellow-600'
          }`}
        >
          <span className="text-xs">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className={labelClass}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* 4. INFO BUTTON (Neutral-Akzent) */}
        <button 
          onClick={onOpenInfo} 
          className={`${baseBtnClass} ${
            theme === 'dark' 
              ? 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 text-slate-500 hover:text-white' 
              : 'bg-slate-50 border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-xs italic font-serif">i</span>
          <span className={labelClass}>Info</span>
        </button>

      </div>
    </header>
  );
};

export default InternalHeader;