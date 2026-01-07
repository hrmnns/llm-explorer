import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useScenarios } from '../../context/ScenarioContext';

const Phase1_Embedding = ({ simulator }) => {
  const { activeScenario } = useScenarios();
  const { noise, setNoise, positionWeight, setPositionWeight, processedVectors } = simulator;

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const getTokenData = (index) => {
    return activeScenario?.phase_0_tokenization?.tokens.find(t => t.id === index + 1) || { text: '?', explanation: '' };
  };

  const handleAutoFit = useCallback(() => {
    if (!processedVectors || processedVectors.length === 0 || !containerRef.current) return;
    const margin = 80; 
    const coordsX = processedVectors.map(v => v.displayX);
    const coordsY = processedVectors.map(v => v.displayY);
    const minX = Math.min(...coordsX) - margin;
    const maxX = Math.max(...coordsX) + margin;
    const minY = Math.min(...coordsY) - margin;
    const maxY = Math.max(...coordsY) + margin;
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const newScale = Math.min(containerWidth / contentWidth, containerHeight / contentHeight, 1.5);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setTransform({ x: -centerX * newScale, y: -centerY * newScale, scale: newScale });
  }, [processedVectors]);

  useEffect(() => { handleAutoFit(); }, [activeScenario?.id]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.token-point')) return; // Tooltips klickbar lassen
    setIsDragging(true);
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
      scale: Math.max(0.1, Math.min(prev.scale + scaleAmount, 5))
    }));
  };

  return (
    <div className="flex flex-col h-full p-6 text-white font-mono select-none">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-blue-400">Phase 1: High-Dimensional Embedding</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Interaktiver Vektorraum-Explorer</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleAutoFit} className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 rounded hover:bg-blue-600/40 text-[10px] uppercase font-bold text-blue-400">Auto-Fit</button>
           <button onClick={() => setTransform(p => ({...p, scale: p.scale * 1.2}))} className="w-8 h-7 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-xs">+</button>
           <button onClick={() => setTransform(p => ({...p, scale: p.scale / 1.2}))} className="w-8 h-7 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 text-xs">-</button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className={`flex-1 relative bg-slate-950/50 border border-slate-800 rounded-xl overflow-hidden cursor-${isDragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Achsenbeschriftung (FIXIERT am Rand) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] text-slate-600 uppercase tracking-widest z-10 pointer-events-none">Syntaktische Rolle</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 uppercase tracking-widest rotate-90 z-10 pointer-events-none">Semantische Nähe</div>

        {/* Transform-Layer */}
        <div 
          className="absolute inset-0 transition-transform duration-500 ease-out"
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transformOrigin: 'center' }}
        >
          {/* Koordinaten-Gitter (pointer-events-none ist entscheidend!) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-[10000px] h-px bg-blue-500"></div>
            <div className="h-[10000px] w-px bg-blue-500"></div>
          </div>

          {processedVectors.map((vec, i) => {
            const token = getTokenData(vec.token_index);
            return (
              <div
                key={i}
                className="absolute token-point group z-20"
                style={{ 
                  left: `calc(50% + ${vec.displayX}px)`, 
                  top: `calc(50% + ${vec.displayY}px)`, 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                {/* Der Punkt */}
                <div className="w-3.5 h-3.5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] group-hover:scale-150 transition-all cursor-help border border-white/20" />
                
                {/* Token-Text */}
                <div 
                  className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900/90 px-2 py-0.5 rounded text-[11px] text-blue-300 font-bold border border-slate-700 whitespace-nowrap shadow-xl"
                  style={{ transform: `translateX(-50%) scale(${1 / transform.scale})` }}
                >
                  {token.text}
                </div>

                {/* Didaktischer Tooltip (erscheint bei Hover) */}
                <div 
                  className="absolute z-50 bottom-10 left-1/2 -translate-x-1/2 w-56 p-3 bg-slate-900 border border-blue-500 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200"
                  style={{ transform: `translateX(-50%) scale(${1 / transform.scale})`, transformOrigin: 'bottom' }}
                >
                  <p className="text-blue-400 text-[10px] font-bold uppercase mb-1 border-b border-blue-900/50 pb-1 italic">Vektor-Analyse</p>
                  <p className="text-slate-200 text-[11px] leading-snug mb-2">{token.explanation}</p>
                  <div className="flex justify-between text-[8px] text-slate-500 font-bold">
                    <span>X: {vec.displayX.toFixed(1)}</span>
                    <span>Y: {vec.displayY.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Help Overlay */}
        <div className="absolute bottom-2 left-4 text-[8px] text-slate-600 uppercase pointer-events-none">
          Drag to Pan | Scroll to Zoom
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <label className="text-[10px] uppercase text-blue-400 font-bold block mb-1">Semantic Noise: {noise.toFixed(2)}</label>
          <input type="range" min="0" max="5" step="0.1" value={noise} onChange={(e) => setNoise(parseFloat(e.target.value))} className="w-full accent-blue-500" />
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
          <label className="text-[10px] uppercase text-purple-400 font-bold block mb-1">Positional Weight: {(positionWeight * 100).toFixed(0)}%</label>
          <input type="range" min="0" max="1" step="0.01" value={positionWeight} onChange={(e) => setPositionWeight(parseFloat(e.target.value))} className="w-full accent-purple-500" />
        </div>
      </div>
    </div>
  );
};

export default Phase1_Embedding;