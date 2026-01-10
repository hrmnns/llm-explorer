import React from 'react';

const PhaseLayout = ({ 
  title, 
  subtitle, 
  badges = [], 
  visualization, 
  controls,
  theme = 'dark'
}) => {
 return (
    <div className="flex flex-col h-full w-full overflow-hidden p-4 lg:p-6">
      
      {/* HEADER: Flex-wrap für mobile Geräte */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0 border-b border-white/5 pb-4">
        <div className="flex flex-col">
          <h2 className="text-blue-500 uppercase font-black tracking-[0.2em] text-[9px] mb-0.5">{title}</h2>
          <p className="text-base font-bold tracking-tight">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">{/* Badges */}</div>
      </header>

      {/* VISUALISIERUNG: min-h-[300px] auf Mobil, damit sie nicht verschwindet */}
      <div className="flex-1 min-h-[300px] lg:min-h-0 relative bg-slate-950/40 rounded-xl border border-white/5 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
            {visualization}
        </div>
      </div>

      {/* CONTROLS: Intelligentes Grid (1 Spalte mobil, 2 Spalten Tablet, 3 Spalten Desktop) */}
      {controls && (
        <footer className="shrink-0 mt-3 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {controls}
          </div>
        </footer>
      )}
    </div>
  );
};

export default PhaseLayout;