import React from 'react';

const Header = ({ 
  onOpenHelp, 
  theme, 
  toggleTheme, 
  scenarios, 
  activeScenario, 
  onScenarioChange, 
  onRestart,           // NEU: Prop für den Phasen-Wechsel auf -1
  showScenarioSelector // NEU: Steuert die Sichtbarkeit des Selectors
}) => {
  return (
    <header className={`w-full px-6 py-4 flex justify-between items-center border-b shrink-0 z-50 transition-all duration-500 ${
      theme === 'dark' ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'
    }`}>
      
      {/* LINKE SEITE: LOGO & SZENARIO */}
      <div className="flex items-center gap-8">
        <h1 className="text-lg font-black uppercase tracking-tighter text-blue-500 flex items-center gap-2">
          <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded text-[10px]">AI</span>
          LLM Explorer <span className="font-light opacity-30 lowercase text-xs ml-1">v2.3</span>
        </h1>

        {/* SCENARIO SELECTOR: Wird ausgeblendet, wenn showScenarioSelector false ist */}
        {showScenarioSelector && (
          <div className="hidden md:flex items-center gap-3 bg-slate-800/30 p-1 rounded-xl border border-white/5 animate-in fade-in slide-in-from-left duration-500">
            <span className="text-[8px] font-black uppercase px-2 opacity-40 tracking-widest text-slate-400">Aktives Szenario:</span>
            <select 
              value={activeScenario?.id} 
              onChange={(e) => onScenarioChange(parseInt(e.target.value))}
              className="bg-transparent text-[11px] font-bold outline-none cursor-pointer pr-4 text-blue-400 hover:text-blue-300 transition-colors"
            >
              {scenarios.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* RECHTE SEITE: TOOLS & RESTART */}
      <div className="flex items-center gap-3 lg:gap-5">
        
        {/* NEUSTART BUTTON: Erscheint nur, wenn wir uns in einer Simulation befinden (Phase 0-5) */}
        {showScenarioSelector && (
          <button 
            onClick={onRestart}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/5 hover:border-red-500/40 hover:bg-red-500/5 transition-all group"
            title="Zurück zum Startbildschirm"
          >
            <span className="text-sm group-hover:rotate-[-180deg] transition-transform duration-500 text-slate-400 group-hover:text-red-400">↺</span>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 group-hover:text-red-400 hidden sm:inline">Neustart</span>
          </button>
        )}

        {/* THEME TOGGLE */}
        <button 
          onClick={toggleTheme} 
          className="p-2 w-10 h-10 flex items-center justify-center rounded-lg border border-transparent hover:border-white/5 hover:bg-white/5 transition-all text-lg"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* GLOSSAR BUTTON */}
        <button 
          onClick={onOpenHelp}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          Glossar
        </button>
      </div>
    </header>
  );
};

export default Header;