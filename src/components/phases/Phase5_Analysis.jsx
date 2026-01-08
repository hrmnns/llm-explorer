import React from 'react';

// setHoveredItem als Prop hinzufügen
const Phase5_Analysis = ({ simulator, setHoveredItem }) => {
  const { activeScenario, temperature, noise, finalOutputs } = simulator;

  if (!finalOutputs || finalOutputs.length === 0) return null;

  // Wir ermitteln das Wort mit der höchsten Wahrscheinlichkeit
  const winner = [...finalOutputs].sort((a, b) => b.probability - a.probability)[0];

  const steps = [
    { 
      label: "Input", 
      val: activeScenario?.input_prompt || "Was ist ein Hund?", 
      icon: "⌨️",
      details: { "Typ": "Prompt", "Tokens": activeScenario?.phase_0_tokenization?.tokens.length, "Status": "Verarbeitet" }
    },
    { 
      label: "Einfluss", 
      val: `Noise: ${noise.toFixed(2)} | Temp: ${temperature.toFixed(2)}`, 
      icon: "🎛️",
      details: { "Varianz": noise > 0 ? "Hoch" : "Stabil", "Kreativität": temperature > 1.0 ? "Expansiv" : "Präzise" }
    },
    { 
      label: "Wissens-Fokus", 
      val: winner.type, 
      icon: "🧠",
      details: { "FFN-Cluster": winner.type, "Aktivierung": "Primary Path", "Confidence": "High" }
    },
    { 
      label: "Resultat", 
      val: winner.label, 
      icon: "✨", 
      highlight: true,
      details: { "Finale Wahl": winner.label, "Wahrscheinlichkeit": (winner.probability * 100).toFixed(2) + "%", "Logit": winner.logit.toFixed(3) }
    }
  ];

  return (
    <div className="flex flex-col h-full w-full p-8 text-white animate-in slide-in-from-bottom duration-700">
      <h2 className="text-center text-slate-500 uppercase tracking-widest text-[10px] mb-10">
        Zusammenfassung: Der Entscheidungspfad
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center space-y-0 relative">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center w-full max-w-xs relative">
            {/* Verbindungslinie */}
            {i < steps.length - 1 && (
              <div className="absolute top-12 w-0.5 h-12 bg-gradient-to-b from-blue-500 to-slate-800 z-0"></div>
            )}

            <div 
              className={`relative z-10 flex items-center gap-4 w-full p-4 rounded-2xl border transition-all cursor-help group ${
                step.highlight ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-slate-900 border-slate-800'
              }`}
              // Hover Events für den Detail-Inspektor
              onMouseEnter={() => setHoveredItem({
                title: `Schritt ${i + 1}: ${step.label}`,
                data: step.details
              })}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="text-2xl group-hover:scale-125 transition-transform duration-300">{step.icon}</div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-bold">{step.label}</span>
                <span className={`text-sm font-medium ${step.highlight ? 'text-blue-300' : 'text-slate-200'}`}>
                  {step.val}
                </span>
              </div>
            </div>
            
            {/* Abstandshalter für die Linie */}
            {i < steps.length - 1 && <div className="h-12"></div>}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-center">
        <p className="text-xs text-slate-400 italic">
          "{winner.label}" wurde gewählt, weil die Kombination aus Attention-Profil und Parametern diesen Pfad mathematisch begünstigt hat.
        </p>
      </div>
    </div>
  );
};

export default Phase5_Analysis;