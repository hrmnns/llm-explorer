import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useScenarios } from '../../context/ScenarioContext';

const Phase1_Embedding = ({ simulator, theme, setHoveredItem }) => {
  const { activeScenario } = useScenarios();
  const { noise, setNoise, positionWeight, setPositionWeight, processedVectors } = simulator;

  // States
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null); // NEU: Für Klick-Erklärung
  const containerRef = useRef(null);

  const getTokenData = (index) => {
    return activeScenario?.phase_0_tokenization?.tokens.find(t => t.id === index + 1) || { text: '?', explanation: '' };
  };

  // --- AUTO-FIT LOGIK ---
  const handleAutoFit = useCallback(() => {
    if (!processedVectors?.length || !containerRef.current) return;
    const margin = 120;
    const coordsX = processedVectors.map(v => v.displayX);
    const coordsY = processedVectors.map(v => v.displayY);
    const minX = Math.min(...coordsX) - margin;
    const maxX = Math.max(...coordsX) + margin;
    const minY = Math.min(...coordsY) - margin;
    const maxY = Math.max(...coordsY) + margin;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const newScale = Math.min(containerWidth / (maxX - minX), containerHeight / (maxY - minY), 1.1);

    setTransform({
      x: -((minX + maxX) / 2) * newScale,
      y: -((minY + maxY) / 2) * newScale,
      scale: newScale
    });
  }, [processedVectors]);

  useEffect(() => { handleAutoFit(); }, [activeScenario?.id, handleAutoFit]);

  // --- INTERAKTION ---
  const handleMouseDown = (e) => {
    if (e.target.closest('.token-point')) return;
    setIsDragging(true);
    setActiveTooltip(null); // Tooltip bei Klick auf Hintergrund schließen
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.2, Math.min(prev.scale + scaleAmount, 5))
    }));
  };

  return (
    <div className="flex flex-col h-full p-6 font-mono select-none relative">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>Phase 1: Semantischer Vektorraum</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Navigation: Rad (Zoom) | Drag (Pan) | Klick (Info)</p>
        </div>
        <button onClick={handleAutoFit} className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded text-[10px] text-blue-400 font-bold uppercase hover:bg-blue-600/40 transition-colors">Zentrieren</button>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`flex-1 relative rounded-xl overflow-hidden border transition-colors cursor-${isDragging ? 'grabbing' : 'grab'} ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
      >
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-10 pointer-events-none text-[8px] font-black uppercase tracking-[0.3em]">
          <div className="border-r border-b border-slate-700/40 flex items-start justify-start p-4 text-blue-500">Logisch / Wissenschaftlich</div>
          <div className="border-b border-slate-700/40 flex items-start justify-end p-4 text-purple-500">Funktional / Sozial</div>
          <div className="border-r border-slate-700/40 flex items-end justify-start p-4 text-green-500">Evolutionär / Ancestral</div>
          <div className="flex items-end justify-end p-4 text-pink-500">Poetisch / Emotional</div>
        </div>

        <div className="absolute inset-0 transition-transform duration-75 ease-out" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center' }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }} viewBox={`${-containerRef.current?.clientWidth / 2 || -500} ${-containerRef.current?.clientHeight / 2 || -500} ${containerRef.current?.clientWidth || 1000} ${containerRef.current?.clientHeight || 1000}`}>
            {hoveredIndex !== null && processedVectors.map((target, idx) => {
              if (idx === hoveredIndex) return null;
              const source = processedVectors[hoveredIndex];
              const dist = Math.sqrt(Math.pow(source.displayX - target.displayX, 2) + Math.pow(source.displayY - target.displayY, 2));
              if (dist > 400) return null;
              return <line key={idx} x1={source.displayX} y1={source.displayY} x2={target.displayX} y2={target.displayY} stroke={theme === 'dark' ? '#3b82f6' : '#2563eb'} strokeWidth={Math.max(0.5, (400 - dist) / 100)} opacity={(400 - dist) / 600} />;
            })}
          </svg>

          {processedVectors.map((vec, i) => {
            const token = getTokenData(vec.token_index);
            return (
              <div
                key={i}
                className="absolute token-point group z-20 cursor-pointer"
                style={{ left: `calc(50% + ${vec.displayX}px)`, top: `calc(50% + ${vec.displayY}px)`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => {
                  setHoveredIndex(i);
                  setHoveredItem({
                    title: `Vektor: ${token.text}`,
                    data: { "ID": vec.token_index, "X": vec.displayX.toFixed(2), "Y": vec.displayY.toFixed(2) }
                  });
                }}
                onMouseLeave={() => {
                  setHoveredIndex(null);
                  setHoveredItem(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip({ token, x: vec.displayX, y: vec.displayY });
                }}
              >
                <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border-2 ${hoveredIndex === i || activeTooltip?.token.id === token.id ? 'scale-150 bg-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'bg-blue-600 border-transparent'}`} />
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 px-2 py-0.5 rounded text-[11px] text-blue-300 font-bold border border-slate-700 whitespace-nowrap pointer-events-none" style={{ transform: `translateX(-50%) scale(${1 / transform.scale})` }}>{token.text}</div>
              </div>
            );
          })}

          {/* DER NEUE KLICK-TOOLTIP (innerhalb des Transform-Layers) */}
          {activeTooltip && (
            <div 
              className="absolute z-[100] w-64 p-4 rounded-2xl border shadow-2xl animate-in zoom-in-95 duration-200 bg-slate-900 border-blue-500 text-white"
              style={{ 
                left: `calc(50% + ${activeTooltip.x}px)`, 
                top: `calc(50% + ${activeTooltip.y}px)`, 
                transform: `translate(-50%, calc(-100% - 40px)) scale(${1 / transform.scale})`,
                transformOrigin: 'bottom'
              }}
            >
              <div className="flex justify-between items-start mb-2 border-b border-blue-500/30 pb-2">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Semantik-Analyse</span>
                <button onClick={() => setActiveTooltip(null)} className="text-lg leading-none opacity-50 hover:opacity-100">&times;</button>
              </div>
              <p className="text-[12px] leading-relaxed italic text-slate-200">
                {activeTooltip.token.explanation}
              </p>
              {/* Kleiner Pfeil nach unten */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-blue-500 rotate-45"></div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] uppercase font-black text-blue-500">Semantic Noise</label>
            <span className="text-[10px] text-slate-500">{noise.toFixed(2)}</span>
          </div>
          <input type="range" min="0" max="5" step="0.1" value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} className="w-full accent-blue-500" />
        </div>
        <div className={`p-3 rounded-lg border ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] uppercase font-black text-purple-500">Position Weight</label>
            <span className="text-[10px] text-slate-500">{(positionWeight * 100).toFixed(0)}%</span>
          </div>
          <input type="range" min="0" max="1" step="0.01" value={positionWeight} onChange={(e) => setPositionWeight(parseFloat(e.target.value))} className="w-full accent-purple-500" />
        </div>
      </div>
    </div>
  );
};

export default Phase1_Embedding;