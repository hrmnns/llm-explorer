import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  // KORREKTUR: e.clientX/Y entfernt, da diese hier nicht definiert sind
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef(null);

  const lastScenarioId = useRef(activeScenario?.id);

  const tokens = activeScenario?.phase_0_tokenization?.tokens || [];
  const GRID_SCALE = 150;

  const axisConfig = useMemo(() => {
    const customMap = activeScenario?.phase_1_embedding?.axis_map;
    return {
      x: {
        pos: customMap?.x_axis?.positive || "Weltbezug",
        neg: customMap?.x_axis?.negative || "Sprachstruktur",
        desc: customMap?.x_axis?.description || "Inhaltliche Tiefe vs. syntaktische Form."
      },
      y: {
        pos: customMap?.y_axis?.positive || "Kontextbindung",
        neg: customMap?.y_axis?.negative || "Eigenständigkeit",
        desc: customMap?.y_axis?.description || "Funktionale Rolle im Satzbau."
      }
    };
  }, [activeScenario]);

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

  const getSemanticPosition = useCallback((x, y) => {
    const horizontal = x >= 0 ? axisConfig.x.pos : axisConfig.x.neg;
    const vertical = y <= 0 ? axisConfig.y.neg : axisConfig.y.pos;
    return `${horizontal} / ${vertical}`;
  }, [axisConfig]);

  const getInspectorData = useCallback((id) => {
    if (!id) return null;
    const vec = processedVectors.find(v => Number(v.id) === Number(id) || Number(v.token_index) === Number(id));
    const token = tokens.find(t => Number(t.id) === Number(id));
    const rawVector = activeScenario?.phase_1_embedding?.token_vectors?.find(v => Number(v.id) === Number(id) || Number(v.token_index) === Number(id));

    if (!vec || !token) return null;

    const baseVec = rawVector?.base_vector || [0, 0];
    const posVec = rawVector?.positional_vector || [0, 0];
    const stabilityValue = Math.max(5, 100 - (noise * 16));

    return {
      title: `Vektor-Analyse: ${token.text}`,
      subtitle: "Einbettung im n-dimensionalen Raum",
      data: {
        "--- Raum-Koordinaten": "---",
        "Position": getSemanticPosition(vec.displayX, vec.displayY),
        "X-Wert (Semantik)": (vec.displayX / GRID_SCALE).toFixed(3),
        "Y-Wert (Kontext)": (vec.displayY / GRID_SCALE).toFixed(3),

        "--- Einflüsse": "---",
        "Base Vector": `[${baseVec[0].toFixed(2)}, ${baseVec[1].toFixed(2)}]`,
        "Positional Shift": `+${(posVec[0] * positionWeight).toFixed(3)}`,
        "Rausch-Faktor": noise > 0 ? `±${(noise * 0.05).toFixed(3)}` : "Stabil (0.0)",

        "--- Analyse": "---",
        "Stabilität": stabilityValue.toFixed(0) + "%",
        "Interpretation": rawVector?.explanation || "Token ohne spezifische Kontext-Analyse."
      }
    };
  }, [processedVectors, noise, positionWeight, tokens, activeScenario, axisConfig, getSemanticPosition]);

  useEffect(() => {
    if (selectedTokenId) setHoveredItem(getInspectorData(selectedTokenId));
  }, [noise, positionWeight, selectedTokenId, getInspectorData, setHoveredItem]);

  useEffect(() => {
    if (activeScenario?.id !== lastScenarioId.current) {
      setTransform({ x: 0, y: 0, scale: 1 });
      setSelectedTokenId(null);
      setHoveredIndex(null);
      lastScenarioId.current = activeScenario?.id;
    }
  }, [activeScenario?.id]);

  const move = (dx, dy) => {
    const step = 60 / transform.scale;
    setTransform(prev => ({ ...prev, x: prev.x + dx * step, y: prev.y + dy * step }));
  };

  const zoom = (factor) => {
    setTransform(prev => ({ ...prev, scale: Math.max(0.2, Math.min(prev.scale + factor, 5)) }));
  };

  return (
    <PhaseLayout
      title="Phase 1: Semantischer Vektorraum"
      subtitle="Einbettung der Tokens in n-Dimensionen"
      theme={theme}
      badges={[
        { text: `Vektoren: ${tokens.length}`, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        { text: `Zoom: ${(transform.scale * 100).toFixed(0)}%`, className: "bg-explore-item text-content-muted border-explore-border" }
      ]}
      visualization={
        <div className="relative w-full min-h-[500px] lg:h-full overflow-hidden bg-explore-viz rounded-lg"
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
          onWheel={(e) => zoom(-e.deltaY * 0.001)}
        >
          {/* Achsenbeschriftung */}
          <div className="absolute inset-0 pointer-events-none z-10 px-2 py-2">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-blue-500/60 flex flex-col items-center">
              <span>↑ {axisConfig.y.pos}</span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-blue-500/60 flex flex-col items-center">
              <span>{axisConfig.y.neg} ↓</span>
            </div>
            <div className="absolute left-2 lg:left-4 top-1/2 -rotate-90 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-blue-500/60 whitespace-nowrap">
              ← {axisConfig.x.neg}
            </div>
            <div className="absolute right-2 lg:right-4 top-1/2 rotate-90 translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-blue-500/60 whitespace-nowrap">
              {axisConfig.x.pos} →
            </div>
          </div>

          <div className="absolute top-6 right-6 flex flex-col gap-2 z-[60]">
            <button onClick={() => zoom(0.2)} className="w-10 h-10 rounded-xl bg-explore-nav border border-explore-border text-content-main hover:bg-blue-600 hover:text-white transition-all shadow-xl font-bold">+</button>
            <button onClick={() => zoom(-0.2)} className="w-10 h-10 rounded-xl bg-explore-nav border border-explore-border text-content-main hover:bg-blue-600 hover:text-white transition-all shadow-xl font-bold">−</button>
            <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} className="w-10 h-10 rounded-xl bg-explore-nav border border-explore-border text-[8px] text-content-main hover:bg-explore-item transition-all shadow-xl font-black">AUTO</button>
            <button onClick={() => setShowInfo(!showInfo)} className="w-10 h-10 rounded-full bg-explore-nav border border-explore-border text-content-dim hover:text-content-main transition-all shadow-xl">{showInfo ? '✕' : 'ℹ'}</button>
          </div>

          {showInfo && (
            <div className="absolute top-20 right-6 lg:right-20 z-[60] w-64 p-5 rounded-2xl bg-explore-nav border border-explore-border shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Vektor-Orientierung</h4>
              <p className="text-[11px] leading-relaxed text-content-muted mb-2">{axisConfig.x.desc}</p>
              <p className="text-[11px] leading-relaxed text-content-muted">{axisConfig.y.desc}</p>
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${transform.x + dimensions.width / 2}px, ${transform.y + dimensions.height / 2}px) scale(${transform.scale})`,
              transformOrigin: '0 0'
            }}
          >
            {/* SVG Grid */}
            <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{ width: '1px', height: '1px' }}>
              {/* Hauptachsen - etwas kräftiger */}
              <line x1="-3000" y1="0" x2="3000" y2="0" stroke="currentColor" className="text-explore-border" strokeWidth="1" opacity="0.8" />
              <line x1="0" y1="-3000" x2="0" y2="3000" stroke="currentColor" className="text-explore-border" strokeWidth="1" opacity="0.8" />

              {/* Hilfslinien und Skalierung */}
              {[-2, -1, 1, 2].map(val => (
                <React.Fragment key={val}>
                  {/* Vertikale Hilfslinien */}
                  <line x1={val * GRID_SCALE} y1="-15" x2={val * GRID_SCALE} y2="15" stroke="currentColor" className="text-explore-border" strokeWidth="1.5" opacity="0.6" />
                  <text x={val * GRID_SCALE} y="30" fill="currentColor" className="text-content-dim font-bold" fontSize="10" textAnchor="middle">{val}</text>

                  {/* Horizontale Hilfslinien */}
                  <line x1="-15" y1={val * GRID_SCALE * -1} x2="15" y2={val * GRID_SCALE * -1} stroke="currentColor" className="text-explore-border" strokeWidth="1.5" opacity="0.6" />
                  <text x="-25" y={val * GRID_SCALE * -1 + 4} fill="currentColor" className="text-content-dim font-bold" fontSize="10" textAnchor="end">{val}</text>
                </React.Fragment>
              ))}
            </svg>

            {/* Token-Punkte */}
            {processedVectors.map((vec, i) => {
              const token = tokens.find(t => Number(t.id) === Number(vec.id) || Number(t.id) === Number(vec.token_index));
              if (!token) return null;
              const isSelected = selectedTokenId === token.id;

              return (
                <div key={token.id} className="absolute token-point group z-20 cursor-pointer"
                  style={{ left: `${vec.displayX}px`, top: `${vec.displayY * -1}px`, transform: 'translate(-50%, -50%)' }}
                  onMouseEnter={() => { setHoveredIndex(i); setHoveredItem(getInspectorData(token.id)); }}
                  onMouseLeave={() => { setHoveredIndex(null); setHoveredItem(getInspectorData(selectedTokenId)); }}
                  onClick={(e) => { e.stopPropagation(); setSelectedTokenId(token.id); }}
                >
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${isSelected ? 'scale-150 bg-white border-blue-500 shadow-[0_0_15px_#3b82f6]' : 'bg-blue-600 border-transparent opacity-60 hover:opacity-100'}`} />
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-explore-nav/90 px-2 py-0.5 rounded text-[10px] text-blue-500 font-bold border border-explore-border whitespace-nowrap pointer-events-none shadow-xl" style={{ transform: `translateX(-50%) scale(${1 / transform.scale})` }}>
                    {token.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
      controls={[
        <div key="ctrl-noise" className="px-4 py-3 bg-explore-card rounded-xl border border-explore-border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[8px] uppercase font-black text-blue-500 tracking-widest">Semantic Noise</label>
            <div className="text-[10px] font-mono text-blue-500 font-bold">{noise.toFixed(2)}</div>
          </div>
          <input type="range" min="0" max="5" step="0.1" value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} className="w-full h-1 bg-explore-border rounded-lg appearance-none cursor-pointer accent-blue-500" />
        </div>,
        <div key="ctrl-pos" className="px-4 py-3 bg-explore-card rounded-xl border border-explore-border shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[8px] uppercase font-black text-purple-500 tracking-widest">Position Weight</label>
            <div className="text-[10px] font-mono text-purple-500 font-bold">{(positionWeight * 100).toFixed(0)}%</div>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={positionWeight} onChange={(e) => setPositionWeight(parseFloat(e.target.value))} className="w-full h-1 bg-explore-border rounded-lg appearance-none cursor-pointer accent-purple-500" />
        </div>,
        <div key="ctrl-nav" className="px-4 py-3 bg-explore-card rounded-xl border border-explore-border shadow-sm">
          <label className="text-[8px] uppercase font-black text-content-dim tracking-widest block mb-2">Navigation & View</label>
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-3 gap-0.5 bg-explore-item p-0.5 rounded-lg border border-explore-border">
              <div /> <button onClick={() => move(0, 1)} className="w-6 h-6 flex items-center justify-center bg-explore-nav text-content-main rounded-sm hover:bg-blue-500 hover:text-white text-[8px] transition-colors">▲</button> <div />
              <button onClick={() => move(1, 0)} className="w-6 h-6 flex items-center justify-center bg-explore-nav text-content-main rounded-sm hover:bg-blue-500 hover:text-white text-[8px] transition-colors">◀</button>
              <button onClick={() => move(0, -1)} className="w-6 h-6 flex items-center justify-center bg-explore-nav text-content-main rounded-sm hover:bg-blue-500 hover:text-white text-[8px] transition-colors">▼</button>
              <button onClick={() => move(-1, 0)} className="w-6 h-6 flex items-center justify-center bg-explore-nav text-content-main rounded-sm hover:bg-blue-500 hover:text-white text-[8px] transition-colors">▶</button>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <button onClick={() => zoom(0.1)} className="h-6 bg-explore-nav text-content-main rounded border border-explore-border hover:bg-blue-500 hover:text-white text-[10px] font-bold transition-colors">+</button>
              <button onClick={() => zoom(-0.1)} className="h-6 bg-explore-nav text-content-main rounded border border-explore-border hover:bg-blue-500 hover:text-white text-[10px] font-bold transition-colors">−</button>
            </div>
          </div>
        </div>
      ]}
    />
  );
};

export default Phase1_Embedding;