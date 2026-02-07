import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PhaseLayout from './../PhaseLayout';


const Phase4_Decoding = ({
  topKTokens = [], // raw token data from scenario
  settings = {}, // decoding settings from scenario
  activeFFN = [],
  activeAttention = { avgSignal: 1.0 },
  temperature,
  setTemperature,
  noise,
  setNoise,
  headOverrides,
  setHeadOverrides,
  activeProfileId,
  activeProfileRules = [], // easier to pass rules directly? or profiles? 
  // Wait, Goal Seeking needs profile rules to map heads.
  // Let's pass 'activeProfile' specifically or 'profiles'.
  attentionProfiles = [],
  selectedToken,
  setSelectedToken,
  scenarioId,
  theme,
  setHoveredItem,
  mlpThreshold, // Added missing prop
  resetKey
}) => {
  // Removed useScenarios

  // Local state for phase-specific settings
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [topK, setTopK] = useState(5);
  const [minPThreshold, setMinPThreshold] = useState(0.05);
  const [simulationState, setSimulationState] = useState({ outputs: [], winner: null });
  const [isShuffling, setIsShuffling] = useState(false);
  const lastScenarioId = useRef(scenarioId);
  const gumbelSeeds = useRef({});

  // Initialize persistent Gumbel noise for each token to keep sliding smooth
  useEffect(() => {
    if (topKTokens?.length > 0) {
      const seeds = { ...gumbelSeeds.current };
      topKTokens.forEach(t => {
        if (seeds[t.token] === undefined) {
          // Gumbel noise formula: -ln(-ln(U)) where U ~ Uniform(0,1)
          const u = Math.max(0.00001, Math.random());
          seeds[t.token] = -Math.log(-Math.log(u));
        }
      });
      gumbelSeeds.current = seeds;
    }
  }, [topKTokens]);



  // --- Goal-Seeking Logik (🎯) ---
  const handleForceOutcome = useCallback((target) => {
    const categoryId = target.category_link;
    const targetFFN = activeFFN?.find(f => String(f.id).toLowerCase() === String(categoryId).toLowerCase());
    const linkedHeadId = targetFFN?.linked_head;

    const activeProfile = attentionProfiles.find(p => String(p.id) === String(activeProfileId));

    const relevantRules = activeProfile?.rules?.filter(r =>
      Number(r.head) === Number(linkedHeadId)
    );

    if (!relevantRules || relevantRules.length === 0 || !linkedHeadId) {
      setHoveredItem({
        title: "Pfad blockiert 🚫",
        subtitle: "Keine logische Verbindung",
        data: {
          "Ursache": "Keine Attention-Regeln für diesen Head gefunden.",
          "Head-ID": linkedHeadId || "Unbekannt"
        }
      });
      return;
    }

    const newOverrides = {};
    const allRules = activeProfile?.rules || [];

    allRules.forEach(rule => {
      const tokenKey = `${activeProfileId}_s${rule.source}_h${rule.head}`;
      if (Number(rule.head) === Number(linkedHeadId)) {
        newOverrides[tokenKey] = 1.0;
      } else {
        newOverrides[tokenKey] = 0.0;
      }
    });

    setHeadOverrides(newOverrides);
    if (setSelectedToken) setSelectedToken(null);
    if (setSelectedLabel) setSelectedLabel(null);
    if (setNoise) setNoise(0);

    setHoveredItem({
      title: "Pfad kalibriert 🎯",
      subtitle: `Ziel: ${target.token}`,
      data: {
        "Status": "SUCCESS",
        "Strategie": `Head ${linkedHeadId} maximiert`,
        "Quellen": relevantRules.map(r => `T${r.source}`).join(', ')
      }
    });
  }, [attentionProfiles, activeFFN, activeProfileId, setHeadOverrides, setHoveredItem, setNoise, setSelectedToken]);

  const getItemVisuals = useCallback((item) => {
    const matchingCategory = activeFFN?.find(cat =>
      String(cat.id).toLowerCase() === String(item.category_link || "").toLowerCase()
    );
    return {
      color: item?.color || matchingCategory?.color || "#475569",
      icon: item?.icon || matchingCategory?.icon || "📄"
    };
  }, [activeFFN]);

  const calculateLogic = useCallback(() => {
    const sourceTokens = topKTokens;
    if (!sourceTokens || sourceTokens.length === 0) return [];

    const T = Math.max(0.01, parseFloat(temperature) || 0.7);
    const biasMultiplier = settings?.logit_bias_multiplier || 12;

    const results = sourceTokens.map(item => {
      const liveFFNData = activeFFN?.find(f => String(f.id).toLowerCase().trim() === String(item.category_link).toLowerCase().trim());
      const liveActivation = liveFFNData ? liveFFNData.activation : 0.5;
      const ffnBias = (liveActivation - 0.5) * biasMultiplier;
      const baseLogit = item.base_logit !== undefined ? item.base_logit : 5.0;
      const jitter = (Math.random() - 0.5) * (noise || 0) * 2.0;

      // Noise Decay (consistency with LLMEngine)
      const decay = 1 - (Math.min(1, noise / 2) * (item.noise_sensitivity || 0.5));

      // Gumbel-Max trick: Add temperate-scaled Gumbel noise to create ranking shifts
      const gumbel = (gumbelSeeds.current[item.token] || 0) * (temperature * 1.5);

      const effectiveLogit = (baseLogit + ffnBias + jitter) * decay + gumbel;

      return {
        ...item,
        effectiveLogit,
        liveActivation,
        actingHead: liveFFNData?.linked_head ? `Head ${liveFFNData.linked_head}` : "Default",
        ffnBoost: ffnBias,
        isBlockedByMLP: (liveActivation * (activeAttention?.avgSignal ?? 1.0)) < mlpThreshold,
        exp: Math.exp(effectiveLogit / T)
      };
    });

    const sumExp = results.reduce((acc, curr) => acc + curr.exp, 0);
    return results.map(item => ({
      ...item,
      dynamicProb: sumExp > 0 ? item.exp / sumExp : 0
    }));
  }, [activeFFN, topKTokens, settings, temperature, noise, mlpThreshold, activeAttention]);

  const getInspectorData = useCallback((out) => {
    if (!out) return null;
    const { icon } = getItemVisuals(out);
    return {
      title: `${icon} Decoding: ${out.token}`,
      subtitle: `Kategorie: ${out.category_link}`,
      data: {
        "Wahrscheinlichkeit": (out.dynamicProb * 100).toFixed(2) + "%",
        "Logit-Shift": (out.ffnBoost >= 0 ? "+" : "") + out.ffnBoost?.toFixed(2),
        "Aktivierung (Live)": (out.liveActivation * 100).toFixed(0) + "%"
      }
    };
  }, [getItemVisuals]);

  useEffect(() => {
    setSelectedLabel(null);
    setTopK(5);
    setMinPThreshold(0.05);
    setSimulationState({ outputs: [], winner: null });
    setHoveredItem(null);
  }, [resetKey, setHoveredItem]);

  useEffect(() => {
    if (scenarioId !== lastScenarioId.current) {
      setSelectedLabel(null);
      lastScenarioId.current = scenarioId;
    }

    if (!isShuffling) {
      // Re-run local decoding logic when dependencies change
      // Note: The LLMEngine also does decoding, but Phase 4 component seems to implement
      // a visual/interactive version with local jitter/sampling that might differ slightly,
      // or it is visualizing the process.
      // The Engine's finalOutputs are correct, but this component re-calculates for the visual effect?
      // Yes, it adds jitter here: const jitter = (Math.random() - 0.5) * (noise || 0) * 2.0;
      const results = calculateLogic();
      if (results.length > 0) {
        const sorted = [...results].sort((a, b) => b.dynamicProb - a.dynamicProb);
        setSimulationState({
          outputs: results.slice(0, 10),
          winner: results.find(r => r.token === selectedToken?.token) || sorted[0]
        });
      }
    }
  }, [calculateLogic, scenarioId, isShuffling, headOverrides, selectedToken]);

  const triggerResample = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const results = calculateLogic();
      if (results.length > 0) {
        let win = results[0];
        const r = Math.random();
        let cum = 0;
        for (let o of results) {
          cum += o.dynamicProb;
          if (r <= cum) { win = o; break; }
        }
        setSimulationState({ outputs: results.slice(0, 10), winner: win });
        if (setSelectedToken) setSelectedToken(win);
        setSelectedLabel(win.token);
      }
      setIsShuffling(false);
    }, 450);
  };

  const activeOptionsCount = useMemo(() => {
    const sorted = [...simulationState.outputs].sort((a, b) => b.dynamicProb - a.dynamicProb);
    const topKTokens = sorted.slice(0, topK).map(t => t.token);
    return simulationState.outputs.filter((out) =>
      topKTokens.includes(out.token) && out.dynamicProb >= minPThreshold && !out.isBlockedByMLP
    ).length;
  }, [simulationState.outputs, topK, minPThreshold]);

  return (
    <PhaseLayout
      title="Phase 4: Softmax Decoding Pipeline"
      subtitle="Physikalische Signal-Modulation & Sampling"
      theme={theme}
      badges={[
        { text: `Entropy: ${noise.toFixed(2)}`, className: noise > 1 ? "text-warning" : "text-content-dim" },
        { text: `Aktiv: ${activeOptionsCount}`, className: "text-primary border-primary/20 bg-primary/5" }
      ]}
      visualization={
        <div className="flex flex-row min-h-[550px] h-full w-full gap-4 relative pt-12 pb-24 px-4 bg-explore-viz rounded-lg" onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}>

          {/* Y-Achse */}
          <div className="flex flex-col justify-between items-end pb-0 pt-0 text-[9px] font-black w-8 shrink-0 text-content-dim self-stretch">
            <span>100%</span>
            <span>50%</span>
            <span className="translate-y-2">0%</span>
          </div>

          <div className="relative flex-1 flex flex-col justify-end border-b-2 border-explore-border self-stretch">

            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none text-explore-border opacity-20">
              <div className="absolute top-0 w-full border-t border-current" />
              <div className="absolute top-1/2 w-full border-t border-current" />
            </div>

            {/* Min-P Gate Line */}
            <div className="absolute left-0 w-full border-t-2 border-dashed border-error/50 z-30 transition-all duration-500 pointer-events-none"
              style={{ bottom: `${minPThreshold * 100}%` }}>
              <div className="absolute right-0 -top-2.5 px-1.5 py-0.5 bg-error text-[7px] text-white rounded font-black uppercase shadow-lg">
                Min-P: {(minPThreshold * 100).toFixed(0)}%
              </div>
            </div>

            {/* Balken-Container */}
            <div className="relative flex items-end justify-around gap-2 lg:gap-4 h-full w-full">
              {simulationState.outputs.map((out) => {
                const isWinner = simulationState.winner?.token === out.token;
                const sorted = [...simulationState.outputs].sort((a, b) => b.dynamicProb - a.dynamicProb);
                const rank = sorted.findIndex(r => r.token === out.token);
                const isActive = rank < topK && out.dynamicProb >= minPThreshold && !out.isBlockedByMLP;
                const { color, icon } = getItemVisuals(out);

                return (
                  <div key={out.token}
                    className={`relative group flex flex-col items-center flex-1 h-full justify-end transition-all duration-500 ${selectedLabel === out.token ? 'z-30' : 'z-10'} ${(!isActive && !isWinner) ? 'opacity-20 grayscale' : 'opacity-100'}`}
                    onMouseEnter={() => setHoveredItem(getInspectorData(out))}
                    onMouseLeave={() => !selectedLabel && setHoveredItem(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLabel(out.token);
                      if (setSelectedToken) setSelectedToken(out);
                    }}
                  >
                    {/* Goal-Seek Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleForceOutcome(out); }}
                      className="absolute -top-10 opacity-0 group-hover:opacity-100 hover:scale-125 transition-all z-50 p-2 bg-primary-hover rounded-full border-2 border-white shadow-xl text-[14px]"
                    >
                      🎯
                    </button>

                    {isWinner && !isShuffling && (
                      <div className="absolute -top-14 left-1/2 -translate-x-1/2 text-2xl animate-bounce z-40 drop-shadow-lg">
                        {noise > 1.2 ? '🥴' : '🎯'}
                      </div>
                    )}

                    <div className="mb-2 text-xs">{icon}</div>

                    {/* Der eigentliche Balken */}
                    <div className={`w-full max-w-[44px] rounded-t-xl transition-all duration-700 ${isWinner ? 'ring-2 ring-primary shadow-[0_0_20px_var(--color-primary-border)]' : ''}`}
                      style={{
                        height: isShuffling ? `${Math.random() * 100}%` : `${out.dynamicProb * 100}%`,
                        backgroundColor: (isActive || isWinner) ? color : 'var(--color-explore-border)',
                        transform: noise > 0.8 ? `translateX(${(Math.random() - 0.5) * noise * 4}px)` : 'none'
                      }}
                    />

                    {/* Beschriftung */}
                    <div className="absolute top-[calc(100%+10px)] w-full text-center">
                      <span className={`text-[9px] font-black uppercase mb-1 block ${isActive || isWinner ? 'text-primary' : 'text-content-dim'}`}>
                        {(out.dynamicProb * 100).toFixed(0)}%
                      </span>
                      <span className={`text-[10px] font-black uppercase truncate block ${isWinner ? 'text-primary scale-110' : 'text-content-dim'}`}>
                        {out.token}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
      controls={[
        <div key="c-temp" className="px-4 py-3 rounded-2xl bg-explore-card border border-explore-border flex flex-col justify-center h-full">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[9px] uppercase font-black text-primary tracking-widest">Temperature</label>
            <div className="text-xs font-mono font-black text-primary">{temperature.toFixed(2)}</div>
          </div>
          <input type="range" min="0.1" max="2.0" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full h-1.5 bg-explore-item accent-primary cursor-pointer" />
        </div>,
        <div key="c-topk" className="px-4 py-3 rounded-2xl bg-explore-card border border-explore-border flex flex-col justify-center h-full">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[9px] uppercase font-black text-success tracking-widest">Top-K Filter</label>
            <div className="text-xs font-mono font-black text-success">{topK}</div>
          </div>
          <input type="range" min="1" max="10" step="1" value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} className="w-full h-1.5 bg-explore-item accent-success cursor-pointer" />
        </div>,
        <div key="c-minp" className="px-4 py-3 rounded-2xl bg-explore-card border border-explore-border flex flex-col justify-center h-full">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[9px] uppercase font-black text-error tracking-widest">Min-P Threshold</label>
            <div className="text-xs font-mono font-black text-error">{(minPThreshold * 100).toFixed(0)}%</div>
          </div>
          <input type="range" min="0.01" max="0.25" step="0.01" value={minPThreshold} onChange={(e) => setMinPThreshold(parseFloat(e.target.value))} className="w-full h-1.5 bg-explore-item accent-error cursor-pointer" />
        </div>,
        <div key="c-sample" className="h-full">
          <button
            disabled={isShuffling || activeOptionsCount <= 1}
            onClick={triggerResample}
            className={`w-full h-full min-h-[56px] rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2
            ${(isShuffling || activeOptionsCount <= 1) ? 'bg-explore-item text-content-dim border-transparent' : 'bg-primary hover:bg-primary-hover text-white border-primary shadow-[0_0_20px_var(--color-primary-dim)] hover:scale-[1.02]'}`}
          >
            {isShuffling ? "Sampling..." : "🎲 Re-Sample"}
          </button>
        </div>
      ]}
    />
  );
};

export default Phase4_Decoding;