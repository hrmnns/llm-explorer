import React, { useState, useEffect, useCallback } from 'react';
import PhaseLayout from './../PhaseLayout';

const Phase4_Decoding = ({ simulator, setHoveredItem, theme }) => {
  const { 
    temperature, 
    setTemperature, 
    finalOutputs, 
    activeAttention, 
    setSelectedToken,
    mlpThreshold,
    activeFFN,
    noise
  } = simulator;
  
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [topK, setTopK] = useState(5); 
  const [minPThreshold, setMinPThreshold] = useState(0.07);
  
  const [simulationState, setSimulationState] = useState({
    outputs: [],
    winner: null
  });

  const pipelineSignal = activeAttention?.avgSignal || 1.0;
  const isCritical = pipelineSignal < 0.4;

  // INTELLIGENTE FARB-ERBUNG & ICON-ZUWEISUNG:
  const getItemVisuals = (item) => {
    const matchingCategory = activeFFN?.find(cat => cat.label === item.type);
    const color = item?.color || matchingCategory?.color || "#475569";
    
    // Icons basierend auf dem Typ (analog zu Phase 3)
    let icon = "📄";
    if (item.type?.includes("Wissenschaft") || item.type?.includes("Scientific")) icon = "🔬";
    if (item.type?.includes("Sozial") || item.type?.includes("Social")) icon = "🤝";
    if (item.type?.includes("Funktional") || item.type?.includes("Functional")) icon = "⚙️";
    if (item.type?.includes("Evolution") || item.type?.includes("Ancestral")) icon = "🦴";
    
    return { color, icon };
  };

  const runSimulation = useCallback(() => {
    if (!finalOutputs || finalOutputs.length === 0) return;

    const T = Math.max(0.01, temperature);

    const calculated = finalOutputs.map(out => {
      // 1. FFN Filter (Gatekeeper aus Phase 3)
      const ffnCat = activeFFN?.find(f => f.label === out.type);
      const isBlockedByMLP = ffnCat ? ffnCat.activation < mlpThreshold : false;
      
      // 2. Noise Modulation
      const sensitivity = out.noise_sensitivity || 0;
      const noiseImpact = Math.exp(-(sensitivity * (noise || 0)));

      // 3. Modifizierter Logit
      const baseLogit = out.logit !== undefined ? out.logit : Math.log(out.probability + 0.0001);
      const effectiveLogit = isBlockedByMLP ? -100 : baseLogit * noiseImpact;

      return { 
        ...out, 
        effectiveLogit,
        isBlockedByMLP,
        exp: Math.exp(effectiveLogit / T) 
      };
    });

    const sum = calculated.reduce((acc, curr) => acc + curr.exp, 0);

    const probabilities = calculated.map(out => ({
      ...out,
      dynamicProb: sum > 0 ? out.exp / sum : 0
    }));

    let winner = probabilities[0];
    const r = Math.random();
    let cumulative = 0;

    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i].dynamicProb;
      if (r <= cumulative) {
        winner = probabilities[i];
        break;
      }
    }

    const sortedForDisplay = [...probabilities].sort((a, b) => b.dynamicProb - a.dynamicProb);

    setSimulationState({
      outputs: sortedForDisplay.slice(0, 10),
      winner: winner
    });

    if (setSelectedToken) {
        setSelectedToken(winner);
    }
  }, [finalOutputs, temperature, setSelectedToken, mlpThreshold, activeFFN, noise]); 

  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  const getInspectorData = (out, index) => {
    const isTopK = index < topK;
    const isAboveThreshold = out.dynamicProb >= minPThreshold;
    const { icon } = getItemVisuals(out);
    let statusText = out.isBlockedByMLP ? "Blockiert (MLP)" : (isTopK ? (isAboveThreshold ? "Aktiv" : "Gefiltert (Min-P)") : "Gefiltert (Top-K)");
    
    return {
      title: `${icon} Decoding: ${out.label}`,
      subtitle: `Kategorie: ${out.type || 'Standard'}`,
      data: {
        "--- Softmax-Status": "---",
        "Logit (Effektiv)": out.effectiveLogit?.toFixed(2),
        "Wahrscheinlichkeit": (out.dynamicProb * 100).toFixed(2) + "%",
        "MLP Gate": out.isBlockedByMLP ? "GESTOPPT" : "PASSIERT",
        "--- Status": "---",
        "Auswahl": simulationState.winner?.label === out.label ? "GEWÄHLT" : statusText,
        "--- Trace": "---",
        "Info": out.causality_trace || out.explanation
      }
    };
  };

  useEffect(() => {
    if (selectedLabel && simulationState.outputs.length > 0) {
      const found = simulationState.outputs.find(o => o.label === selectedLabel);
      if (found) {
        const index = simulationState.outputs.indexOf(found);
        setHoveredItem(getInspectorData(found, index));
      }
    }
  }, [simulationState, selectedLabel, setHoveredItem]);

  return (
    <PhaseLayout
      title="Phase 4: Softmax Decoding Pipeline"
      subtitle="Physikalische Signal-Modulation & Sampling"
      theme={theme}
      badges={[
        { text: `Noise: ${(noise || 0).toFixed(2)}`, className: noise > 1 ? "text-orange-400" : "text-slate-400" },
        { text: `MLP Filter: ${mlpThreshold.toFixed(2)}`, className: "text-blue-400 border-blue-500/30" }
      ]}
      visualization={
        <div className="flex flex-row h-[380px] lg:h-full w-full gap-4 relative" onClick={() => { setSelectedLabel(null); setHoveredItem(null); }}>
          
          <div className="flex flex-col justify-between items-end pb-10 pt-4 text-[8px] font-black text-slate-600 w-8 shrink-0 select-none">
            <span>100%</span>
            <span>50%</span>
            <span className="text-slate-800 text-[10px]">0%</span>
          </div>

          <div className="relative flex-1 h-full flex flex-col justify-end group/chart">
            
            <div className="absolute inset-0 pb-10 pt-4 pointer-events-none opacity-20">
              <div className="absolute top-4 left-0 w-full border-t border-white/10"></div>
              <div className="absolute top-1/2 left-0 w-full border-t border-white/10"></div>
              <div className="absolute bottom-10 left-0 w-full border-t border-slate-700"></div>
            </div>

            <div 
              className="absolute left-0 w-full border-t border-dashed border-red-500/40 z-20 transition-all duration-500 pointer-events-none"
              style={{ bottom: `calc(${(minPThreshold * 85)}% + 40px)` }} 
            >
              <div className="absolute right-0 -top-2 px-1.5 py-0.5 bg-slate-900 rounded border border-red-500/20 text-[6px] text-red-500 font-black tracking-widest uppercase">
                Quality Gate (Min-P)
              </div>
            </div>

            <div className="relative flex items-end justify-around gap-1 lg:gap-2 h-full pb-10">
              {simulationState.outputs.map((out, i) => {
                const isTopK = i < topK;
                const isSelected = selectedLabel === out.label;
                const isWinner = simulationState.winner && out.label === simulationState.winner.label;
                const isAboveThreshold = out.dynamicProb >= minPThreshold;
                const isActive = isTopK && isAboveThreshold && !out.isBlockedByMLP;
                const { color: barColor, icon } = getItemVisuals(out);

                return (
                  <div 
                    key={i} 
                    className={`relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer transition-all duration-500 ${
                      isSelected ? 'scale-105 z-30' : 'z-10'
                    } ${!isActive ? 'opacity-20 grayscale' : 'opacity-100'}`}
                    onMouseEnter={() => !selectedLabel && setHoveredItem(getInspectorData(out, i))}
                    onMouseLeave={() => !selectedLabel && setHoveredItem(null)}
                    onClick={(e) => { e.stopPropagation(); setSelectedLabel(out.label); }}
                  >
                    {out.isBlockedByMLP && <div className="absolute top-0 text-[8px] opacity-50">🚫</div>}

                    <div className="mb-1 text-[10px] filter drop-shadow-sm">{icon}</div>

                    <span className={`text-[7px] font-mono mb-1 transition-colors ${
                      isActive ? (isSelected ? 'text-white font-black' : 'text-slate-400') : 'text-slate-800'
                    }`}>
                      {(out.dynamicProb * 100).toFixed(0)}%
                    </span>
                    
                    <div 
                      className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 relative ${
                        isSelected ? 'ring-2 ring-white shadow-2xl' : 'border border-transparent'
                      } ${isCritical && isActive ? 'animate-pulse' : ''}`}
                      style={{ 
                        height: `${out.dynamicProb * 85}%`,
                        backgroundColor: isActive ? barColor : '#1e293b',
                        boxShadow: isWinner ? `0 0 20px ${barColor}60` : 'none'
                      }}
                    >
                      {isWinner && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[12px] animate-bounce z-30">
                          {noise > 1.2 ? '🥴' : '🎯'}
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute top-full pt-2 w-full text-center">
                      <span className={`text-[8px] lg:text-[9px] uppercase tracking-tighter block truncate px-0.5 ${
                        isWinner ? 'font-black text-blue-400' : 'font-medium text-slate-500'
                      }`}>
                        {out.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
      controls={
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          <div className="px-3 py-2 bg-slate-900/80 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] uppercase font-black text-blue-500 tracking-widest leading-none">Creativity (Temp)</label>
              <div className="text-[10px] font-mono font-black text-blue-400">{temperature.toFixed(2)}</div>
            </div>
            <input type="range" min="0.1" max="2.0" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>

          <div className="px-3 py-2 bg-slate-900/80 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] uppercase font-black text-green-500 tracking-widest leading-none">Filter (Top-K)</label>
              <div className="text-[10px] font-mono font-black text-green-400">{topK}</div>
            </div>
            <input type="range" min="1" max="10" step="1" value={topK} onChange={(e) => setTopK(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
          </div>

          <div className="px-3 py-2 bg-slate-900/80 rounded-lg border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] uppercase font-black text-red-500 tracking-widest leading-none">Min-P Quality</label>
              <div className="text-[10px] font-mono font-black text-red-400">{(minPThreshold * 100).toFixed(0)}%</div>
            </div>
            <input type="range" min="0.01" max="0.25" step="0.01" value={minPThreshold} onChange={(e) => setMinPThreshold(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500" />
          </div>

          <div className="flex flex-col justify-end pb-1">
            <button 
              onClick={runSimulation} 
              className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded text-[9px] font-bold uppercase tracking-widest transition-colors"
            >
              🎲 Re-Sample
            </button>
          </div>
        </div>
      }
    />
  );
};

export default Phase4_Decoding;