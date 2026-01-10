import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useScenarios } from '../../context/ScenarioContext';

const Phase2_Attention = ({ simulator, setHoveredItem }) => {
  const { activeScenario } = useScenarios();
  const { activeProfileId, setActiveProfileId } = simulator;
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  if (!activeScenario) return null;

  const tokens = activeScenario.phase_0_tokenization.tokens;
  const profiles = activeScenario.phase_2_attention.attention_profiles;

  // --- DYNAMISCHE LAYOUT-PARAMETER ---
  const size = 400; // Basis-Größe für das Koordinatensystem (viewBox)
  const center = size / 2;
  const radius = 150; // Abstand der Token vom Zentrum

  const currentProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  const sourceTokenId = useMemo(() => {
    if (selectedTokenId) return selectedTokenId;
    if (currentProfile?.rules?.length > 0) return currentProfile.rules[0].source;
    return tokens[tokens.length - 2]?.id || tokens[0]?.id;
  }, [selectedTokenId, currentProfile, tokens]);

  const sourceToken = tokens.find(t => Number(t.id) === Number(sourceTokenId));

  const activeRules = useMemo(() => {
    if (!currentProfile?.rules) return [];
    return currentProfile.rules.filter(r => Number(r.source) === Number(sourceTokenId));
  }, [currentProfile, sourceTokenId]);

  const updateInspector = useCallback((tokenId) => {
    if (!tokenId) { setHoveredItem(null); return; }
    const token = tokens.find(t => Number(t.id) === Number(tokenId));
    const rule = activeRules.find(r => Number(r.target) === Number(tokenId));
    const strength = rule ? rule.strength : 0.05;

    setHoveredItem({
      title: `Attention Analysis`,
      subtitle: "Kausale Relevanz",
      data: {
        "Fokus-Token": `"${sourceToken?.text}"`,
        "Ziel-Token": `"${token?.text}"`,
        "Gewichtung": (strength * 100).toFixed(1) + "%",
        "Bedeutung": rule?.explanation || "Geringe kontextuelle Kopplung."
      }
    });
  }, [tokens, activeRules, setHoveredItem, sourceToken]);

  useEffect(() => {
    if (selectedTokenId) updateInspector(selectedTokenId);
  }, [activeProfileId, selectedTokenId, updateInspector]);

  const isEmotional = activeProfileId?.includes('emotional') || activeProfileId?.includes('poetic') || activeProfileId?.includes('ancestral');
  const themeColor = isEmotional ? '#a855f7' : '#3b82f6';

  return (
    <div className="flex flex-col h-full w-full p-4 lg:p-6 select-none" onClick={() => { setSelectedTokenId(null); setHoveredItem(null); }}>
      
      {/* Header Bereich - Kompakter für mehr Platz unten */}
      <div className="mb-4 shrink-0">
        <h2 className="text-slate-500 text-center uppercase tracking-[0.3em] text-[9px] mb-3 font-black">
          Phase 2: Self-Attention Mechanism
        </h2>
        <div className="flex justify-center items-center gap-2">
            <div className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase transition-colors duration-500 ${isEmotional ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' : 'border-blue-500/50 text-blue-400 bg-blue-500/10'}`}>
              Mode: {currentProfile?.label}
            </div>
            <div className="text-[9px] font-mono font-bold px-3 py-1 rounded-full border border-white/10 text-slate-400 bg-white/5">
              {activeRules.length} Relationen
            </div>
        </div>
      </div>

      {/* VISUALISIERUNGS-BEREICH */}
      <div className="flex-1 relative min-h-0 flex items-center justify-center">
        {/* Der Wrapper skaliert mit dem verfügbaren Platz, bleibt aber quadratisch */}
        <div className="relative w-full h-full max-w-[500px] max-h-[500px] aspect-square">
          
          {/* SVG EBENE */}
          <svg 
            viewBox={`0 0 ${size} ${size}`} 
            className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {tokens.map((token, i) => {
              if (Number(token.id) === Number(sourceTokenId)) return null;

              const angle = (i / tokens.length) * 2 * Math.PI - Math.PI / 2;
              const rule = activeRules.find(r => Number(r.target) === Number(token.id));
              const strength = rule ? rule.strength : 0;
              const isActive = strength > 0.01;
              
              const tx = center + Math.cos(angle) * radius;
              const ty = center + Math.sin(angle) * radius;

              return (
                <g key={`connection-${token.id}`}>
                  {/* Basis-Linie (Dezent) */}
                  <line 
                    x1={center} y1={center} x2={tx} y2={ty} 
                    stroke="currentColor" className="text-slate-800" 
                    strokeWidth="1" strokeDasharray="2 4" 
                  />
                  
                  {/* Aktive Attention-Verbindung */}
                  {isActive && (
                    <g className="animate-in fade-in duration-500">
                      <line 
                        x1={center} y1={center} x2={tx} y2={ty} 
                        stroke={themeColor} 
                        strokeWidth={2 + strength * 20} 
                        opacity={0.3 + strength * 0.7}
                        style={{ filter: 'url(#glow)' }}
                        className="transition-all duration-700"
                      />
                      {/* Animierter Energie-Fluss zum Zentrum (Key -> Query) */}
                      <circle r={2 + strength * 3} fill="white">
                        <animateMotion 
                          dur={`${2 - strength * 1.5}s`} 
                          repeatCount="indefinite" 
                          path={`M ${tx} ${ty} L ${center} ${center}`} 
                        />
                      </circle>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* TOKEN LAYER */}
          <div className="absolute inset-0 pointer-events-none">
            {tokens.map((token, i) => {
              const angle = (i / tokens.length) * 2 * Math.PI - Math.PI / 2;
              const x = 50 + (Math.cos(angle) * (radius / size * 100));
              const y = 50 + (Math.sin(angle) * (radius / size * 100));
              const isCenter = Number(token.id) === Number(sourceTokenId);
              const rule = activeRules.find(r => Number(r.target) === Number(token.id));
              const hasConnection = !!rule;

              return (
                <div 
                  key={token.id} 
                  className="absolute pointer-events-auto" 
                  style={{ 
                    left: `${x}%`, 
                    top: `${y}%`, 
                    transform: `translate(-50%, -50%) ${isCenter ? 'scale(0)' : 'scale(1)'}`,
                    opacity: isCenter ? 0 : 1,
                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  onMouseEnter={() => !isCenter && updateInspector(token.id)}
                  onMouseLeave={() => updateInspector(selectedTokenId)}
                  onClick={(e) => { e.stopPropagation(); setSelectedTokenId(token.id); }}
                >
                  <div className={`
                    px-3 py-1.5 rounded-xl border-2 transition-all duration-300 font-mono text-[10px] font-black whitespace-nowrap
                    ${hasConnection 
                      ? 'bg-slate-900 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-110' 
                      : 'bg-slate-950/80 border-slate-800 text-slate-600 hover:border-slate-700'}
                    ${selectedTokenId === token.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950' : ''}
                  `}>
                    {token.text}
                  </div>
                </div>
              );
            })}

            {/* QUERY CENTER NODE */}
            <div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
            >
              <div className="relative flex flex-col items-center justify-center bg-slate-900 w-28 h-28 lg:w-32 lg:h-32 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden">
                <div 
                  className="absolute inset-0 opacity-20 animate-pulse transition-colors duration-1000" 
                  style={{ backgroundColor: themeColor }}
                ></div>
                <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest mb-1 relative z-10">Focus</span>
                <span className="text-white font-black text-xs lg:text-sm uppercase tracking-tighter px-4 text-center truncate w-full relative z-10">
                  {sourceToken?.text}
                </span>
                {/* Dekorative Scan-Linie */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent animate-scan"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROFIL UMSCHALTER - Kompakter am unteren Rand */}
      <div className="mt-6 shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2">
        {profiles.map(p => (
          <button
            key={p.id}
            onClick={() => { setSelectedTokenId(null); setActiveProfileId(p.id); }}
            className={`py-3 px-2 rounded-2xl border-2 transition-all duration-500 text-center ${
              activeProfileId === p.id 
                ? (isEmotional ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-blue-600 border-blue-400 text-white shadow-lg') 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="text-[8px] font-black uppercase tracking-widest">{p.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Phase2_Attention;