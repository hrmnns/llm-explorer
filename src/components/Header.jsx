import React from 'react';

const Header = ({ onOpenHelp, theme, toggleTheme }) => {
  return (
    <header className={`w-full py-4 px-8 flex justify-between items-center border-b backdrop-blur-md z-50 transition-colors ${
      theme === 'dark' ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-white/50'
    }`}>
      <div className="flex flex-col">
        <h1 className="text-xl font-black tracking-tighter text-blue-500 uppercase">
          LLM <span className={theme === 'dark' ? 'text-slate-100 italic' : 'text-slate-900 italic'}>Simulator</span>
        </h1>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">System Ready</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle - Einfaches Text Icon */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all text-slate-400"
          title="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Glossar Button - Einfaches Text Icon */}
        <button 
          onClick={onOpenHelp}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/10 border border-blue-500/50 hover:bg-blue-600/20 transition-all group"
        >
          <span className="text-blue-400">📖</span>
          <span className="text-xs font-bold uppercase tracking-tight text-blue-400">Glossar</span>
        </button>
      </div>
    </header>
  );
};

export default Header;