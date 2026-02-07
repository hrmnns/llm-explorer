import React from 'react';

const InternalHeader = ({
  theme,
  toggleTheme,
  onOpenHelp,
  onOpenInfo,
  onRestart,
  showScenarioSelector
}) => {

  // Zentrale Stil-Klassen für maximale Konsistenz und Nutzung der neuen Variablen
  const baseBtnClass = "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-explore-border transition-all duration-300 group shadow-sm bg-explore-item text-content-muted hover:text-content-main";
  const labelClass = "text-[9px] font-black uppercase tracking-widest hidden lg:inline";

  return (
    <header className="w-full px-6 py-2 flex items-center justify-between border-b border-explore-border transition-all duration-500 z-50 sticky top-0 bg-explore-nav/80 backdrop-blur-md text-content-main">

      {/* BRANDING */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-hover rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 text-lg">
          🧠
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black uppercase tracking-tighter leading-none text-primary">
            LLM Explorer
          </h1>
          <span className="text-[8px] font-mono text-content-dim tracking-[0.2em] uppercase leading-tight">
            Sim Lab | CHERWARE.DE
          </span>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="flex items-center gap-2">

        {/* 1. SZENARIO WECHSELN (Rot-Akzent -> Warning/Error? Let's use Error for 'Reset' vibe or Primary?) 
            Actually, 'Wechseln' is 'Reform/Restart', often Red or Orange. 
            Original was Red. Let's use Error.
        */}
        {showScenarioSelector && (
          <button
            onClick={onRestart}
            className={`${baseBtnClass} hover:border-error/40 hover:bg-error/10 hover:text-error`}
          >
            <span className="text-xs group-hover:rotate-[-180deg] transition-transform duration-500">↺</span>
            <span className={labelClass}>Wechseln</span>
          </button>
        )}

        {/* 2. WISSENS-DB (Blau-Akzent -> Primary) */}
        <button
          onClick={onOpenHelp}
          className={`${baseBtnClass} hover:border-primary/40 hover:bg-primary/10 hover:text-primary`}
        >
          <span className="text-xs">📖</span>
          <span className={labelClass}>Wissens-DB</span>
        </button>

        {/* DIVIDER */}
        <div className="h-4 w-px bg-explore-border mx-1 hidden sm:block" />

        {/* 3. THEME TOGGLE (Neutral/Gelb-Akzent) */}
        <button
          onClick={toggleTheme}
          className={`${baseBtnClass} hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-500`}
        >
          <span className="text-xs">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className={labelClass}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* 4. INFO BUTTON (Neutral-Akzent) */}
        <button
          onClick={onOpenInfo}
          className={`${baseBtnClass} hover:border-content-main/20 hover:bg-explore-item/80`}
        >
          <span className="text-xs italic font-serif">i</span>
          <span className={labelClass}>Info</span>
        </button>

      </div>
    </header>
  );
};

export default InternalHeader;