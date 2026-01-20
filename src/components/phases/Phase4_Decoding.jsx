import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase4_Decoding = ({ simulator, setHoveredItem, theme, activeScenario }) => {
  const {
    temperature, setTemperature, finalOutputs, activeAttention,
    setSelectedToken, mlpThreshold, setMlpThreshold, activeFFN, noise, setNoise,
    headOverrides, setHeadOverrides, activeProfileId, sourceTokenId, setSourceTokenId
  } = simulator;

  const [selectedLabel, setSelectedLabel] = useState(null);
  const [topK, setTopK] = useState(5);
  const [minPThreshold, setMinPThreshold] = useState(0.05);
  const [simulationState, setSimulationState] = useState({ outputs: [], winner: null });
  const [isShuffling, setIsShuffling] = useState(false);

  const getItemVisuals = (item) => {
    const matchingCategory = activeFFN?.find(cat =>
      String(cat.id).toLowerCase() === String(item.category_link || "").toLowerCase()
    );

    return {
      color: item?.color || matchingCategory?.color || "#475569",
      icon: item?.icon || matchingCategory?.icon || "📄"
    };
  };

  const calculateLogic = useCallback(() => {
    const scenario = activeScenario || simulator?.activeScenario;
    const sourceTokens = scenario?.phase_4_decoding?.top_k_tokens;

    if (!sourceTokens || sourceTokens.length === 0 || !scenario) {
      return null;
    }

    const T = Math.max(0.01, parseFloat(temperature) || 0.7);
    const biasMultiplier = scenario?.phase_4_decoding?.settings?.logit_bias_multiplier || 12;

    const results = sourceTokens.map(item => {
      const liveFFNData = simulator?.activeFFN?.find(f =>
        String(f.id).toLowerCase().trim() === String(item.category_link).toLowerCase().trim()
      );

      const liveActivation = liveFFNData ? liveFFNData.activation : 0.5;
      const ffnBias = (liveActivation - 0.5) * biasMultiplier;
      const baseLogit = item.base_logit !== undefined ? item.base_logit : 5.0;

      const jitter = (Math.random() - 0.5) * (noise || 0) * 2.0;
      const effectiveLogit = baseLogit + ffnBias + jitter;

      return {
        ...item,
        label: item.token, 
        effectiveLogit,
        liveActivation,
        actingHead: liveFFNData?.linked_head ? `Head ${liveFFNData.linked_head}` : "Default",
        ffnBoost: ffnBias,
        isBlockedByMLP: liveActivation < mlpThreshold,
        exp: Math.exp(effectiveLogit / T)
      };
    });

    const sumExp = results.reduce((acc, curr) => acc + curr.exp, 0);
    return results.map(item => ({
      ...item,
      dynamicProb: sumExp > 0 ? item.exp / sumExp : 0
    })).sort((a, b) => b.dynamicProb - a.dynamicProb);

  }, [activeFFN, simulator?.activeFFN, activeScenario, temperature, noise, mlpThreshold]);

  useEffect(() => {
    const results = calculateLogic();
    if (results) {
      setSimulationState(prev => ({
        outputs: results.slice(0, 10),
        winner: (prev.winner && results.find(r => r.token === prev.winner.token)) || results[0]
      }));
    }
  }, [calculateLogic]);

  const getInspectorData = useCallback((out, index) => {
    if (!out) return null;
    const { icon } = getItemVisuals(out);
    
    // Halluzinations-Risiko Check
    const isHallucination = out.hallucination_risk > 0.8 || (noise > 0.8 && out.noise_sensitivity > 0.7);

    return {
      title: `${icon} Decoding: ${out.token}`,
      subtitle: `Kategorie: ${out.category_link}`,
      data: {
        "Status": out.isBlockedByMLP ? "BLOCKIERT (MLP)" : (index < topK ? "AKTIV" : "GEFILTERT"),
        "Wahrscheinlichkeit": (out.dynamicProb * 100).toFixed(2) + "%",
        "Einfluss durch": out.actingHead,
        "Logit-Shift": (out.ffnBoost >= 0 ? "+" : "") + out.ffnBoost?.toFixed(2),
        "Halluzinations-Risiko": isHallucination ? "HOCH ⚠️" : "NIEDRIG",
        "Aktivierung (Live)": (out.liveActivation * 100).toFixed(0) + "%"
      }
    };
  }, [topK, activeFFN, noise]);

  const updateInspector = useCallback((token) => {
    const results = calculateLogic();
    const out = results?.find(o => o.token === token);
    const idx = results?.findIndex(o => o.token === token);
    if (out) setHoveredItem(getInspectorData(out, idx));
  }, [calculateLogic, getInspectorData, setHoveredItem]);

  useEffect(() => {
    if (selectedLabel) updateInspector(selectedLabel);
  }, [headOverrides, mlpThreshold, noise, temperature, selectedLabel, updateInspector]);

  useEffect(() => {
    if (!isShuffling) {
      const results = calculateLogic();
      if (results) {
        setSimulationState(prev => {
          const newWinner = prev.winner
            ? results.find(r => r.token === prev.winner.token)
            : results[0];

          return {
            outputs: results.slice(0, 10),
            winner: (newWinner && !newWinner.isBlockedByMLP) ? newWinner : results[0]
          };
        });
      }
    }
  }, [calculateLogic, activeScenario?.id, isShuffling, headOverrides, simulator?.activeFFN]);

  const triggerResample = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const results = calculateLogic();
      if (results) {
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
    return simulationState.outputs.filter((out, i) =>
      i < topK && out.dynamicProb >= minPThreshold && !out.isBlockedByMLP
    ).length;
  }, [simulationState.outputs, topK, minPThreshold]);

  return (
    <PhaseLayout
      title="Phase 4: Softmax Decoding Pipeline"
      subtitle="Physikalische Signal-Modulation & Sampling"
      theme={theme}
      badges={[
        { text: `Entropy: ${(noise || 0).toFixed(2)}`, className: noise > 1 ? "text-red-500 font-bold" : "text-slate-400" },
        { text: `MLP Filter: ${mlpThreshold.toFixed(2)}`, className: "text-blue-500 font-bold" }
      ]}
      visualization={
        <div className="flex flex-row h-full w-full gap-4 relative pt-12 px-2" onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}>
          <div className={`flex flex-col justify-between items-end pb-10 pt-4 text-[8px] font-black w-8 shrink-0 ${theme === 'light' ? 'text-slate-500' : 'text-slate-600'}`}>
            <span>1.0</span><span>0.5</span><span>0.0</span>
          </div>

          <div className="relative flex-1 h-full flex flex-col justify-end">
            <div className="absolute inset-0 pb-10 pt-4 pointer-events-none opacity-20">
              <div className="absolute top-4 w-full border-t border-current opacity-20" />
              <div className="absolute top-1/2 w-full border-t border-current opacity-20" />
              <div className="absolute bottom-10 w-full border-t-2 border-current opacity-50" />
            </div>

            <div className="absolute left-0 w-full border-t-2 border-dashed border-red-500 z-30 transition-all duration-500 pointer-events-none"
              style={{ bottom: `calc(${(minPThreshold * 85)}% + 40px)` }}>
              <div className="absolute right-0 -top-2.5 px-1.5 py-0.5 bg-red-600 text-[7px] text-white rounded font-black uppercase shadow-lg">
                Gate: {(minPThreshold * 100).toFixed(0)}%
              </div>
            </div>

            <div className="relative flex items-end justify-around gap-1 lg:gap-2 h-full pb-10">
              {simulationState.outputs.map((out, i) => {
                const isWinner = simulationState.winner?.token === out.token;
                const isActive = i < topK && out.dynamicProb >= minPThreshold && !out.isBlockedByMLP;
                const { color, icon } = getItemVisuals(out);

                return (
                  <div key={out.token + i} className={`relative flex flex-col items-center flex-1 h-full justify-end transition-all duration-500 ${selectedLabel === out.token ? 'z-30' : 'z-10'} ${(!isActive && !isWinner) ? 'opacity-30 grayscale' : 'opacity-100'}`}
                    onMouseEnter={() => setHoveredItem(getInspectorData(out, i))}
                    onMouseLeave={() => selectedLabel ? updateInspector(selectedLabel) : setHoveredItem(null)}
                    onClick={(e) => { e.stopPropagation(); setSelectedLabel(out.token); }}
                  >
                    {isWinner && !isShuffling && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[20px] animate-bounce z-40 bg-slate-900/50 rounded-full p-1 border border-white/20 shadow-xl">
                        {noise > 1.2 ? '🥴' : '🎯'}
                      </div>
                    )}
                    
                    {/* NEU: Warn-Icon für blockierte Tokens */}
                    {out.isBlockedByMLP && (
                      <div className="absolute top-0 text-[10px] animate-pulse text-red-500 font-bold z-50">⚠️</div>
                    )}

                    <div className="mb-1 text-[10px]">{icon}</div>
                    <span className={`text-[8px] font-black mb-1 ${(isActive || isWinner) ? (theme === 'light' ? 'text-slate-900' : 'text-blue-400') : 'text-slate-500'}`}>
                      {isShuffling ? (Math.random() * 100).toFixed(0) : (out.dynamicProb * 100).toFixed(0)}%
                    </span>
                    <div className={`w-full max-w-[40px] rounded-t-lg transition-all duration-300 ${isWinner && !isShuffling ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${isShuffling ? 'animate-pulse opacity-50' : ''}`}
                      style={{
                        height: isShuffling ? `${Math.random() * 85}%` : `${out.dynamicProb * 85}%`,
                        backgroundColor: (isActive || isWinner) ? color : (theme === 'light' ? '#cbd5e1' : '#334155'),
                        // Jitter-Effekt bei hohem Noise
                        transform: noise > 0.8 ? `translateX(${(Math.random() - 0.5) * noise * 2}px)` : 'none'
                      }}
                    />
                    <div className="absolute top-full pt-2 w-full text-center">
                      <span className={`text-[9px] uppercase tracking-tighter block truncate px-0.5 ${isWinner ? 'font-black text-blue-600' : 'text-slate-500'}`}>{out.token}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
      controls={[
        <div key="c-1" className="px-4 py-3 rounded-xl border border-white/5 bg-slate-900 flex flex-col justify-center h-full">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[9px] uppercase font-black text-blue-500">Creativity (Temp)</label>
            <div className="text-xs font-mono font-black text-blue-500">{temperature.toFixed(2)}</div>
          </div>
          <input type="range" min="0.1" max="2.0" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full h-1.5 accent-blue-500" />
        </div>,
        <div key="c-2" className="px-4 py-3 rounded-xl border border-white/5 bg-slate-900 flex flex-col justify-center h-full">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[9px] uppercase font-black text-green-600">Filter (Top-K)</label>
            <div className="text-xs font-mono font-black text-green-600">{topK}</div>
          </div>
          <input type="range" min="1" max="10" step="1" value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} className="w-full h-1.5 accent-green-600" />
        </div>,
        <div key="c-3" className="px-4 py-3 rounded-xl border border-white/5 bg-slate-900 flex flex-col justify-center h-full">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[9px] uppercase font-black text-red-600">Min-P Quality</label>
            <div className="text-xs font-mono font-black text-red-600">{(minPThreshold * 100).toFixed(0)}%</div>
          </div>
          <input type="range" min="0.01" max="0.25" step="0.01" value={minPThreshold} onChange={(e) => setMinPThreshold(parseFloat(e.target.value))} className="w-full h-1.5 accent-red-600" />
        </div>,
        <div key="c-4" className="h-full">
          <button
            disabled={isShuffling || activeOptionsCount <= 1}
            onClick={triggerResample}
            className={`w-full h-full min-h-[56px] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2
            ${(isShuffling || activeOptionsCount <= 1) ? 'bg-slate-800 text-slate-500 opacity-50' : 'bg-blue-600 text-white border-blue-500/50 shadow-lg'}`}
          >
            {isShuffling ? "Sampling..." : "🎲 Re-Sample"}
          </button>
        </div>
      ]}
    />
  );
};

export default Phase4_Decoding;