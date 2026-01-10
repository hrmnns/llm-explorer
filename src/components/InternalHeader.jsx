import React from 'react';

const InternalHeader = ({ 
  theme, 
  toggleTheme, 
  onOpenHelp, 
  onOpenInfo,
  onRestart,           // Prop für den Phasen-Wechsel auf -1
  showScenarioSelector // Wird hier genutzt, um den Neustart-Button nur während der Simulation zu zeigen
}) => (
  <header className={`w-full px-6 py-4 flex flex-col md:flex-row justify-between items-center border-b transition-colors duration-500 z-50 ${
    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
  }`}>
    
    <div className="flex items-center gap-6 mb-4 md:mb-0">
      <h1 className="text-lg font-black uppercase tracking-tighter text-blue-500">
        LLM Explorer <span className="font-light opacity-50 text-[10px] tracking-normal"> CHERWARE.DE</span>
      </h1>
      
      {/* Hinweis: Der Selektor wurde entfernt. Die Auswahl findet nun im IntroScreen statt. */}
    </div>

    <div className="flex items-center gap-4">
      
      {/* NEUSTART / SZENARIO WECHSELN BUTTON: Erscheint nur während der Simulation (Phasen 0-5) */}
      {showScenarioSelector && (
        <button 
          onClick={onRestart}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all group ${
            theme === 'dark' 
              ? 'bg-slate-800/50 border-white/5 hover:border-red-500/40 hover:bg-red-500/5' 
              : 'bg-slate-100 border-slate-200 hover:border-red-500/40 hover:bg-red-50'
          }`}
          title="Zurück zum Startbildschirm"
        >
          <span className="text-sm group-hover:rotate-[-180deg] transition-transform duration-500 text-slate-400 group-hover:text-red-500">
            ↺
          </span>
          <span className={`text-[9px] font-black uppercase tracking-widest hidden sm:inline ${
            theme === 'dark' ? 'text-slate-400 group-hover:text-red-400' : 'text-slate-600 group-hover:text-red-500'
          }`}>
            Szenario wechseln
          </span>
        </button>
      )}

      {/* THEME TOGGLE */}
      <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-blue-500/10 transition-all text-xl">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* WISSENS-DB / GLOSSAR */}
      <button 
        onClick={onOpenHelp} 
        className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-lg uppercase transition-all shadow-lg shadow-blue-900/20 active:scale-95"
      >
        Wissens-DB
      </button>

      {/* INFO / ABOUT */}
      <button 
        onClick={onOpenInfo} 
        className="p-2 w-10 h-10 flex items-center justify-center rounded-lg border border-transparent hover:border-white/5 hover:bg-white/5 transition-all text-xl opacity-50 hover:opacity-100"
        title="Projekt-Info"
      >
        ℹ️
      </button>

    </div>
  </header>
);

export default InternalHeader;