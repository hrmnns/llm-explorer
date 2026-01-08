import React from 'react';

const PhaseSidebar = ({ activePhase, activeScenario, simulator, theme, isExpanded, setIsExpanded }) => {
  const phaseContent = [
    { title: "Tokenisierung", details: "Text wird in kleine Einheiten (Tokens) zerlegt. Jeder Token erhält eine ID." },
    { title: "Vektorraum", details: "Wörter werden im Vektorraum platziert. Mathematische Nähe entspricht semantischer Ähnlichkeit." },
    { title: "Attention", details: "Das Modell bestimmt, welche Wörter im Kontext für die Bedeutung entscheidend sind." },
    { title: "FFN & Wissen", details: "Aktivierung gespeicherten Wissens in Kategorien wie 'Wissenschaft' oder 'Poesie'." },
    { title: "Decoding", details: "Berechnung der Wahrscheinlichkeiten. Hier entscheidet die 'Temperature' über Präzision oder Kreativität." },
    { title: "Analyse", details: "Interpretation der finalen Ergebnisse und des gewählten Pfades." }
  ];

  if (!isExpanded) return (
    <button onClick={() => setIsExpanded(true)} className={`lg:h-full p-4 rounded-2xl border flex lg:flex-col items-center justify-center hover:bg-blue-600/10 transition-all ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
      <span className="lg:rotate-90 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 whitespace-nowrap">Details einblenden</span>
    </button>
  );

  // Hilfsfunktion für die Metriken-Anzeige
  const MetricBox = ({ label, value, unit = "", color = "text-blue-500" }) => (
    <div className="flex justify-between items-center p-3 rounded-xl bg-slate-500/5 border border-slate-500/10 transition-all hover:bg-slate-500/10">
      <span className="text-[10px] uppercase font-black opacity-40 tracking-tighter">{label}</span>
      <span className={`text-[12px] font-mono font-bold ${color}`}>{value}{unit}</span>
    </div>
  );

  return (
    <div className={`w-full lg:w-80 h-full flex flex-col p-6 rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200'}`}>
      
      {/* Header Bereich */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">System Monitoring</h3>
          <h4 className="text-sm font-bold uppercase tracking-tighter">{phaseContent[activePhase]?.title}</h4>
        </div>
        <button onClick={() => setIsExpanded(false)} className="text-[20px] opacity-30 hover:opacity-100 transition-opacity">×</button>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* 1. Technische Erklärung */}
        <section>
          <p className="text-[10px] font-black text-blue-400 mb-3 uppercase tracking-widest">Definition</p>
          <div className="p-4 rounded-2xl bg-blue-600/5 border border-blue-500/10 border-l-4 border-l-blue-500">
            <p className="text-[11px] leading-relaxed opacity-80 italic">{phaseContent[activePhase]?.details}</p>
          </div>
        </section>

        {/* 2. Live-Metriken (Phasenspezifisch) */}
        <section className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Live Parameter</p>
          
          <div className="space-y-2">
            {/* Immer sichtbar: Szenario Kontext */}
            <MetricBox label="Kontext" value={activeScenario?.name} />

            {/* Spezifisch für Phase 1 & 2 */}
            {(activePhase === 1 || activePhase === 2) && (
              <>
                <MetricBox label="Noise Level" value={(simulator.noise * 100).toFixed(0)} unit="%" />
                <MetricBox label="Pos. Weight" value={simulator.positionWeight.toFixed(2)} />
              </>
            )}

            {/* Spezifisch für Phase 3 */}
            {activePhase === 3 && (
              <>
                <MetricBox label="MLP Filter" value={simulator.mlpThreshold.toFixed(2)} />
                <MetricBox label="Profile" value={simulator.activeProfileId} color="text-green-500" />
              </>
            )}

            {/* Spezifisch für Phase 4 (Decoding) */}
            {activePhase === 4 && (
              <>
                <MetricBox 
                  label="Temperature" 
                  value={simulator.temperature.toFixed(2)} 
                  color={simulator.temperature > 1.2 ? "text-orange-500" : "text-blue-500"} 
                />
                <div className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-[9px] uppercase font-black opacity-40 italic">Halluzinations-Risiko</span>
                     <span className={`text-[10px] font-bold ${simulator.temperature > 1.5 ? "text-red-500" : "text-orange-400"}`}>
                        {simulator.temperature > 1.5 ? "HOCH" : simulator.temperature > 0.8 ? "MITTEL" : "GERING"}
                     </span>
                   </div>
                   <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${simulator.temperature > 1.5 ? "bg-red-500" : "bg-orange-500"}`} 
                        style={{ width: `${Math.min(simulator.temperature * 40, 100)}%` }}
                      ></div>
                   </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 3. Schnell-Info Fußzeile */}
        <div className="pt-4 border-t border-slate-500/10">
          <p className="text-[9px] leading-relaxed opacity-40 uppercase font-mono">
            Eingabe: "{activeScenario?.phase_0_tokenization?.tokens.map(t => t.text).join(" ")}"
          </p>
        </div>

      </div>
    </div>
  );
};

export default PhaseSidebar;