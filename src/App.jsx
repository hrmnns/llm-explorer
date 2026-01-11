import React, { useState, useEffect } from 'react';
import { ScenarioProvider, useScenarios } from './context/ScenarioContext';
import { useLLMSimulator } from './hooks/useLLMSimulator';

// Komponenten-Importe
import Footer from './components/Footer';
import PhaseNavigator from './components/PhaseNavigator';
import PhaseSidebar from './components/PhaseSidebar';
import InternalHeader from './components/InternalHeader';
import GlossaryModal from './components/GlossaryModal';
import InfoModal from './components/InfoModal';
import IntroScreen from './components/IntroScreen';

// Phasen-Importe
import Phase0_Tokenization from './components/phases/Phase0_Tokenization';
import Phase1_Embedding from './components/phases/Phase1_Embedding';
import Phase2_Attention from './components/phases/Phase2_Attention';
import Phase3_FFN from './components/phases/Phase3_FFN';
import Phase4_Decoding from './components/phases/Phase4_Decoding';
import Phase5_Analysis from './components/phases/Phase5_Analysis';

// --- HAUPT APP CONTENT ---

function AppContent() {
  const [activePhase, setActivePhase] = useState(-1);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [glossaryData, setGlossaryData] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const { scenarios, activeScenario, handleScenarioChange } = useScenarios();
  const simulator = useLLMSimulator(activeScenario);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/glossary.json`)
      .then(res => res.json())
      .then(data => setGlossaryData(data))
      .catch(err => console.error("Glossar-Ladefehler:", err));
  }, []);

  // Automatischer Scroll nach oben bei Phasenwechsel
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activePhase]);

  // Inspektor bei Phasenwechsel leeren
  useEffect(() => {
    setHoveredItem(null);
  }, [activePhase]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  if (!scenarios || scenarios.length === 0) {
    return <div className="bg-slate-950 min-h-screen flex items-center justify-center text-blue-500 font-mono uppercase text-xs">Loading Data...</div>;
  }

  return (
    <div className={`min-h-screen lg:h-screen flex flex-col transition-colors duration-700 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    } font-sans`}>

      <InternalHeader
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenHelp={() => setIsHelpOpen(true)}
        scenarios={scenarios}
        activeScenario={activeScenario}
        showScenarioSelector={activePhase !== -1}
        onScenarioChange={(id) => {
          setActivePhase(0);
          handleScenarioChange(id);
        }}
        onRestart={() => {
          setActivePhase(-1);
          setHoveredItem(null);
        }}
        onOpenInfo={() => setIsInfoOpen(true)}
      />

      {activePhase === -1 ? (
        <main className="flex-1 flex overflow-hidden">
          <IntroScreen
            theme={theme}
            onStart={(id) => {
              handleScenarioChange(id);
              setActivePhase(0);
            }}
          />
        </main>
      ) : (
        <>
          <PhaseNavigator activePhase={activePhase} setActivePhase={setActivePhase} activeScenario={activeScenario} theme={theme} />

          {/* PT-4 sorgt für den optisch ansprechenden Abstand zum Header/Nav auf allen Geräten */}
          <main className="flex-1 flex flex-col items-center pt-4 pb-4 px-4 overflow-y-auto lg:overflow-hidden min-h-0">
            <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 h-auto lg:h-full min-h-0">

              {/* LINKES PANEL */}
              <div className={`w-full lg:flex-1 relative border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-500 flex flex-col min-h-[500px] lg:min-h-0 ${
                theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white/80 border-slate-200'
              }`}>
                {(!activeScenario || !simulator) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div key={activeScenario.id} className="flex-1 flex flex-col min-h-0 p-4 lg:p-6 lg:overflow-y-auto custom-scrollbar">
                    {activePhase === 0 && <Phase0_Tokenization simulator={simulator} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 1 && <Phase1_Embedding simulator={simulator} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 2 && <Phase2_Attention simulator={simulator} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 3 && <Phase3_FFN simulator={simulator} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 4 && <Phase4_Decoding simulator={simulator} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 5 && <Phase5_Analysis simulator={simulator} activeScenario={activeScenario} theme={theme} setHoveredItem={setHoveredItem} />}
                  </div>
                )}
              </div>

              {/* RECHTES PANEL */}
              <aside className="w-full lg:w-[340px] h-auto lg:h-full flex-none overflow-hidden rounded-2xl border border-white/5 shadow-xl">
                <PhaseSidebar
                  activePhase={activePhase}
                  activeScenario={activeScenario}
                  simulator={simulator}
                  hoveredItem={hoveredItem}
                  theme={theme}
                  isExpanded={isSidebarExpanded}
                  setIsExpanded={setIsSidebarExpanded}
                />
              </aside>

              {/* MOBILER ABSTANDHALTER: Verhindert, dass die Sidebar von der fixierten Bottom-Nav verdeckt wird */}
              <div className="lg:hidden h-36 w-full shrink-0 pointer-events-none" />
            </div>
          </main>
        </>
      )}

      <Footer className="shrink-0" />
      <GlossaryModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} data={glossaryData} />
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} theme={theme} />
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