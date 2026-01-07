const GlossaryModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  // Fallback, falls die JSON noch lädt oder fehlt
  const terms = data?.terms || [
    { title: "Lade Daten...", content: "Bitte warten Sie einen Moment." }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm shadow-2xl">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-blue-400 uppercase tracking-tighter">Simulations-Glossar</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Version {data?.version || '0.0'}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-2xl font-bold px-2">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {terms.map((term, i) => (
            <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/30 transition-colors group">
              <span className="text-[8px] text-blue-500/50 uppercase font-black mb-1 block">{term.category}</span>
              <h3 className="text-blue-500 text-xs font-black uppercase mb-2">{term.title}</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed whitespace-pre-line">{term.content}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
          <button onClick={onClose} className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20 uppercase tracking-wider">
            Zurück zur Simulation
          </button>
        </div>
      </div>
    </div>
  );
};