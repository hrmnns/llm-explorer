import React from 'react';

const PhaseBriefing = ({ data, onClose, theme, autoShow, onToggleAutoShow }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in duration-300">
      
      {/* Backdrop: Nutzt jetzt eine neutrale dunkle Deckkraft für maximalen Fokus */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Die Card: Nutzt zentrale Variablen bg-explore-nav und border-explore-border */}
      <div className={`relative max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 rounded-[2.5rem] border shadow-2xl transition-all 
        bg-explore-nav border-explore-border text-content-main shadow-blue-500/10`}>
        
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div className="pr-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1 leading-none">Briefing Phase</h4>
            <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">
              {data.title}
            </h2>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex-none flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20">🚀</div>
        </div>

        {/* MISSION */}
        <p className="text-sm mb-6 leading-relaxed font-medium text-content-muted">
          {data.mission}
        </p>

        {/* MISSION STEPS */}
        <div className="space-y-4 mb-8">
          <h5 className="text-[9px] font-black uppercase tracking-widest text-content-dim flex items-center gap-2">
            <span className="w-4 h-px bg-explore-border"></span> Deine Mission
          </h5>
          <ul className="space-y-3">
            {data.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-xs leading-relaxed">
                <span className="text-blue-500 font-bold">{i + 1}.</span>
                <span className="text-content-muted">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* INSIGHT BOX: Nutzt bg-explore-item für subtile Abhebung */}
        <div className="p-4 rounded-2xl mb-8 border border-blue-500/20 bg-blue-500/5">
          <p className="text-[10px] italic text-blue-500 leading-relaxed text-center">
            <strong>Aha-Moment:</strong> {data.insight}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-4">
          {data.externalResource && (
            <a 
              href={data.externalResource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-3 rounded-xl border border-explore-border bg-explore-item text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-blue-500/10 hover:text-blue-500"
            >
              <span className="text-sm">🌐</span> {data.externalResource.label}
            </a>
          )}

          {/* CHECKBOX: Verhindert automatisches Einblenden */}
          <div className="flex items-center justify-center py-1">
            <label className="flex items-center cursor-pointer group select-none">
              <input 
                type="checkbox" 
                checked={!autoShow}
                onChange={(e) => onToggleAutoShow(!e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-4 h-4 flex-none rounded border border-explore-border bg-explore-item peer-checked:bg-blue-600 peer-checked:border-blue-500 transition-all flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm scale-0 peer-checked:scale-100 transition-transform" 
                     style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)' }} />
              </div>
              <span className="ml-3 text-[9px] font-black uppercase tracking-widest transition-colors text-content-dim group-hover:text-content-muted">
                Dialog nicht mehr automatisch anzeigen
              </span>
            </label>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            Analyse starten
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhaseBriefing;