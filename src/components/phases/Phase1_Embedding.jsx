import React, { useState, useRef, useEffect, useCallback } from 'react';
import PhaseLayout from './../PhaseLayout';
import { useScenarios } from '../../context/ScenarioContext';

const Phase1_Embedding = ({ simulator, theme, setHoveredItem }) => {
  const { activeScenario } = useScenarios();
  const { 
    noise, setNoise, 
    positionWeight, setPositionWeight, 
    processedVectors,
    activeAttention 
  } = simulator;

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef(null);

  const tokens = activeScenario?.phase_0_tokenization?.tokens || [];
  
  const GRID_SCALE = 150; 

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getSemanticPosition = (x, y) => {
    const horizontal = x >= 0 ? "Weltbezug" : "Struktur";
    const vertical = y <= 0 ? "Kontextbindung" : "Eigenständigkeit";
    return `${horizontal} / ${vertical}`;
  };

  const getInspectorData = useCallback((id) => {
    if (!id) return null;
    const vec = processedVectors.find(v => Number(v.id) === Number(id) || Number(v.token_index) === Number(id));
    const token = tokens.find(t => Number(t.id) === Number(id));
    const rawVector = activeScenario?.phase_1_embedding?.token_vectors?.find(v => Number(v.id) === Number(id) || Number(v.token_index) === Number(id));

    const baseVec = rawVector?.base_vector || [0, 0];
    const posVec = rawVector?.positional_vector || [0, 0];
    const explanation = rawVector?.explanation || "Keine spezifische Analyse für dieses Token im aktuellen Szenario hinterlegt.";

    if (vec && token) {
      const stabilityValue = Math.max(5, 100 - (noise * 16));
      const currentXWithNoise = vec.displayX / GRID_SCALE;
      const currentYWithNoise = vec.displayY / GRID_SCALE;

      return {
        title: `Vektor-Analyse: ${token.text}`,
        subtitle: "Vergleich: Wissen vs. Inferenz",
        data: {
          "--- Base-Vector (Original)": "---",
          "Base X (Semantik)": baseVec[0].toFixed(3),
          "Base Y (Vektor)": baseVec[1].toFixed(3),
          
          "--- Arbeits-Vector (Live)": "---",
          "Current X (Total)": currentXWithNoise.toFixed(3),
          "Current Y (Total)": currentYWithNoise.toFixed(3),
          "Positional Shift": `+${(posVec[0] * positionWeight).toFixed(3)} / +${(posVec[1] * positionWeight).toFixed(3)}`,
          
          "--- Simulator-Status": "---",
          "Fokus-Ausrichtung": getSemanticPosition(vec.displayX, vec.displayY),
          "Rauschen (Einfluss)": noise > 0 ? `±${(noise * 0.08).toFixed(3)}` : "Keines",
          "Stabilität": stabilityValue.toFixed(0) + "%",

          "--- KI Begründung": "---",
          "Information": explanation || "Keine zusätzlichen Infos verfügbar.",
        }
      };
    }
    return null;
  }, [processedVectors, noise, positionWeight, tokens, activeScenario]);

  useEffect(() => {
    if (selectedTokenId) setHoveredItem(getInspectorData(selectedTokenId));
  }, [noise, positionWeight, selectedTokenId, getInspectorData, setHoveredItem]);

  const handleAutoFit = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  useEffect(() => { handleAutoFit(); }, [activeScenario?.id, handleAutoFit]);

  const move = (dx, dy) => {
    const step = 60 / transform.scale;
    setTransform(prev => ({ ...prev, x: prev.x + dx * step, y: prev.y + dy * step }));
  };

  const zoom = (factor) => {
    setTransform(prev => ({ ...prev, scale: Math.max(0.1, Math.min(prev.scale + factor, 5)) }));
  };

  return (
    <PhaseLayout
      title="Phase 1: Semantischer Vektorraum"
      subtitle="Einbettung der Tokens in n-Dimensionen"
      theme={theme}
      badges={[
        { text: `Vektoren: ${tokens.length}`, className: "border-blue-500/30 text-blue-400 bg-blue-500/5" },
        { text: `Zoom: ${(transform.scale * 100).toFixed(0)}%`, className: "border-slate-500/30 text-slate-500 bg-white/5" }
      ]}
      visualization={
        <div className="relative w-full h-[450px] lg:h-full overflow-hidden bg-slate-950/20"
          ref={containerRef}
          onMouseDown={(e) => {
            if (e.target.closest('.token-point')) return;
            setIsDragging(true);
            setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onWheel={(e) => {
            const scaleAmount = -e.deltaY * 0.001;
            zoom(scaleAmount);
          }}
        >
          <div className="absolute inset-0 pointer-events-none z-50">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-500 flex flex-col items-center">
              <span className="mb-1 text-blue-400">↑ Hohe Kontextbindung</span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-500 flex flex-col items-center">
              <span className="text-blue-400">Hohe Eigenständigkeit ↓</span>
            </div>
            <div className="absolute left-4 top-1/2 -rotate-90 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
              ← Sprachliche Struktur & Funktion
            </div>
            <div className="absolute right-4 top-1/2 rotate-90 translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
              Weltbezug & Entitäten →
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[60]">
             <button onClick={() => zoom(0.2)} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg">+</button>
             <button onClick={() => zoom(-0.2)} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg">−</button>
             <button onClick={handleAutoFit} className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center text-[8px] text-white hover:bg-slate-700 transition-colors shadow-lg font-bold">RESET</button>
             <button onClick={() => setShowInfo(!showInfo)} className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">{showInfo ? '✕' : 'ℹ'}</button>
          </div>

          {showInfo && (
            <div className="absolute top-14 right-14 z-[60] w-64 p-4 rounded-xl bg-slate-900/95 border border-blue-500/30 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Vektor-Orientierung</h4>
              <p className="text-[11px] leading-relaxed text-slate-300">Nähe bedeutet Ähnlichkeit. Achsen zeigen strukturelle vs. inhaltliche Bedeutung.</p>
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${transform.x + dimensions.width/2}px, ${transform.y + dimensions.height/2}px) scale(${transform.scale})`,
              transformOrigin: '0 0'
            }}
          >
            <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: '1px', height: '1px' }}>
              <line x1="-3000" y1="0" x2="3000" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <line x1="0" y1="-3000" x2="0" y2="3000" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

              {[-2, -1, 1, 2].map(val => (
                <React.Fragment key={val}>
                  <line x1={val * GRID_SCALE} y1="-10" x2={val * GRID_SCALE} y2="10" stroke="white" strokeWidth="1.5" opacity="0.3" />
                  <text x={val * GRID_SCALE} y="25" fill="white" fontSize="10" opacity="0.4" textAnchor="middle">{val}</text>
                  <line x1="-10" y1={val * GRID_SCALE * -1} x2="10" y2={val * GRID_SCALE * -1} stroke="white" strokeWidth="1.5" opacity="0.3" />
                  <text x="-20" y={val * GRID_SCALE * -1 + 4} fill="white" fontSize="10" opacity="0.4" textAnchor="end">{val}</text>
                </React.Fragment>
              ))}
            </svg>

            {processedVectors.map((vec, i) => {
              const token = tokens.find(t => Number(t.id) === Number(vec.id) || Number(t.id) === Number(vec.token_index));
              if (!token) return null;
              const isSelected = selectedTokenId === token.id;
              const isHovered = hoveredIndex === i;

              return (
                <div key={i} className="absolute token-point group z-20 cursor-pointer"
                  style={{ left: `${vec.displayX}px`, top: `${vec.displayY * -1}px`, transform: 'translate(-50%, -50%)' }}
                  onMouseEnter={() => { setHoveredIndex(i); setHoveredItem(getInspectorData(token.id)); }}
                  onMouseLeave={() => { setHoveredIndex(null); setHoveredItem(getInspectorData(selectedTokenId)); }}
                  onClick={(e) => { e.stopPropagation(); setSelectedTokenId(token.id); setActiveTooltip({ token, x: vec.displayX, y: vec.displayY * -1 }); }}
                >
                  {(isHovered || isSelected) && (
                    <div className="absolute w-2 h-2 rounded-full bg-blue-500/20 border border-blue-500/30"
                      style={{ left: `${vec.displayXOrig - vec.displayX}px`, top: `${(vec.displayYOrig - vec.displayY) * -1}px`, transform: 'translate(-50%, -50%)' }}
                    />
                  )}
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${isHovered || isSelected ? 'scale-150 bg-white border-blue-400 shadow-lg' : 'bg-blue-600 border-transparent opacity-60'}`} />
                  <div className="absolute -top-7 left-1/2 bg-slate-900/90 px-2 py-0.5 rounded text-[10px] text-blue-200 font-bold border border-white/5 whitespace-nowrap pointer-events-none" style={{ transform: `translateX(-50%) scale(${1 / transform.scale})` }}>
                    {token.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
      controls={
        <>
          <div className="px-4 py-3 bg-slate-900/80 rounded-lg border border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[8px] uppercase font-black text-blue-500 tracking-widest">Semantic Noise</label>
              <div className="text-[10px] font-mono text-blue-400">{noise.toFixed(2)}</div>
            </div>
            <input type="range" min="0" max="5" step="0.1" value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>

          <div className="px-4 py-3 bg-slate-900/80 rounded-lg border border-white/5 shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <label className="text-[8px] uppercase font-black text-purple-500 tracking-widest">Position Weight</label>
              <div className="text-[10px] font-mono text-purple-400">{(positionWeight * 100).toFixed(0)}%</div>
            </div>
            <input type="range" min="0" max="1" step="0.01" value={positionWeight} onChange={(e) => setPositionWeight(parseFloat(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500" />
          </div>

          <div className="px-4 py-3 bg-slate-900/80 rounded-lg border border-white/5">
            <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Navigation & View</label>
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-3 gap-0.5 bg-slate-800/50 p-0.5 rounded-lg border border-white/5">
                <div /> <button onClick={() => move(0, 1)} className="w-5 h-5 flex items-center justify-center bg-slate-900 rounded-sm hover:bg-slate-700 text-[8px]">▲</button> <div />
                <button onClick={() => move(1, 0)} className="w-5 h-5 flex items-center justify-center bg-slate-900 rounded-sm hover:bg-slate-700 text-[8px]">◀</button>
                <button onClick={() => move(0, -1)} className="w-5 h-5 flex items-center justify-center bg-slate-900 rounded-sm hover:bg-slate-700 text-[8px]">▼</button>
                <button onClick={() => move(-1, 0)} className="w-5 h-5 flex items-center justify-center bg-slate-900 rounded-sm hover:bg-slate-700 text-[8px]">▶</button>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <button onClick={() => zoom(0.1)} className="h-5 bg-slate-800 rounded border border-white/5 hover:bg-blue-600/20 text-[10px]">+</button>
                <button onClick={() => zoom(-0.1)} className="h-5 bg-slate-800 rounded border border-white/5 hover:bg-blue-600/20 text-[10px]">−</button>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
};

export default Phase1_Embedding;