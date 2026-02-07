import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase0_Tokenization = ({
  tokens = [],
  rawText = "",
  scenarioId,
  setHoveredItem
}) => {
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const lastScenarioId = useRef(scenarioId);

  // Generate simulation steps: from characters to final tokens
  const simulationSteps = useMemo(() => {
    if (!rawText || !tokens.length) return [];

    // Step 0: Initial characters
    let currentFragments = rawText.split('').map((char, idx) => ({
      text: char,
      id: `c-${idx}`,
      finalTokenIndex: -1
    }));

    // Map fragments to their target tokens by finding their exact position
    let searchOffset = 0;
    tokens.forEach((t, tIdx) => {
      const tLen = t.text.length;
      const startIdx = rawText.indexOf(t.text, searchOffset);

      if (startIdx !== -1) {
        for (let i = 0; i < tLen; i++) {
          if (currentFragments[startIdx + i]) {
            currentFragments[startIdx + i].finalTokenIndex = tIdx;
          }
        }
        searchOffset = startIdx + tLen;
      }
    });

    const steps = [[...currentFragments]];

    // Merge logic: in each step, find one pair to merge
    while (true) {
      let merged = false;
      const nextFragments = [];

      for (let i = 0; i < currentFragments.length; i++) {
        if (!merged && i < currentFragments.length - 1 &&
          currentFragments[i].finalTokenIndex === currentFragments[i + 1].finalTokenIndex) {
          // Merge this pair
          nextFragments.push({
            text: currentFragments[i].text + currentFragments[i + 1].text,
            id: currentFragments[i].id + '-' + currentFragments[i + 1].id,
            finalTokenIndex: currentFragments[i].finalTokenIndex,
            isNewMerge: true
          });
          merged = true;
          i++; // Skip next
        } else {
          nextFragments.push({ ...currentFragments[i], isNewMerge: false });
        }
      }

      if (!merged) break;
      steps.push([...nextFragments]);
      currentFragments = nextFragments;
    }

    return steps;
  }, [rawText, tokens]);

  // Handle auto-play
  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < simulationSteps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, 400);
    } else if (currentStep === simulationSteps.length - 1) {
      setIsPlaying(false);
      setIsComplete(true);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, simulationSteps]);

  // Reset when scenario changes
  useEffect(() => {
    if (scenarioId !== lastScenarioId.current) {
      setSelectedTokenId(null);
      setShowTooltip(false);
      setHoveredItem(null);
      setCurrentStep(0);
      setIsPlaying(false);
      setIsComplete(false);
      lastScenarioId.current = scenarioId;
    }
  }, [scenarioId, setHoveredItem]);

  const getInspectorData = useCallback((token) => {
    return {
      title: `Token-Analyse: ${token.text}`,
      subtitle: "Preprocessing (BPE)",
      data: {
        "--- Spezifikationen": "---",
        "Token-ID": `#${token.id}`,
        "Inhalt": `"${token.text}"`,
        "Länge": `${token.text.length} Zeichen`,
        "Typ": token.id === 10 ? "Start-of-Sequence" : "Content-Token",
        "--- Linguistische Analyse": "---",
        "Information": token.explanation || "Dieses Token wurde erfolgreich segmentiert.",
        "Kontext-Hinweis": "Die genaue Bedeutung wird erst in Phase 2 durch die Attention-Heads bestimmt."
      }
    };
  }, []);

  if (!tokens.length) return <div className="p-10 text-center opacity-50 font-mono text-content-muted">Initializing Byte-Pair-Encoding...</div>;

  return (
    <PhaseLayout
      title="Phase 0: Tokenisierung"
      subtitle="Zerlegung des Textes in numerische Fragmente"
      badges={[
        { text: `Methode: BPE`, className: "bg-primary/10 text-primary border-primary/20" },
        { text: `${tokens.length} Tokens`, className: "bg-explore-item text-content-muted border-explore-border" }
      ]}
      visualization={
        <div
          className="w-full h-full flex flex-col pt-6"
          onClick={() => { setSelectedTokenId(null); setShowTooltip(false); setHoveredItem(null); }}
        >
          {/* INPUT STRING DISPLAY */}
          <div className="px-8 shrink-0">
            <div className="bg-explore-card p-5 rounded-2xl border border-explore-border shadow-2xl backdrop-blur-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl shadow-inner">
                  📑
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] uppercase font-black text-blue-500 tracking-[0.2em]">Input Stream</span>
                    {!isComplete && (
                      <span className="text-[8px] uppercase font-black text-primary animate-pulse">
                        BPE Simulation: Step {currentStep + 1} / {simulationSteps.length}
                      </span>
                    )}
                  </div>
                  <div className="relative h-6 flex items-center">
                    <p className={`text-sm font-medium transition-all duration-500 ${isComplete ? 'text-content-dim' : 'text-content-main'} italic tracking-tight`}>
                      "{rawText}"
                    </p>
                    {/* Active Progress Bar */}
                    <div className="absolute -bottom-2 left-0 h-1 bg-primary/20 rounded-full w-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${((currentStep + 1) / simulationSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="flex items-center gap-4 px-12 py-8 shrink-0">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <div className="text-[9px] font-black text-primary/40 uppercase tracking-[0.3em]">
              {isComplete ? "Neural Decomposition" : "Byte Pair Merging"}
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          </div>

          {!isComplete ? (
            /* SIMULATION VIEW */
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-8 pt-4 pb-8 flex flex-wrap justify-center content-start gap-2">
              {simulationSteps[currentStep]?.map((frag, idx) => (
                <div
                  key={frag.id}
                  className={`
                    px-3 py-2 rounded-xl border-2 font-mono text-sm font-bold transition-all duration-300
                    ${frag.isNewMerge ? 'bg-primary border-primary text-white scale-110 shadow-lg' : 'bg-explore-item border-explore-border text-content-muted'}
                  `}
                >
                  {frag.text === " " ? <span className="opacity-30">_</span> : frag.text}
                  {frag.isNewMerge && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white text-primary text-[6px] px-1 rounded font-black uppercase shadow-sm">
                      Merge
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* FINAL TOKEN CLOUD (Analysis View) */
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-8 pt-4 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="flex flex-wrap justify-center gap-3">
                {tokens.map((token) => {
                  const isSelected = selectedTokenId === token.id;
                  return (
                    <div
                      key={token.id}
                      className={`
                        relative flex flex-col items-center p-4 min-w-[100px] rounded-2xl border-2 transition-all duration-300 cursor-pointer
                        ${isSelected
                          ? 'bg-primary border-primary text-white scale-110 shadow-lg z-20'
                          : 'bg-explore-item border-explore-border text-content-muted hover:border-primary/50 hover:bg-explore-card z-10'
                        }
                      `}
                      onMouseEnter={() => !selectedTokenId && setHoveredItem(getInspectorData(token))}
                      onMouseLeave={() => !selectedTokenId && setHoveredItem(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTokenId(isSelected ? null : token.id);
                        setShowTooltip(!isSelected);
                      }}
                    >
                      <span className={`text-[8px] font-mono mb-1 ${isSelected ? 'text-white/80' : 'text-content-dim'}`}>
                        ID #{token.id}
                      </span>
                      <span className={`text-lg font-black tracking-tighter ${isSelected ? 'text-white' : 'text-primary'}`}>
                        {token.text}
                      </span>

                      {isSelected && showTooltip && (
                        <div
                          className="absolute top-full mt-4 w-64 p-5 rounded-2xl border-2 shadow-2xl z-[100] left-1/2 -translate-x-1/2 cursor-default animate-in zoom-in-95 duration-200 bg-explore-nav border-explore-border text-content-main"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex justify-between items-center mb-3 border-b border-explore-border pb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Token Info</span>
                            <button onClick={() => setShowTooltip(false)} className="text-content-dim hover:text-content-main transition-colors">&times;</button>
                          </div>
                          <p className="text-[11px] leading-relaxed italic font-medium text-content-muted">
                            {token.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      }
      controls={
        <div className="col-span-full px-6 py-4 rounded-2xl border border-explore-border bg-explore-card flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] uppercase font-black text-primary tracking-[0.2em]">Encoding Standard</span>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-success shadow-[0_0_10px_var(--color-success)]' : 'bg-warning animate-pulse'}`} />
                <span className="text-xs font-mono font-bold uppercase tracking-tight text-content-main">GPT-BPE Protocol v2</span>
              </div>
            </div>

            <div className="h-8 w-px bg-explore-border mx-2" />

            {/* SIMULATION CONTROLS */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsPlaying(!isPlaying); if (isComplete) { setCurrentStep(0); setIsComplete(false); } }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all
                  ${isPlaying ? 'bg-warning text-white' : 'bg-primary text-white hover:bg-primary-hover shadow-lg'}
                `}
              >
                {isPlaying ? (
                  <><span className="text-xs">⏸</span> Pause</>
                ) : isComplete ? (
                  <><span className="text-xs">🔄</span> Replay</>
                ) : (
                  <><span className="text-xs">▶</span> Play</>
                )}
              </button>

              <button
                disabled={isPlaying || isComplete}
                onClick={() => setCurrentStep(s => Math.min(s + 1, simulationSteps.length - 1))}
                className="px-4 py-2 rounded-xl bg-explore-item border border-explore-border text-[10px] font-black uppercase text-content-main hover:bg-explore-card disabled:opacity-30"
              >
                Step
              </button>

              <button
                onClick={() => { setCurrentStep(0); setIsPlaying(false); setIsComplete(false); }}
                className="px-4 py-2 rounded-xl bg-error/10 border border-error/20 text-error text-[10px] font-black uppercase hover:bg-error hover:text-white transition-all "
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex gap-10">
            <div className="text-right border-l border-explore-border pl-10">
              <span className="text-[8px] uppercase font-black text-content-dim block mb-1">Status</span>
              <span className={`text-[11px] font-mono font-black uppercase tracking-tighter ${isComplete ? 'text-success' : 'text-warning'}`}>
                {isComplete ? 'Ready for Embedding' : 'Tokenizing Input...'}
              </span>
            </div>
            <div className="text-right border-l border-explore-border pl-10">
              <span className="text-[8px] uppercase font-black text-content-dim block mb-1">Vocab Size</span>
              <span className="text-[11px] font-mono font-black text-primary tracking-tighter">50,257 Vectors</span>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default Phase0_Tokenization;