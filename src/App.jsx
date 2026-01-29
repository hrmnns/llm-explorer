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
import PhaseBriefing from './components/PhaseBriefing';

// Phasen-Importe
import Phase0_Tokenization from './components/phases/Phase0_Tokenization';
import Phase1_Embedding from './components/phases/Phase1_Embedding';
import Phase2_Attention from './components/phases/Phase2_Attention';
import Phase3_FFN from './components/phases/Phase3_FFN';
import Phase4_Decoding from './components/phases/Phase4_Decoding';
import Phase5_Analysis from './components/phases/Phase5_Analysis';

function AppContent() {
  // 1. STATES
  const [activePhase, setActivePhase] = useState(-1);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [glossaryData, setGlossaryData] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [briefings, setBriefings] = useState({});
  
  // Zentraler Theme-State (Steuert die .dark Klasse am Root)
  const [theme, setTheme] = useState('dark');

  const [autoShowBriefing, setAutoShowBriefing] = useState(() => {
    const saved = localStorage.getItem('llm_explorer_auto_briefing');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // 2. CONTEXT & SIMULATOR
  const { scenarios, activeScenario, handleScenarioChange } = useScenarios();
  const simulator = useLLMSimulator(activeScenario);

  // 3. EFFECTS: THEME-SYNCHRONISIERUNG
  // Dies sorgt dafür, dass die index.css Variablen korrekt umschalten
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Daten laden
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/glossary.json`)
      .then(res => res.json())
      .then(data => setGlossaryData(data))
      .catch(err => console.error("Glossar-Ladefehler:", err));

    fetch(`${import.meta.env.BASE_URL}data/phaseBriefings.json`)
      .then(res => res.json())
      .then(data => setBriefings(data))
      .catch(err => console.error("Briefing-Ladefehler:", err));
  }, []);

  // Szenario-Reset Logik
  useEffect(() => {
    if (!activeScenario || !simulator) return;
    if (simulator.resetParameters) simulator.resetParameters();

    const firstProfileId = activeScenario.phase_3_ffn?.activation_profiles?.[0]?.ref_profile_id
      || activeScenario.phase_2_attention?.attention_profiles?.[0]?.id;

    if (firstProfileId && simulator.setActiveProfileId) {
      simulator.setActiveProfileId(firstProfileId);
    }
  }, [activeScenario?.id]);

  // UI-Utilities
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (activePhase >= 0 && autoShowBriefing) setShowBriefing(true);
    setHoveredItem(null);
  }, [activePhase]);

  // 4. HANDLER
  const toggleAutoShowBriefing = (value) => {
    setAutoShowBriefing(value);
    localStorage.setItem('llm_explorer_auto_briefing', JSON.stringify(value));
  };

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // 5. LOADING STATE
  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="bg-explore-app min-h-screen flex items-center justify-center text-blue-500 font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="uppercase text-[10px] tracking-widest">Neural Pipeline Loading...</span>
        </div>
      </div>
    );
  }

  // 6. RENDER LOGIK
  return (
    <div className="min-h-screen lg:h-screen flex flex-col transition-colors duration-700 bg-explore-app text-content-main font-sans overflow-hidden">

      {/* GLOBALER BRIEFING-DIALOG */}
      {showBriefing && briefings[activePhase] && (
        <PhaseBriefing
          data={briefings[activePhase]}
          onClose={() => setShowBriefing(false)}
          theme={theme}
          autoShow={autoShowBriefing}
          onToggleAutoShow={toggleAutoShowBriefing}
        />
      )}

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
        onReset={simulator?.resetParameters}
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
          <PhaseNavigator
            activePhase={activePhase}
            setActivePhase={setActivePhase}
            activeScenario={activeScenario}
            theme={theme}
            onOpenBriefing={() => setShowBriefing(true)}
          />

          <main className="flex-1 flex flex-col items-center pt-4 pb-4 px-4 overflow-y-auto lg:overflow-hidden min-h-0">
            <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4 h-auto lg:h-full min-h-0">

              {/* VISUALISIERUNGS-PANEL */}
              <div className="w-full lg:flex-[2.5] relative border border-explore-border rounded-[2rem] shadow-2xl overflow-hidden bg-explore-viz backdrop-blur-md transition-all duration-500 flex flex-col min-h-[500px] lg:min-h-0">
                {(!activeScenario || !simulator) ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-explore-app/50 backdrop-blur-sm z-50">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <span className="text-[10px] font-mono uppercase text-blue-400 tracking-widest">Reconfiguring Pipeline...</span>
                  </div>
                ) : (
                  <div key={activeScenario.id} className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-700">
                    {activePhase === 0 && <Phase0_Tokenization simulator={simulator} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 1 && <Phase1_Embedding simulator={simulator} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 2 && <Phase2_Attention simulator={simulator} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 3 && <Phase3_FFN simulator={simulator} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 4 && <Phase4_Decoding simulator={simulator} activeScenario={activeScenario} theme={theme} setHoveredItem={setHoveredItem} />}
                    {activePhase === 5 && <Phase5_Analysis simulator={simulator} activeScenario={activeScenario} theme={theme} setHoveredItem={setHoveredItem} />}
                  </div>
                )}
              </div>

              {/* INSPEKTOR / SIDEBAR */}
              <aside className={`w-full lg:w-[360px] h-auto lg:h-full flex-none transition-all duration-500 ${isSidebarExpanded ? 'opacity-100' : 'lg:w-16'}`}>
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

            </div>
          </main>
        </>
      )}

      <Footer className="shrink-0" />

      {/* MODALS */}
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