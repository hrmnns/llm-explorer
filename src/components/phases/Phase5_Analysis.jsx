import React, { useState, useMemo, useEffect } from 'react';
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

  // Pipeline-Integrität abgreifen
  const pipelineSignal = activeAttention?.avgSignal || 1.0;
  const isCritical = pipelineSignal < 0.4;
  const isDegraded = pipelineSignal < 0.7;

  // Basis-Daten validieren
  if (!finalOutputs || finalOutputs.length === 0) return null;

  // Gewinner ermitteln (entweder durch Sampling in Phase 4 oder Fallback auf Max Prob)
  const winner = useMemo(() => {
    if (selectedToken) return selectedToken;
    return [...finalOutputs].sort((a, b) => b.probability - a.probability)[0];
  }, [finalOutputs, selectedToken]);

  const displayProbability = winner.dynamicProb !== undefined ? winner.dynamicProb : winner.probability;

  // Szenario-Metadaten
  const scenario = activeScenario || simulator.activeScenario;
  const scenarioName = scenario?.name || "Standard Szenario";
  const tokens = scenario?.phase_0_tokenization?.tokens || [];
  const tokenCount = tokens.length;

  // --- DYNAMISCHE ATTENTION-ANALYSE FÜR SCHRITT 3 ---
  const attentionNarrative = useMemo(() => {
    const activeProfile = scenario?.phase_2_attention?.attention_profiles?.find(p => p.id === activeProfileId);
    if (!activeProfile) return { story: "Keine Profil-Daten gefunden.", details: {} };

    // Finde die stärkste Regel für das aktuelle Profil
    const topRule = [...activeProfile.rules].sort((a, b) => b.strength - a.strength)[0];
    const srcToken = tokens.find(t => String(t.id) === String(topRule?.source))?.text || "Query";
    const tgtToken = tokens.find(t => String(t.id) === String(topRule?.target))?.text || "Ziel";

    return {
      label: "3. Self-Attention",
      val: `Fokus: ${activeProfile.label}`,
      icon: "🔍",
      story: `Der Head-Mix priorisiert die Verbindung von '${srcToken}' zu '${tgtToken}'. Dies steuert die kontextuelle Bedeutung im Satz.`,
      details: {
        "Modus": activeProfile.label,
        "Haupt-Achse": `${srcToken} → ${tgtToken}`,
        "Signal-Integrität": (pipelineSignal * 100).toFixed(0) + "%"
      }
    };
  }, [scenario, activeProfileId, tokens, pipelineSignal]);

  // --- NARRATIVE LOGIK ---
  const getNarrative = () => {
    // Check ob der Sampler ein "unwahrscheinliches" Wort gewählt hat (Kreativität/Temp)
    const mostProbable = [...finalOutputs].sort((a, b) => (b.dynamicProb || b.probability) - (a.dynamicProb || a.probability))[0];
    
    if (winner.label !== mostProbable.label && temperature > 1.0) {
        return `Kreative Entscheidung: Trotz der Dominanz von "${mostProbable.label}" wählte der Sampler "${winner.label}" aus. Ein direkter Effekt der Temperature (${temperature.toFixed(1)}).`;
    }

    if (isCritical) return `System-Instabilität: Durch massives Rauschen (Noise: ${noise.toFixed(1)}) wurde "${winner.label}" eher zufällig selektiert. Die Vorhersage ist mathematisch instabil.`;
    if (isDegraded) return `Eingeschränkte Präzision: Das Modell tendiert zu "${winner.label}", zeigt aber durch Signalverluste bereits erste Zeichen von Unsicherheit.`;
    
    // Winograd-spezifische Story-Logik
    if (winner.label === "Tasche") {
        return `Logik-Sieg: Das Modell hat korrekt erkannt, dass sich "sie" auf die Tasche beziehen muss, da die Trophäe nicht "zu klein" sein kann, um nicht zu passen.`;
    }
    return `Die Inferenz ist abgeschlossen: Basierend auf der gewichteten Attention wurde "${winner.label}" als das wahrscheinlichste nächste Token identifiziert.`;
  };

  const steps = [
    {
      label: "1. Tokenisierung",
      val: `${tokenCount} Tokens`, 
      icon: "📑",
      story: `Der Input wurde in ${tokenCount} Einheiten zerlegt. Jedes Token wurde im Vektorraum platziert und mit Positions-Daten versehen.`,
      details: { "Szenario": scenarioName, "Token-Anzahl": tokenCount, "Basis": "Vollständig" }
    },
    {
      label: "2. Embedding & Noise",
      val: `Vektor-Modulation`, 
      icon: "📍",
      story: `Die Vektoren wurden ${noise > 1.0 ? 'durch Rauschen gestört' : 'stabil verarbeitet'}. Die Position-Gewichtung liegt bei ${(positionWeight * 100).toFixed(0)}%.`,
      details: { "Noise-Level": noise.toFixed(2), "Signal-Stärke": (pipelineSignal * 100).toFixed(0) + "%", "Embedding": "Aktiv" }
    },
    attentionNarrative,
    {
      label: "4. FFN (Weltwissen)",
      val: `Cluster: ${winner.type}`, 
      icon: "🧠",
      story: `Im FFN wurde das Signal mit dem '${winner.type}'-Wissen abgeglichen. Der MLP-Filter (Threshold: ${mlpThreshold.toFixed(2)}) hat das Rauschen separiert.`,
      details: { "Aktivierung": winner.type, "Filter-Limit": mlpThreshold.toFixed(2), "Status": "Passiert" }
    },
    {
      label: "5. Probabilistischer Output",
      val: winner.label, 
      icon: temperature > 1.2 ? "🎲" : "🎯", 
      highlight: true,
      story: `Mit ${(displayProbability * 100).toFixed(1)}% Konfidenz wurde '${winner.label}' ausgewählt. Die Temperature steht auf ${temperature.toFixed(1)}.`,
      details: {
        "Wort": winner.label,
        "Konfidenz": (displayProbability * 100).toFixed(1) + "%",
        "Sampling": temperature > 1.2 ? "Stochastisch" : "Deterministisch",
        "Trace": winner.causality_trace || "Direkte Inferenz"
      }
    }
  ];

  const handleStepClick = (step, index) => {
    if (selectedStep === index) {
      setSelectedStep(null);
      setHoveredItem(null);
    } else {
      setSelectedStep(index);
      setHoveredItem({ title: step.label, subtitle: "Analyse-Meilenstein", data: step.details });
    }
  };

  return (
    <PhaseLayout
      title="Phase 5: Pipeline-Analyse"
      subtitle="Zusammenfassung des Entscheidungspfads"
      theme={theme}
      badges={[
        { text: `System-Signal: ${(pipelineSignal * 100).toFixed(0)}%`, className: isCritical ? "bg-red-500/20 text-red-400" : "bg-blue-500/10 text-blue-400" },
        { text: `${(displayProbability * 100).toFixed(1)}% Konfidenz`, className: isCritical ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400" }
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
              const isWinnerStep = i === steps.length - 1;
              
              return (
                <React.Fragment key={i}>
                  <div className={`relative z-10 flex flex-col w-full p-6 rounded-[1.5rem] border transition-all duration-500 cursor-pointer group
                      ${isSelected ? 'bg-blue-600/10 border-blue-400 shadow-xl scale-[1.02]' : isWinnerStep ? (isCritical ? 'bg-red-500/5 border-red-500/20 shadow-md' : 'bg-green-500/5 border-green-500/20 shadow-md') : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
                    onClick={(e) => { e.stopPropagation(); handleStepClick(step, i); }}
                  >
                    <div className="flex items-center gap-5 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${isWinnerStep ? (isCritical ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400') : 'bg-slate-800 text-slate-300'}`}>
                        {step.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] uppercase font-black tracking-[0.2em] text-slate-500 mb-0.5">{step.label}</span>
                        <span className={`text-sm font-bold truncate ${isWinnerStep ? (isCritical ? 'text-red-400' : 'text-green-400') : 'text-white'}`}>{step.val}</span>
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