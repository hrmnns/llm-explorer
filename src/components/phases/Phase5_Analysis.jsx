import React, { useState, useMemo } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase5_Analysis = ({ simulator, activeScenario, setHoveredItem, theme }) => {
  const { 
    temperature, 
    noise, 
    mlpThreshold, 
    positionWeight, 
    activeProfileId, 
    finalOutputs, 
    activeAttention, 
    selectedToken 
  } = simulator;
  
  const [selectedStep, setSelectedStep] = useState(null);

  const pipelineSignal = activeAttention?.avgSignal || 1.0;
  const isCritical = pipelineSignal < 0.4;

  if (!finalOutputs || finalOutputs.length === 0) return null;

  const winner = useMemo(() => {
    let target = selectedToken;
    if (!target) {
      target = [...finalOutputs].sort((a, b) => 
        (b.dynamicProb ?? b.probability) - (a.dynamicProb ?? a.probability)
      )[0];
    }
    
    if (target) {
      return {
        ...target,
        safeLabel: target.label || target.text || target.token || "Unbekannt",
        safeType: target.type || target.category || "Allgemein"
      };
    }
    return { safeLabel: "Berechne...", safeType: "N/A", probability: 0 };
  }, [finalOutputs, selectedToken]);

  const displayProbability = winner.dynamicProb !== undefined ? winner.dynamicProb : (winner.probability || 0);

  const scenario = activeScenario || simulator.activeScenario;
  const tokens = scenario?.phase_0_tokenization?.tokens || [];
  const tokenCount = tokens.length;

  // --- AUSFÜHRLICHE NARRATIVE LOGIK ---
  const getNarrative = () => {
    const label = winner.safeLabel;
    const mostProbable = [...finalOutputs].sort((a, b) => 
      (b.dynamicProb || b.probability) - (a.dynamicProb || a.probability)
    )[0];
    const mpLabel = mostProbable?.label || mostProbable?.text || mostProbable?.token;
    
    // Fall 1: Hohe Temperature / Zufallswahl
    if (mpLabel && label !== mpLabel && temperature > 1.0) {
        return `Kreative Inferenz: Das Modell hat sich gegen den statistischen Favoriten "${mpLabel}" entschieden. Durch die Temperature von ${temperature.toFixed(1)} wurde der Sampling-Radius erweitert, was die Wahl von "${label}" ermöglichte – ein Zeichen für stochastische Flexibilität.`;
    }

    // Fall 2: System-Instabilität
    if (isCritical) {
      return `Kritisches Signal: Bei einer Signal-Integrität von nur ${(pipelineSignal * 100).toFixed(0)}% ist die Entscheidung für "${label}" mathematisch unsicher. Das hohe Grundrauschen (Noise: ${noise.toFixed(1)}) überlagert die gelernten Aufmerksamkeitsmuster.`;
    }

    // Fall 3: Spezifische Szenarien (Schloss / Winograd)
    if (label === "Türschloss") {
      return `Logische Selektion: Der Kontext ("Einbrecher") hat erfolgreich den Logik-Head aktiviert. Dies führte zu einer Verschiebung im Vektorraum, die "${label}" gegenüber der architektonischen Bedeutung priorisierte.`;
    }
    
    if (label === "Tasche") {
      return `Kontextuelle Auflösung: Das Modell hat die Pronomen-Referenz ("sie") erfolgreich aufgelöst. Da die Trophäe physikalisch nicht in die Tasche passt, wurde das Weltwissen im FFN genutzt, um "${label}" als logischen Anker zu setzen.`;
    }
    
    return `Standard-Inferenz: Mit einer Konfidenz von ${(displayProbability * 100).toFixed(1)}% wurde "${label}" als das kohärenteste nächste Token identifiziert. Die Pipeline zeigt eine stabile Verarbeitung über alle Aufmerksamkeits-Layer hinweg.`;
  };

  // --- AUSFÜHRLICHES STEPS-MAPPING ---
  const steps = [
    {
      label: "1. Tokenisierung & Position",
      val: `${tokenCount} Einheiten`, 
      icon: "📑",
      story: `Der Eingabetext wurde in ${tokenCount} diskrete Tokens zerlegt. Jedes Element erhielt eine Positions-Kodierung, damit das Modell die syntaktische Struktur (Wortreihenfolge) innerhalb des Vektorraums mathematisch erfassen kann.`,
      details: { "Szenario": scenario?.name, "Token-Dichte": "Normal" }
    },
    {
      label: "2. Embedding Modulation",
      val: noise > 0.5 ? "Instabil" : "Stabil", 
      icon: "📍",
      story: `Die Initial-Vektoren wurden mit einer Gewichtung von ${(positionWeight * 100).toFixed(0)}% für Positionsdaten angereichert. ${noise > 0.8 ? `Massives Rauschen (${noise.toFixed(2)}) verzerrt aktuell die semantische Klarheit der Einbettungen.` : `Das Signal ist mit einem Noise-Level von ${noise.toFixed(2)} hochgradig präzise.`}`,
      details: { "Signal-Stärke": (pipelineSignal * 100).toFixed(0) + "%" }
    },
    {
      label: "3. Multi-Head Attention",
      val: "Kontext-Kopplung",
      icon: "🔍",
      story: `In dieser Phase berechnen die Attention-Heads die Relevanz-Beziehungen zwischen den Wörtern. Das Modell fokussiert sich auf Schlüssel-Tokens, um die Polysemie (Mehrdeutigkeit) aufzulösen und den globalen Kontext zu sichern.`,
      details: { "Active-Heads": "Dynamic", "Context-Window": "Full" }
    },
    {
      label: "4. FFN (Weltwissen-Abgleich)",
      val: `Cluster: ${winner.safeType}`, 
      icon: "🧠",
      story: `Das Feed-Forward-Netzwerk gleicht das kontextualisierte Signal mit internen Kategorien ab. Hier leuchtete das Wissen für "${winner.safeType}" auf. Der MLP-Schwellenwert von ${mlpThreshold.toFixed(2)} filtert irrelevante Assoziationen heraus.`,
      details: { "Aktivierungs-Stärke": (displayProbability * 0.9).toFixed(2) }
    },
    {
      label: "5. Probabilistischer Output",
      val: winner.safeLabel, 
      icon: temperature > 1.2 ? "🎲" : "🎯", 
      highlight: true,
      story: `Das Decoding liefert "${winner.safeLabel}" als Sieger. Durch die Softmax-Funktion und das gewählte Sampling (${temperature > 1.0 ? 'Kreativ' : 'Präzise'}) wurde dieses Token aus dem Vektorraum in Text zurückverwandelt.`,
      details: {
        "Final-Logit": (displayProbability * 12).toFixed(2),
        "Temperature-Shift": temperature.toFixed(1)
      }
    }
  ];

  const handleStepClick = (step, index) => {
    if (selectedStep === index) {
      setSelectedStep(null);
      setHoveredItem(null);
    } else {
      setSelectedStep(index);
      setHoveredItem({ title: step.label, subtitle: "Pipeline-Detail", data: step.details });
    }
  };

  return (
    <PhaseLayout
      title="Phase 5: Pipeline-Analyse"
      subtitle="Zusammenfassender Entscheidungspfad"
      theme={theme}
      badges={[
        { text: `Signal: ${(pipelineSignal * 100).toFixed(0)}%`, className: isCritical ? "bg-red-500/20 text-red-400" : "bg-blue-500/10 text-blue-400" },
        { text: `${(displayProbability * 100).toFixed(1)}% Konfidenz`, className: "bg-green-500/10 text-green-400" }
      ]}
      visualization={
        <div className="w-full flex flex-col items-center px-2 py-4" onClick={() => { setSelectedStep(null); setHoveredItem(null); }}>
          
          <div className="mb-10 text-center max-w-3xl mx-auto border-b border-white/10 pb-10">
            <h3 className={`text-[10px] uppercase font-black tracking-[0.3em] mb-4 ${isCritical ? 'text-red-500' : 'text-blue-400'}`}>
              Das System-Urteil
            </h3>
            <p className={`text-base lg:text-lg font-light leading-relaxed italic px-8 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
              „{getNarrative()}“
            </p>
          </div>

          <div className="flex flex-col items-center w-full max-w-2xl mx-auto relative pb-10">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <div 
                  className={`relative z-10 flex flex-col w-full p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer group
                    ${selectedStep === i 
                      ? 'bg-blue-600/10 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)] scale-[1.03]' 
                      : (theme === 'dark' ? 'bg-slate-900/60 border-white/5 hover:border-white/20' : 'bg-white border-slate-200 shadow-md hover:border-blue-300')}`}
                  onClick={(e) => { e.stopPropagation(); handleStepClick(step, i); }}
                >
                  <div className="flex items-center gap-6 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${i === 4 ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300'}`}>
                      {step.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 mb-1">{step.label}</span>
                      <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{step.val}</span>
                    </div>
                  </div>
                  <p className={`text-[13px] leading-relaxed font-medium italic ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {step.story}
                  </p>
                </div>
                
                {i < steps.length - 1 && (
                  <div className="flex flex-col items-center">
                    <div className={`w-px h-12 ${selectedStep !== null && selectedStep >= i ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]' : (theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200')}`}></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      }
    />
  );
};

export default Phase5_Analysis;