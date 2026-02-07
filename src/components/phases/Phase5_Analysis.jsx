import React, { useState, useMemo, useEffect, useRef } from 'react';
import PhaseLayout from './../PhaseLayout';


const Phase5_Analysis = ({
  activeScenario, // passed from App
  finalOutputs = [],
  activeAttention = { avgSignal: 1.0 },
  selectedToken,
  temperature,
  noise,
  mlpThreshold,
  positionWeight,
  theme,
  setHoveredItem,
  resetKey
}) => {
  // Removed useScenarios

  const scenario = activeScenario;
  const [selectedStep, setSelectedStep] = useState(null);
  const lastScenarioId = useRef(scenario?.id);

  const pipelineSignal = activeAttention?.avgSignal ?? 1.0;
  const isCritical = pipelineSignal < 0.4;

  useEffect(() => {
    setSelectedStep(null);
    setHoveredItem(null);
  }, [resetKey, setHoveredItem]);

  // Szenario-Reset Logik
  useEffect(() => {
    if (scenario?.id !== lastScenarioId.current) {
      setSelectedStep(null);
      setHoveredItem(null);
      lastScenarioId.current = scenario?.id;
    }
  }, [scenario?.id, setHoveredItem]);

  const winner = useMemo(() => {
    let target = selectedToken;
    if (!target && finalOutputs?.length > 0) {
      target = [...finalOutputs].sort((a, b) =>
        (b.dynamicProb ?? b.probability) - (a.dynamicProb ?? a.probability)
      )[0];
    }

    if (target) {
      return {
        ...target,
        safeLabel: target.label || target.text || target.token || "Unbekannt",
        safeType: target.category_link || target.type || target.category || "Allgemein"
      };
    }
    return { safeLabel: "Berechne...", safeType: "N/A", dynamicProb: 0 };
  }, [finalOutputs, selectedToken]);

  const displayProbability = winner.dynamicProb !== undefined ? winner.dynamicProb : (winner.probability || 0);

  const getNarrative = () => {
    const label = winner.safeLabel;

    if (isCritical) {
      return `System-Instabilität detektiert: Bei einer Signal-Integrität von nur ${(pipelineSignal * 100).toFixed(0)}% und einem Noise-Level von ${noise.toFixed(2)} ist die Wahl von "${label}" mathematisch instabil. Die Kausalitätskette ist durch Rauschen unterbrochen.`;
    }

    if (temperature > 1.2) {
      return `Stochastische Diversität: Durch die erhöhte Temperature (${temperature.toFixed(1)}) hat das Modell den deterministischen Pfad verlassen. Die Wahl von "${label}" ist ein Ergebnis explorativen Samplings innerhalb des erweiterten Vektorraums.`;
    }

    if (label.includes("Berlin") || label.includes("Bonn")) {
      const mode = label === "Berlin" ? "faktisch-geografische" : "historische";
      return `Kontext-Mixer Erfolg: Das Modell hat die ${mode} Dimension priorisiert. Durch die gezielte Attention-Steuerung wurde die entsprechende Wissenskategorie im FFN aktiviert und als logischer Sieger ermittelt.`;
    }

    if (label.includes(" plant") || label.includes("Hauptplatz")) {
      return `Polysemie-Auflösung: Die dreifache Besetzung des Begriffs "Bank" wurde erfolgreich entwirrt. Der gewählte Pfad "${label}" beweist, dass der neuronale Fokus exakt auf dem beabsichtigten Kontext-Szenario liegt.`;
    }

    if (label === "Türschloss") {
      return `Logische Selektion: Der Kontext ("Einbrecher") hat erfolgreich den Logik-Head aktiviert. Dies führte zu einer Verschiebung im Vektorraum, die "${label}" gegenüber der architektonischen Bedeutung priorisierte.`;
    }

    return `Standard-Inferenz: Mit einer Konfidenz von ${(displayProbability * 100).toFixed(1)}% wurde "${label}" als das kohärenteste nächste Token identifiziert. Die Pipeline zeigt eine stabile Verarbeitung über alle Layer hinweg.`;
  };

  const steps = [
    {
      label: "1. Tokenisierung",
      val: `${scenario?.phase_0_tokenization?.tokens?.length || 0} Einheiten`,
      icon: "📑",
      story: `Der Eingabetext wurde in diskrete Tokens zerlegt. Jedes Element erhielt eine Positions-Kodierung (PE), damit das Modell die Wortreihenfolge mathematisch erfassen kann.`,
      details: { "Analyse-Details": "Die Segmentierung erfolgte via Byte-Pair-Encoding. Die IDs bilden die Grundlage für den Zugriff auf die Embedding-Matrix." }
    },
    {
      label: "2. Embedding Raum",
      val: noise > 0.5 ? "Diffus" : "Präzise",
      icon: "📍",
      story: `Die Tokens wurden in den n-dimensionalen Raum eingebettet. Mit einer Positions-Gewichtung von ${(positionWeight * 100).toFixed(0)}% wurden die Vektoren für die Kontext-Analyse vorbereitet.`,
      details: { "Vektor-Erkenntnis": `Der Noise-Level von ${noise.toFixed(2)} bestimmt die Schärfe der semantischen Trennung zwischen den Begriffen.` }
    },
    {
      label: "3. Self-Attention",
      val: "Pfad-Selektion",
      icon: "🔍",
      story: `Die Attention-Heads haben Relevanz-Beziehungen berechnet. Hier wurde entschieden, welcher Kontext (z.B. Geografie vs. Geschichte) die höchste Aufmerksamkeit erhält.`,
      details: { "KI-Begründung": `Das Signal durchlief die Multi-Head-Pipeline. Die gewählte Gewichtung resultiert in einer Signal-Integrität von ${(pipelineSignal * 100).toFixed(0)}%.` }
    },
    {
      label: "4. Wissens-FFN",
      val: winner.safeType,
      icon: "🧠",
      story: `Das FFN-Layer hat das Signal mit internen Wissens-Clustern abgeglichen. Die Kategorie "${winner.safeType}" wurde dabei erfolgreich über den Threshold von ${mlpThreshold.toFixed(2)} gehoben.`,
      details: { "Wissens-Analyse": "Die neuronale Aktivierung transformiert abstrakte Aufmerksamkeit in konkrete semantische Konzepte des Weltwissens." }
    },
    {
      label: "5. Decoding",
      val: winner.safeLabel,
      icon: "🎯",
      highlight: true,
      story: `Der Softmax-Prozess hat die Logits normalisiert. "${winner.safeLabel}" ging mit ${(displayProbability * 100).toFixed(1)}% als Sieger hervor und wurde zurück in Text transformiert.`,
      details: { "Inferenz-Interpretation": `Das Ergebnis ist bei einer Temperature von ${temperature.toFixed(1)} ${temperature > 1.0 ? 'kreativ-variabel' : 'hochgradig deterministisch'}.` }
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
        subtitle: "Prozess-Parameter",
        data: step.details
      });
    }
  };

  if (!finalOutputs || finalOutputs.length === 0) return null;

  return (
    <PhaseLayout
      title="Phase 5: Pipeline-Analyse"
      subtitle="Zusammenfassender Entscheidungspfad des Modells"
      theme={theme}
      badges={[
        { text: `Integrität: ${(pipelineSignal * 100).toFixed(0)}%`, className: isCritical ? "bg-error/10 text-error border-error/20" : "bg-primary/10 text-primary border-primary/20" },
        { text: `${(displayProbability * 100).toFixed(1)}% Konfidenz`, className: "bg-success/10 text-success border-success/20" }
      ]}
      visualization={
        <div className="w-full flex flex-col items-center px-2 py-4 bg-explore-viz rounded-lg" onClick={() => { setSelectedStep(null); setHoveredItem(null); }}>

          {/* Narratives System-Urteil */}
          <div className="mb-12 text-center max-w-3xl mx-auto border-b border-explore-border pb-10">
            <h3 className={`text-[10px] uppercase font-black tracking-[0.4em] mb-6 ${isCritical ? 'text-error' : 'text-primary'}`}>
              System-Interpretation
            </h3>
            <p className="text-lg lg:text-xl font-light leading-relaxed italic px-10 transition-all duration-700 text-content-main">
              „{getNarrative()}“
            </p>
          </div>

          {/* Vertikale Pipeline-Visualisierung */}
          <div className="flex flex-col items-center w-full max-w-2xl mx-auto relative pb-10">
            {steps.map((step, i) => (
              <React.Fragment key={i}>
                <div
                  className={`relative z-10 flex flex-col w-full p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer group
                    ${selectedStep === i
                      ? 'bg-primary/10 border-primary shadow-[0_0_40px_var(--color-primary-dim)] scale-[1.04]'
                      : 'bg-explore-card border-explore-border hover:border-primary/50'}`}
                  onClick={(e) => { e.stopPropagation(); handleStepClick(step, i); }}
                >
                  <div className="flex items-center gap-8 mb-4">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl transition-all duration-500 group-hover:rotate-6
                      ${i === 4 ? 'bg-success/20 text-success shadow-[0_0_20px_var(--color-success-dim)]' : 'bg-explore-item text-content-dim'}`}>
                      {step.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-content-dim mb-1">{step.label}</span>
                      <span className="text-xl font-black text-content-main">{step.val}</span>
                    </div>
                  </div>
                  <p className="text-[14px] leading-relaxed font-medium italic text-content-muted">
                    {step.story}
                  </p>
                </div>

                {/* Verbindungslinie */}
                {i < steps.length - 1 && (
                  <div className="flex flex-col items-center">
                    <div className={`w-1 h-12 transition-all duration-1000 ${selectedStep !== null && selectedStep >= i ? 'bg-primary shadow-[0_0_20px_var(--color-primary)]' : 'bg-explore-border'}`}></div>
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