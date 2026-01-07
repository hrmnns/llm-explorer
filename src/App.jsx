import React, { useState, useEffect } from 'react';
import { ScenarioProvider, useScenarios } from './context/ScenarioContext';
import Header from './components/Header';
import PhaseNavigator from './components/PhaseNavigator';
import { useLLMSimulator } from './hooks/useLLMSimulator';

// Phasen-Importe
import Phase0_Tokenization from './components/phases/Phase0_Tokenization';
import Phase1_Embedding from './components/phases/Phase1_Embedding';
import Phase2_Attention from './components/phases/Phase2_Attention';
import Phase3_FFN from './components/phases/Phase3_FFN';
import Phase4_Decoding from './components/phases/Phase4_Decoding';
import Phase5_Analysis from './components/phases/Phase5_Analysis';

// --- INTERNE KOMPONENTEN ---

const GlossaryModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const terms = data?.terms || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <div>
            <h2 className="text-xl font-bold text-blue-400 uppercase tracking-tighter">Wissens-Datenbank</h2>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">Glossar Version {data?.version || '1.1'}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-3xl font-light px-2">&times;</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 bg-slate-950/50">
          {terms.length > 0 ? terms.map((term, i) => (
            <div key={i} className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-start mb-2 gap-4">
                <div>
                  <span className="text-[8px] text-blue-500/60 uppercase font-black tracking-widest block mb-1">{term.category}</span>
                  <h3 className="text-blue-400 text-sm font-bold uppercase">{term.title}</h3>
                </div>
                {/* Sichtbarer Link-Button */}
                {term.url && (
                  <a
                    href={term.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md transition-all flex items-center gap-2 font-bold shadow-lg shadow-blue-900/20"
                  >
                    INFO ↗
                  </a>
                )}
              </div>
              <p className="text-slate-300 text-[12px] leading-relaxed italic">{term.content}</p>
            </div>
          )) : (
            <div className="text-center py-10 text-slate-600 animate-pulse uppercase text-xs tracking-widest font-mono">
              Suche Datensätze...
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
          <button onClick={onClose} className="px-10 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black rounded-lg uppercase transition-all tracking-widest">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  // Diese Variablen werden jetzt von der neuen vite.config.js befüllt
  const buildNo = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'DEV-VERSION';
  const dateStr = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '---';

  return (
    <footer className="w-full p-4 flex justify-between items-center bg-transparent border-t border-slate-900/50">
      <div className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.3em] opacity-40">
        Neural Architecture Simulation Lab
      </div>
      <div className="flex gap-4 items-center">
        <div className="text-[9px] text-slate-500 font-mono bg-slate-900/50 px-3 py-1 rounded border border-slate-800/50">
          BUILD: <span className="text-blue-500 font-bold">{buildNo}</span>
        </div>
        <div className="text-[9px] text-slate-500 font-mono opacity-40">
          {dateStr}
        </div>
      </div>
    </footer>
  );
};

function AppContent() {
  const [activePhase, setActivePhase] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [glossaryData, setGlossaryData] = useState(null);

  const { activeScenario } = useScenarios();
  const simulator = useLLMSimulator(activeScenario);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/glossary.json`)
      .then(res => res.json())
      .then(data => setGlossaryData(data))
      .catch(err => console.error("Glossar-Ladefehler:", err));
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  if (!activeScenario) {
    return (
      <div className="bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="text-blue-500 font-mono uppercase tracking-[0.5em] animate-pulse text-xs">
          Booting Neural Core...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-700 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Header onOpenHelp={() => setIsHelpOpen(true)} theme={theme} toggleTheme={toggleTheme} />
      <PhaseNavigator activePhase={activePhase} setActivePhase={setActivePhase} theme={theme} />

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className={`w-full max-w-5xl h-[620px] border rounded-[2rem] shadow-2xl relative overflow-hidden backdrop-blur-md transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800 shadow-black/50' : 'bg-white/80 border-slate-200 shadow-slate-200'
          }`}>
          {activePhase === 0 && <Phase0_Tokenization simulator={simulator} theme={theme} />}
          {activePhase === 1 && <Phase1_Embedding simulator={simulator} theme={theme} />}
          {activePhase === 2 && <Phase2_Attention simulator={simulator} theme={theme} />}
          {activePhase === 3 && <Phase3_FFN simulator={simulator} theme={theme} />}
          {activePhase === 4 && <Phase4_Decoding simulator={simulator} theme={theme} />}
          {activePhase === 5 && <Phase5_Analysis simulator={simulator} theme={theme} />}
        </div>
      </main>

      <Footer />
      <GlossaryModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} data={glossaryData} />
    </div>
  );
}

export default function App() {
  return (
    <ScenarioProvider>
      <AppContent />
    </ScenarioProvider>
  );
}