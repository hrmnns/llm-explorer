import React from 'react';
import { useScenarios } from '../context/ScenarioContext';

const InfoModal = ({ isOpen, onClose, theme }) => {
  const { scenariosData } = useScenarios();

  if (!isOpen) return null;

  // Ermittlung der Versions- und Buildnummer analog zum Footer
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '20260108-STABLE';
  const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '08.01.2026';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-lg rounded-[2rem] border shadow-2xl overflow-hidden animate-in zoom-in duration-300 ${
        theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
      }`}>
        
        {/* Header mit Branding */}
        <div className="p-8 pb-4 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 text-3xl">
            🧠
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-blue-500">
            LLM Explorer <span className="font-light opacity-50 text-sm tracking-normal">CHERWARE.DE</span>
          </h2>

          {/* VERSION & BUILD INFO (Synchron zum Footer/IntroScreen) */}
          <div className="flex flex-col items-center mt-2 space-y-1 opacity-60">
            <div className="flex gap-3 items-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
                Engine: <span className="text-purple-500 font-bold">v{scenariosData?.version || "?.?"}</span>
              </span>
              <span className="text-slate-800">|</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
                Build: <span className="text-blue-500 font-bold">{appVersion}</span>
              </span>
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600 opacity-40">
              {buildDate}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-4 space-y-6">
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Das Projekt</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Dieses Simulation-Tool wurde entwickelt, um die "Black Box" moderner Sprachmodelle (LLMs) zu öffnen. Es macht sichtbar, wie mathematische Vektoren, neuronale Filter und probabilistisches Sampling zusammenwirken, um eine scheinbar menschliche Antwort zu generieren.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <h4 className="text-[9px] font-black uppercase text-slate-500 mb-1">Technologie</h4>
              <ul className="text-[11px] text-slate-400 font-mono">
                <li>React 18</li>
                <li>Tailwind CSS</li>
                <li>Causal Logic Engine</li>
              </ul>
            </div>
            <div>
              <h4 className="text-[9px] font-black uppercase text-slate-500 mb-1">Entwicklung</h4>
              <p className="text-[11px] text-slate-400">
                Created as a thought partner <br />
                for educational purposes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Close Button */}
        <div className="p-8 pt-4">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black rounded-xl uppercase tracking-widest transition-all"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;