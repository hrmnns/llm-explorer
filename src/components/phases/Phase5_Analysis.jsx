import React, { useState } from 'react';

const Phase5_Analysis = ({ simulator, setHoveredItem }) => {
  const { activeScenario, temperature, noise, finalOutputs } = simulator;
  const [selectedStep, setSelectedStep] = useState(null);

  if (!finalOutputs || finalOutputs.length === 0) return null;

  // Der Gewinner der Vorhersage
  const winner = [...finalOutputs].sort((a, b) => b.probability - a.probability)[0];

  // Definition der Analyse-Meilensteine
  const steps = [
    { 
      label: "Input Kontext", 
      val: activeScenario?.input_prompt || "Initialer Prompt", 
      icon: "📑",
      color: "border-slate-700",
      details: { 
        "Typ": "Sequenz-Start", 
        "Tokens": activeScenario?.phase_0_tokenization?.tokens.length,
        "Kontext": activeScenario?.name,
        "Trace-Analyse": "Der Ursprung des Pfades. Hier wurde die semantische Richtung durch deine Szenario-Wahl festgelegt."
      }
    },
    { 
      label: "System-Einfluss", 
      val: `Varianz: ${(noise * 100).toFixed(0)}% | Hitze: ${temperature.toFixed(2)}`, 
      icon: "🧪",
      color: "border-amber-500/30",
      details: { 
        "Noise Level": noise > 0.5 ? "Instabil" : "Konsistent",
        "Top-K Filter": "Aktiv",
        "Min-P": "7%",
        "Trace-Analyse": `Die Parameter haben den Suchraum ${temperature > 1.2 ? 'erweitert (kreativ)' : 'verengt (präzise)'} und das Rauschen kontrolliert.`
      }
    },
    { 
      label: "Semantischer Fokus", 
      val: `Cluster: ${winner.type}`, 
      icon: "🔍",
      color: "border-blue-500/30",
      details: { 
        "FFN-Aktivierung": winner.type,
        "Attention-Peak": "Primärer Fokus gefunden",
        "Trace-Analyse": `Das Modell hat das Wissen im Bereich '${winner.type}' als am relevantesten für diesen Kontext identifiziert.`
      }
    },
    { 
      label: "Finale Entscheidung", 
      val: winner.label, 
      icon: "🎯", 
      highlight: true,
      color: "border-green-500",
      details: { 
        "Wort": winner.label, 
        "Konfidenz": (winner.probability * 100).toFixed(1) + "%", 
        "Logit": winner.logit.toFixed(3),
        "Trace-Analyse": `Ergebnis: '${winner.label}'. Dieser Pfad ist die mathematisch wahrscheinlichste Lösung unter Berücksichtigung aller Filter.`
      }
    }
  ];

  const handleStepClick = (step, index) => {
    if (selectedStep === index) {
      setSelectedStep(null);
      setHoveredItem(null);
    } else {
      setSelectedStep(index);
      setHoveredItem({
        title: `Analyse: ${step.label}`,
        subtitle: "Kausaler Meilenstein",
        data: step.details
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-8 text-white animate-in fade-in duration-1000 select-none"
         onClick={() => { setSelectedStep(null); setHoveredItem(null); }}>
      
      <div className="text-center mb-10">
        <h2 className="text-slate-500 uppercase font-black tracking-[0.3em] text-[10px] mb-2">
          Finales Entscheidungsprotokoll
        </h2>
        <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full relative">
        {steps.map((step, i) => {
          const isSelected = selectedStep === i;
          
          return (
            <div key={i} className="flex flex-col items-center w-full relative">
              
              {/* Die glühende Verbindungslinie */}
              {i < steps.length - 1 && (
                <div className={`w-px h-10 bg-gradient-to-b from-slate-700 to-slate-800 transition-all duration-700 ${
                  selectedStep !== null && selectedStep >= i ? 'from-blue-500 to-blue-500 shadow-[0_0_10px_blue]' : ''
                }`}></div>
              )}

              <div 
                className={`
                  relative z-10 flex items-center gap-5 w-full p-5 rounded-[1.5rem] border backdrop-blur-md
                  transition-all duration-500 cursor-pointer group
                  ${isSelected 
                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)] scale-105' 
                    : step.highlight 
                      ? 'bg-green-500/10 border-green-500/50 shadow-lg shadow-green-500/10 hover:bg-green-500/20' 
                      : 'bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-800/50'}
                `}
                onClick={(e) => { e.stopPropagation(); handleStepClick(step, i); }}
                onMouseEnter={() => !selectedStep && setHoveredItem({
                  title: `Analyse: ${step.label}`,
                  subtitle: "Kausaler Meilenstein",
                  data: step.details
                })}
                onMouseLeave={() => !selectedStep && setHoveredItem(null)}
              >
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                  ${step.highlight ? 'bg-green-500/20' : 'bg-slate-800'}
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  {step.icon}
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-[8px] uppercase font-black tracking-widest text-slate-500 mb-1">
                    {step.label}
                  </span>
                  <span className={`text-sm font-bold truncate ${step.highlight ? 'text-green-400' : 'text-slate-200'}`}>
                    {step.val}
                  </span>
                </div>

                {isSelected && (
                  <div className="text-blue-500 animate-pulse text-xs font-black">ACTIVE</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Abschluss-Fazit */}
      <div className="mt-12 p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2rem] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <p className="text-[11px] leading-relaxed text-slate-400 italic">
          <span className="text-blue-400 font-bold not-italic uppercase tracking-tighter mr-2 text-[9px]">Synthese:</span>
          Das Modell wählte <span className="text-white font-bold">"{winner.label}"</span> mit einer Konfidenz von {(winner.probability * 100).toFixed(1)}%. 
          Dieser Pfad wurde maßgeblich durch die {temperature > 1.2 ? 'erhöhte Temperatur' : 'fokussierte Aufmerksamkeit'} begünstigt.
        </p>
      </div>
    </div>
  );
};

export default Phase5_Analysis;