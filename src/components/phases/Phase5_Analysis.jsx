import React, { useState, useMemo } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase5_Analysis = ({ simulator, activeScenario, setHoveredItem, theme }) => {
  const { temperature, noise, mlpThreshold, positionWeight, activeProfileId, finalOutputs } = simulator;
  const [selectedStep, setSelectedStep] = useState(null);

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
  const token1 = tokens.find(t => Number(t.id) === Number(primaryRule?.source))?.text || tokens[0]?.text || "Hund";
  const token2 = tokens.find(t => Number(t.id) === Number(primaryRule?.target))?.text || tokens[1]?.text || "Szenario";
  const numRules = activeProfile?.rules?.length || 0;

  // --- NEUE NARRATIVE ÜBERSCHRIFT (Version 1) ---
  const getNarrative = () => {
    return `Die mathematische Reise ist beendet: Basierend auf Ihrem Prompt hat das Modell den Pfad zu "${winner.label}" als die stabilste Lösung innerhalb des ${winner.type}-Speichers identifiziert.`;
  };

  const getNoiseDescription = () => {
    if (noise <= 0.5) return `Das minimale Rauschen sorgt für eine extrem präzise, fast schon starre Fixierung der Begriffe.`;
    if (noise <= 2.0) return `Das moderate Rauschen (Noise: ${noise.toFixed(2)}) erlaubt eine gesunde semantische Flexibilität.`;
    return `Das starke Rauschen (Noise: ${noise.toFixed(2)}) erzeugt eine hohe Unschärfe, wodurch die KI beginnt, abstrakte Verknüpfungen zu wagen.`;
  };

  const getThresholdDescription = () => {
    return mlpThreshold > 0.6 
      ? `Der MLP-Filter war extrem streng eingestellt, was bedeutet, dass nur die eindeutigsten Signale den Durchbruch geschafft haben.`
      : `Durch die niedrige Schwelle konnten auch subtilere Nuancen des Prompts zur Aktivierung dieses Wissensfeldes beitragen.`;
  };

  const getTempDescription = () => {
    if (temperature < 0.7) {
      return `Die niedrige Temperature sorgte für eine 'Greedy-Selection', bei der kein Raum für Zufälle blieb – das Modell wählte den statistisch sichersten Pfad.`;
    } else if (temperature > 1.2) {
      return `Durch die hohe Temperature wurde das Feld der Möglichkeiten geweitet, was diesen kreativen (und weniger vorhersehbaren) Ausgang begünstigte.`;
    }
    return `Die mittlere Temperature balancierte Präzision und Varianz für ein stabiles Ergebnis aus.`;
  };

  const steps = [
    {
      label: "1. Eingabe-Verarbeitung",
      val: `"${inputPrompt}"`, 
      icon: "📑",
      story: `Aus diesem Eingabe-Prompt wurden exakt ${tokenCount} Tokens generiert, die als mathematische Basis für die gesamte weitere Verarbeitung im LLM dienten.`,
      details: { "Szenario": scenarioName, "Anzahl Tokens": tokenCount, "Ermittlungsmethode": "Byte-Pair Encoding (BPE)" }
    },
    {
      label: "2. Semantische Verortung",
      val: `Verortung der Tokens als Vektoren (Embedding)`, 
      icon: "📍",
      story: `Jedes Token wird in einen Vektor umgewandelt und erhält somit eine Adresse im semantischen Vektorraum. Durch das Positional Encoding wird erreicht, dass Sätze wie "Mann beißt Hund" etwas anderes sind als "Hund beißt Mann". Die Position der Token im Satz verändert die Bedeutung fundamental. ${getNoiseDescription()}`,
      details: { "Szenario": scenarioName, "Vektor-Stabilität": `${Math.max(0, (100 - noise * 15)).toFixed(0)}%`, "Noise-Level": noise.toFixed(2), "Pos.-Gewichtung": (positionWeight * 100).toFixed(0) + "%" }
    },
    {
      label: "3. Kontextuelle Kopplung",
      val: `Analyse der relationalen Relevanz (Self-Attention)`, 
      icon: "🔍",
      story: `Nachdem die Tokens im Raum verortet sind, beginnt der Self-Attention-Mechanismus zu berechnen, 'wer mit wem spricht'. Basierend auf dem gewählten Fokus-Profil '${profileLabel}' hat das Modell entschieden, welche Wörter am wichtigsten sind. Es erkennt nun, dass '${token1}' eine starke kausale Brücke zu '${token2}' schlagen muss. ${numRules > 5 ? 'Ein komplexes Abhängigkeitsnetz wurde gewebt.' : 'Der Fokus blieb eng gefasst.'}`,
      details: { "Szenario": scenarioName, "Fokus-Profil": profileLabel, "Attention-Köpfe": "Aktiv (Layer 2)", "Primäre Kopplung": `${token1} → ${token2}` }
    },
    {
      label: "4. Wissens-Aktivierung",
      val: `Kategorisierung im Feed-Forward Network`, 
      icon: "🧠",
      story: `Die gewichteten Informationen fließen nun in das FFN. Hier erfolgt der Abgleich mit dem gelernten Wissen. Der MLP-Threshold von ${mlpThreshold.toFixed(2)} fungiert dabei als Filter. In diesem Durchlauf hat das Cluster '${winner.type}' die Oberhand gewonnen, während andere Wissensbereiche unterdrückt wurden. ${getThresholdDescription()}`,
      details: { "Szenario": scenarioName, "Aktiviertes Cluster": winner.type, "MLP-Schwelle": mlpThreshold.toFixed(2), "Signal-Status": "Peak Aktivierung erreicht" }
    },
    {
      label: "5. Finale Selektion",
      val: `Wortwahl durch probabilistisches Sampling`, 
      icon: "🎯",
      highlight: true,
      story: `Nachdem das Wissens-Cluster '${winner.type}' die Peak-Aktivierung erreicht hat, wurden die Wahrscheinlichkeiten für alle Folgewörter berechnet. Die Temperature von ${temperature.toFixed(2)} war das Steuerelement: Sie bestimmte, ob das Modell strikt der höchsten Wahrscheinlichkeit folgt oder mutig experimentiert. Mit ${(winner.probability * 100).toFixed(1)}% Konfidenz wurde schließlich '${winner.label}' als stabilste Lösung extrahiert. ${getTempDescription()}`,
      details: {
        "Resultat": winner.label,
        "Konfidenz": (winner.probability * 100).toFixed(1) + "%",
        "Sampling-Modus": temperature > 1.2 ? "Stochastisch" : "Deterministisch",
        "Temperature-Effekt": temperature > 1.0 ? "Varianz-Erhöhung" : "Präzisions-Fokus"
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
      title="Phase 5: Kausale Rekonstruktion"
      subtitle="Synthese des Entscheidungspfads"
      theme={theme}
      badges={[
        { text: `Ziel: ${winner.type}`, className: "border-blue-500/30 text-blue-400 bg-blue-500/5" },
        { text: `${(winner.probability * 100).toFixed(1)}% Konfidenz`, className: "border-green-500/30 text-green-400 bg-green-500/5" }
      ]}
      visualization={
        <div className="w-full h-auto flex flex-col items-center px-2 py-4" onClick={() => { setSelectedStep(null); setHoveredItem(null); }}>
          <div className="mb-8 text-center max-w-2xl mx-auto shrink-0 border-b border-white/5 pb-8">
            <h3 className="text-[10px] uppercase font-black tracking-[0.3em] text-blue-500 mb-4">Das Urteil der KI</h3>
            <p className="text-base lg:text-lg font-light leading-relaxed text-slate-200 italic px-6">
              „{getNarrative()}“
            </p>
          </div>

          <div className="flex flex-col items-center w-full max-w-xl mx-auto relative pb-10">
            {steps.map((step, i) => {
              const isSelected = selectedStep === i;
              return (
                <React.Fragment key={i}>
                  <div className={`relative z-10 flex flex-col w-full p-6 rounded-lg border transition-all duration-500 cursor-pointer group
                      ${isSelected ? 'bg-blue-600/10 border-blue-400 shadow-xl scale-[1.02]' : step.highlight ? 'bg-green-500/5 border-green-500/20 shadow-md' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}
                    onClick={(e) => { e.stopPropagation(); handleStepClick(step, i); }}
                  >
                    <div className="flex items-center gap-5 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0 ${step.highlight ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300'}`}>
                        {step.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] uppercase font-black tracking-[0.2em] text-slate-500 mb-0.5">{step.label}</span>
                        <span className={`text-sm font-bold truncate ${step.highlight ? 'text-green-400' : 'text-white'}`}>{step.val}</span>
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400 font-medium italic">{step.story}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex flex-col items-center my-1">
                       <div className={`w-px h-10 bg-gradient-to-b from-slate-700 to-slate-800 transition-all duration-700 ${selectedStep !== null && selectedStep >= i ? 'from-blue-500 to-blue-500 shadow-[0_0_15px_blue]' : ''}`}></div>
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