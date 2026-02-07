import React from 'react';

const GlossaryModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-explore-nav border border-explore-border w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-content-main">
        {/* Header */}
        <div className="p-6 border-b border-explore-border flex justify-between items-center bg-explore-nav">
          <h2 className="text-xl font-bold text-primary uppercase tracking-tighter">
            Wissens-Datenbank
          </h2>
          <button
            onClick={onClose}
            className="text-3xl font-light text-content-dim hover:text-primary transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 bg-explore-app/50 custom-scrollbar">
          {data?.terms?.length > 0 ? (
            data.terms.map((term, i) => (
              <div key={i} className="p-5 bg-explore-item border border-explore-border rounded-2xl hover:border-primary/30 transition-colors group">
                <h3 className="text-primary text-sm font-black uppercase tracking-wider group-hover:text-primary-hover transition-colors">
                  {term.title}
                </h3>
                <p className="text-content-muted text-[12px] italic mt-2 leading-relaxed">
                  {term.content}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-content-dim text-xs font-mono uppercase">
              Lade Definitionen...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlossaryModal;