import React from 'react';

const PhaseBriefing = ({ data, onClose, theme }) => {
  if (!data) return null;

  return (
    <div className="absolute inset-0 z-[40] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px]" onClick={onClose} />
      
      {/* Briefing Card */}
      <div className={`relative max-w-md w-full p-8 rounded-[2rem] border shadow-2xl transition-all ${
        theme === 'dark' ? 'bg-slate-900 border-blue-500/30 shadow-blue-500/20' : 'bg-white border-blue-200 shadow-xl'
      }`}>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Briefing Phase</h4>
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {data.title}
            </h2>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">🚀</div>
        </div>

        {/* Mission Text */}
        <p className={`text-sm mb-6 leading-relaxed font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          {data.mission}
        </p>

        {/* Steps List */}
        <div className="space-y-4 mb-8">
          <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="w-4 h-px bg-slate-700"></span> Deine Mission
          </h5>
          <ul className="space-y-3">
            {data.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-xs text-slate-300">
                <span className="text-blue-500 font-bold">{i + 1}.</span>
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Box / Insight */}
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 mb-6">
          <p className="text-[10px] italic text-blue-400 leading-relaxed">
            <strong>Aha-Moment:</strong> {data.insight}
          </p>
        </div>

        {/* ACTIONS SECTION */}
        <div className="flex flex-col gap-3">
          {/* Dynamischer Externer Link */}
          {data.externalResource && (
            <a 
              href={data.externalResource.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                theme === 'dark' 
                  ? 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              <span>🌐</span> {data.externalResource.label}
            </a>
          )}

          {/* Primary Action */}
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            Analyse starten
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhaseBriefing;