import React, { useState, useMemo, useEffect } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase5_Analysis = ({ simulator, activeScenario, setHoveredItem, theme }) => {
  const { temperature, noise, mlpThreshold, positionWeight, activeProfileId, finalOutputs, activeAttention } = simulator;
  const [selectedStep, setSelectedStep] = useState(null);

  // Pipeline-Integrität abgreifen
  const pipelineSignal = activeAttention?.avgSignal || 1.0;
  const isCritical = pipelineSignal < 0.4;
  const isDegraded = pipelineSignal < 0.7;

  // Basis-Daten validieren
  if (!finalOutputs || finalOutputs.length === 0) return null;

  const winner = useMemo(() => [...finalOutputs].sort((a, b) => b.probability - a.probability)[0], [finalOutputs]);

  // Daten-Extraktion
  const scenario = activeScenario || simulator.activeScenario;
  const scenarioName = scenario?.name || "Standard Szenario";
  const inputPrompt = scenario?.input_prompt || "Lade Eingabe-Prompt...";
  const tokens = scenario?.phase_0_tokenization?.tokens || [];
  const tokenCount = tokens.length;

  // Daten für Schritt 3 (Attention)
  const activeProfile = scenario?.phase_2_attention?.attention_profiles?.find(p => p.id === activeProfileId);
  const profileLabel = activeProfile?.label || activeProfileId;
  const primaryRule = activeProfile?.rules?.[0];
  const token1 = tokens.find(t => Number(t.id) === Number(primaryRule?.source))?.text || tokens[0]?.text || "Token A";
  const token2 = tokens.find(t => Number(t.id) === Number(primaryRule?.target))?.text || tokens[1]?.text || "Token B";

  // --- NARRATIVE LOGIK ---
  const getNarrative = () => {
    if (isCritical) return `Die mathematische Reise war extrem turbulent: Durch massives Rauschen wurde der Pfad zu "${winner.label}" eher zufällig gewählt. Die Vorhersage ist höchstwahrscheinlich eine Halluzination.`;
    if (isDegraded) return `Das Ergebnis ist stabil, aber unpräzise: Das Modell tendiert zu "${winner.label}", zeigt jedoch durch Signalverluste bereits erste Zeichen von Unsicherheit.`;
    return `Die mathematische Reise ist beendet: Basierend auf Ihrem Prompt hat das Modell einen klaren Pfad zu "${winner.label}" innerhalb des ${winner.type}-Speichers identifiziert.`;
  };

  const steps = [
    {
      label: "1. Tokenisierung",
      val: `${tokenCount} Recheneinheiten`, 
      icon: "📑",
      story: `Der Prompt wurde in ${tokenCount} mathematische Tokens zerlegt. Dies bildet das unveränderliche Skelett der gesamten Inferenz.`,
      details: { "Szenario": scenarioName, "Tokens": tokenCount, "Status": "Vollständig" }
    },
    {
      label: "2. Embedding & Noise",
      val: `Vektorraum-Verortung`, 
      icon: "📍",
      story: `Die Tokens wurden als Vektoren platziert. ${noise > 1.5 ? 'Starkes Rauschen hat die semantischen Koordinaten jedoch signifikant verzerrt.' : 'Die Platzierung war präzise und stabil.'}`,
      details: { "Stabilität": `${(pipelineSignal * 100).toFixed(0)}%`, "Noise-Level": noise.toFixed(2), "Pos.-Encoding": (positionWeight * 100).toFixed(0) + "%" }
    },
    {
      label: "3. Self-Attention",
      val: `Kontext-Kopplung`, 
      icon: "🔍",
      story: `Basierend auf '${profileLabel}' wurde versucht, '${token1}' mit '${token2}' zu verknüpfen. ${isDegraded ? 'Durch das Rauschen wurde diese Brücke jedoch instabil.' : 'Die kausale Verbindung blieb sauber erhalten.'}`,
      details: { "Fokus": profileLabel, "Signal-Qualität": (pipelineSignal * 100).toFixed(0) + "%", "Kopplung": `${token1} ↔ ${token2}` }
    },
    {
      label: "4. FFN (MLP)",
      val: `Wissens-Aktivierung`, 
      icon: "🧠",
      story: `Das Netzwerk hat das Signal dem Cluster '${winner.type}' zugeordnet. Der Filter (Threshold: ${mlpThreshold.toFixed(2)}) hat ${isCritical ? 'kaum noch echte Signale von Noise unterscheiden können.' : 'erfolgreich zwischen Relevanz und Rauschen unterschieden.'}`,
      details: { "Aktiviert": winner.type, "Threshold": mlpThreshold.toFixed(2), "Resultat": "Pattern Matched" }
    },
    {
      label: "5. Probabilistischer Output",
      val: winner.label, 
      icon: winner.isCritical ? "⚠️" : "🎯",
      highlight: true,
      story: `Mit ${(winner.probability * 100).toFixed(1)}% Konfidenz wurde '${winner.label}' gewählt. Die Temperature von ${temperature.toFixed(2)} sorgte dabei für die finale ${temperature > 1.2 ? 'kreative Varianz.' : 'mathematische Strenge.'}`,
      details: {
        "Gewinner": winner.label,
        "Konfidenz": (winner.probability * 100).toFixed(1) + "%",
        "Halluzinations-Risiko": winner.isCritical ? "HOCH" : "Minimal",
        "Sampling": temperature > 1.2 ? "Stochastisch" : "Deterministisch"
      }
    }
  ];

  const handleStepClick = (step, index) => {
    if (selectedStep === index) {
      setSelectedStep(null);
      setHoveredItem(null);
    } else {
      setSelectedStep(index);
      setHoveredItem({ title: step.label, subtitle: "Kausaler Meilenstein", data: step.details });
    }
  };

  return (
    <PhaseLayout
      title="Phase 5: Pipeline-Analyse"
      subtitle="Zusammenfassung des Entscheidungspfads"
      theme={theme}
      badges={[
        { text: `System-Signal: ${(pipelineSignal * 100).toFixed(0)}%`, className: isCritical ? "bg-red-500/20 text-red-400" : "bg-blue-500/10 text-blue-400" },
        { text: `${(winner.probability * 100).toFixed(1)}% Konfidenz`, className: winner.isCritical ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400" }
      ]}
      visualization={
        <div className="w-full h-auto flex flex-col items-center px-2 py-4" onClick={() => { setSelectedStep(null); setHoveredItem(null); }}>
          
          <div className="mb-8 text-center max-w-2xl mx-auto border-b border-white/5 pb-8">
            <h3 className={`text-[10px] uppercase font-black tracking-[0.3em] mb-4 ${isCritical ? 'text-red-500' : 'text-blue-500'}`}>
              {isCritical ? 'Kritisches System-Urteil' : 'Das Urteil der KI'}
            </h3>
            <p className={`text-base lg:text-lg font-light leading-relaxed italic px-6 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
              „{getNarrative()}“
            </p>
          </div>

          <div className="flex flex-col items-center w-full max-w-xl mx-auto relative pb-10">
            {steps.map((step, i) => {
              const isSelected = selectedStep === i;
              return (
                <React.Fragment key={i}>
                  <div className={`relative z-10 flex flex-col w-full p-6 rounded-[1.5rem] border transition-all duration-500 cursor-pointer group
                      ${isSelected ? 'bg-blue-600/10 border-blue-400 shadow-xl scale-[1.02]' : step.highlight ? (winner.isCritical ? 'bg-red-500/5 border-red-500/20 shadow-md' : 'bg-green-500/5 border-green-500/20 shadow-md') : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
                    onClick={(e) => { e.stopPropagation(); handleStepClick(step, i); }}
                  >
                    <div className="flex items-center gap-5 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${step.highlight ? (winner.isCritical ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400') : 'bg-slate-800 text-slate-300'}`}>
                        {step.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] uppercase font-black tracking-[0.2em] text-slate-500 mb-0.5">{step.label}</span>
                        <span className={`text-sm font-bold truncate ${step.highlight ? (winner.isCritical ? 'text-red-400' : 'text-green-400') : 'text-white'}`}>{step.val}</span>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400 font-medium italic">{step.story}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex flex-col items-center my-1">
                       <div className={`w-px h-10 transition-all duration-700 ${selectedStep !== null && selectedStep >= i ? 'bg-blue-500 shadow-[0_0_15px_blue]' : 'bg-slate-800'}`}></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      }
    />
  );
};

export default Phase5_Analysis;