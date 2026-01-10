import React from 'react';

const PhaseLayout = ({ 
  title, 
  subtitle, 
  badges = [], // Default leerer Array
  visualization, 
  controls,
  theme = 'dark'
}) => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500 p-4 lg:p-6">
      
      {/* HEADER: flex-wrap ist entscheidend für die Sichtbarkeit der Badges */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-4 shrink-0 border-b border-white/5 pb-4">
        <div className="flex flex-col min-w-[150px]">
          <h2 className="text-blue-500 uppercase font-black tracking-[0.2em] text-[9px] mb-0.5">
            {title}
          </h2>
          <p className={`text-base font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {subtitle}
          </p>
        </div>

        {/* BADGE-CONTAINER: justify-start auf Mobil, justify-end auf Desktop */}
        <div className="flex flex-wrap gap-2 items-center lg:justify-end ml-auto">
          {badges && badges.length > 0 && badges.map((badge, idx) => (
            <div 
              key={idx}
              className={`px-2 py-0.5 rounded-md border text-[8px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shadow-sm ${badge.className}`}
            >
              {badge.text}
            </div>
          ))}
        </div>
      </header>

      {/* HAUPT-VISUALISIERUNG */}
      <div className="flex-1 min-h-0 relative bg-slate-950/40 rounded-xl border border-white/5 overflow-hidden flex flex-col shadow-inner">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
            {visualization}
        </div>
      </div>

      {/* EINSTELLUNGEN FOOTER */}
      {controls && (
        <footer className="shrink-0 mt-3 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {controls}
          </div>
        </footer>
      )}
    </div>
  );
};

export default PhaseLayout;