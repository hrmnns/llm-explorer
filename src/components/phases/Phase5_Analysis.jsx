import React, { useState } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase5_Analysis = ({ simulator, activeScenario, setHoveredItem, theme }) => {
  const { temperature, noise, finalOutputs } = simulator;
  const [selectedStep, setSelectedStep] = useState(null);

  // Sicherheit: Falls noch keine Outputs da sind, nichts rendern
  if (!finalOutputs || finalOutputs.length === 0) return null;

  const winner = [...finalOutputs].sort((a, b) => b.probability - a.probability)[0];

  // --- DATEN EXTRAKTION ---
  // Wir nutzen primär den direkt übergebenen activeScenario Prop
  const scenarioName = activeScenario?.name || "Unbekanntes Szenario";
  const inputPrompt = activeScenario?.input_prompt || "Kein Eingabe-Prompt gefunden";
  const tokenCount = activeScenario?.phase_0_tokenization?.tokens?.length || 0;

  const getNarrative = () => {
    const tempEffect = temperature > 1.2 
      ? "einer experimentellen Suche nach kreativen Alternativen" 
      : "einer präzisen Kalkulation der höchsten Wahrscheinlichkeit";
    const noiseEffect = noise > 0.4 
      ? "trotz signifikanter semantischer Störsignale" 
      : "basierend auf einem sehr klaren Datenpfad";
    
    return `Die Wahl von "${winner.label}" ist das Resultat ${tempEffect}. Die KI priorisierte dabei den Bereich "${winner.type}" ${noiseEffect}.`;
  };

  const steps = [
    { 
      label: "1. Eingabe-Verarbeitung", 
      val: `"${inputPrompt}"`, // Prompt wird hier genannt
      icon: "📑",
      story: `Aus diesem Eingabe-Prompt wurden exakt ${tokenCount} Tokens generiert, die als mathematische Basis für die gesamte weitere Verarbeitung im LLM dienten.`,
      details: { 
        "Szenario": scenarioName, // Szenario-Name nur im Inspektor
        "Tokens": tokenCount,
        "Status": "Erfolgreich geladen"
      }
    },
    { 
      label: "2. Verarbeitungs-Modus", 
      val: `Temp: ${temperature.toFixed(2)} | Noise: ${noise.toFixed(2)}`, 
      icon: "🧪",
      story: `Die KI hat ${temperature > 1.1 ? 'aktiv nach unkonventionellen Verknüpfungen gesucht' : 'streng auf bewährte Muster geachtet'}. Das Rauschen liegt bei ${(noise * 100).toFixed(0)}%.`,
      details: { "Kreativität": temperature > 1.0 ? "Hoch" : "Gering", "Rauschen": (noise * 100).toFixed(0) + "%" }
    },
    { 
      label: "3. Wissens-Aktivierung", 
      val: `Cluster: ${winner.type}`, 
      icon: "🧠",
      story: `Im FFN-Layer leuchtete das Wissenssegment "${winner.type}" am stärksten auf. Die Attention-Layer haben diesen Pfad mathematisch bevorzugt.`,
      details: { "Primär-Fokus": winner.type, "Status": "Peak Aktivierung" }
    },
    { 
      label: "4. Finale Selektion", 
      val: winner.label, 
      icon: "🎯", 
      highlight: true,
      story: `Aus dem Vokabular wurde "${winner.label}" mit ${(winner.probability * 100).toFixed(1)}% Konfidenz extrahiert und durch die Sampling-Filter bestätigt.`,
      details: { "Resultat": winner.label, "Konfidenz": (winner.probability * 100).toFixed(1) + "%", "Logit": winner.logit?.toFixed(3) }
    }
  ];

  const handleStepClick = (step, index) => {
    if (selectedStep === index) {
      setSelectedStep(null);
      setHoveredItem(null);
    } else {
      setSelectedStep(index);
      setHoveredItem({
        title: step.label,
        subtitle: "Kausaler Meilenstein",
        data: step.details
      });
    }
  };

  return (
    <PhaseLayout
      title="Phase 5: Kausale Rekonstruktion"
      subtitle="Synthese des Entscheidungspfads"
      theme={theme}
      badges={[
        { text: winner.type, className: "border-blue-500/30 text-blue-400 bg-blue-500/5" },
        { text: `${(winner.probability * 100).toFixed(1)}% Konfidenz`, className: "border-green-500/30 text-green-400 bg-green-500/5" }
      ]}
      visualization={
        <div 
          className="w-full h-auto flex flex-col items-center px-2"
          onClick={() => { setSelectedStep(null); setHoveredItem(null); }}
        >
          {/* NARRATIVE SUMMARY */}
          <div className="mb-10 text-center max-w-xl mx-auto shrink-0">
            <p className="text-base lg:text-lg font-light leading-relaxed text-slate-300 italic">
              „{getNarrative()}“
            </p>
          </div>

          {/* KAUSALE KETTE */}
          <div className="flex flex-col items-center w-full max-w-md mx-auto relative pb-10">
            {steps.map((step, i) => {
              const isSelected = selectedStep === i;
              
              return (
                <React.Fragment key={i}>
                  <div 
                    className={`
                      relative z-10 flex flex-col w-full p-5 rounded-lg border backdrop-blur-md
                      transition-all duration-500 cursor-pointer group
                      ${isSelected 
                        ? 'bg-blue-600/20 border-blue-500 shadow-2xl scale-105' 
                        : step.highlight 
                          ? 'bg-green-500/10 border-green-500/30 shadow-lg' 
                          : 'bg-slate-900/50 border-white/5 hover:border-white/20'}
                    `}
                    onClick={(e) => { e.stopPropagation(); handleStepClick(step, i); }}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${step.highlight ? 'bg-green-500/20' : 'bg-slate-800'}`}>
                        {step.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7px] uppercase font-black tracking-widest text-slate-500">{step.label}</span>
                        <span className={`text-xs font-bold truncate ${step.highlight ? 'text-green-400' : 'text-slate-200'}`}>
                          {step.val}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] leading-snug text-slate-400 font-medium opacity-80">
                      {step.story}
                    </p>
                  </div>

                  {/* Verbindungslinie */}
                  {i < steps.length - 1 && (
                    <div className="flex flex-col items-center">
                       <div className={`w-px h-10 bg-gradient-to-b from-slate-700 to-slate-800 transition-all duration-700 ${
                         selectedStep !== null && selectedStep >= i ? 'from-blue-500 to-blue-500 shadow-[0_0_10px_blue]' : ''
                       }`}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="mt-4 mb-10 p-4 bg-slate-900/30 border border-dashed border-white/5 rounded-lg text-center w-full max-w-md opacity-40">
            <p className="text-[8px] uppercase tracking-[0.3em] text-slate-600 font-bold italic">Synthese abgeschlossen</p>
          </div>
        </div>
      }
    />
  );
};

export default Phase5_Analysis;