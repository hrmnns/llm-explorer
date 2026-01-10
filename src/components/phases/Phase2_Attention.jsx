import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PhaseLayout from './../PhaseLayout';
import { useScenarios } from '../../context/ScenarioContext';

const Phase2_Attention = ({ simulator, setHoveredItem, theme }) => {
  const { activeScenario } = useScenarios();
  const { activeProfileId, setActiveProfileId } = simulator;
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  if (!activeScenario) return null;

  const tokens = activeScenario?.phase_0_tokenization?.tokens || [];
  const profiles = activeScenario?.phase_2_attention?.attention_profiles || [];

  const size = 400; 
  const center = size / 2;
  const radius = 145; 

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

  const totalProfileRelations = currentProfile?.rules?.length || 0;

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
    <PhaseLayout
      title="Phase 2: Self-Attention Mechanism"
      subtitle="Kontextuelle Kopplung der Tokens"
      theme={theme}
      badges={[
        { 
          text: `Profil: ${currentProfile?.label}`, 
          className: isEmotional ? "border-purple-500/30 text-purple-400 bg-purple-500/10" : "border-blue-500/30 text-blue-400 bg-blue-500/10" 
        },
        { 
          text: `Aktiv: ${activeRules.length}`, 
          className: "border-blue-500/30 text-blue-400 bg-blue-500/10" 
        },
        { 
          text: `Total: ${totalProfileRelations}`, 
          className: "border-slate-500/30 text-slate-500 bg-white/5" 
        }
      ]}
      visualization={
        <div 
          className="relative w-full h-[400px] lg:h-full flex items-center justify-center overflow-visible"
          onClick={() => { setSelectedTokenId(null); setHoveredItem(null); }}
        >
          <div className="relative w-full h-full max-w-[480px] aspect-square">
            <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {tokens.map((token, i) => {
                if (Number(token.id) === Number(sourceTokenId)) return null;
                const angle = (i / tokens.length) * 2 * Math.PI - Math.PI / 2;
                const rule = activeRules.find(r => Number(r.target) === Number(token.id));
                const strength = rule ? rule.strength : 0;
                const tx = center + Math.cos(angle) * radius;
                const ty = center + Math.sin(angle) * radius;

                return (
                  <g key={`att-${token.id}`}>
                    <line x1={center} y1={center} x2={tx} y2={ty} stroke="currentColor" className="text-slate-800/40" strokeWidth="1" strokeDasharray="2 4" />
                    {strength > 0.01 && (
                      <g className="animate-in fade-in duration-700">
                        <line 
                          x1={center} y1={center} x2={tx} y2={ty} 
                          stroke={themeColor} 
                          strokeWidth={1.5 + strength * 18} 
                          opacity={0.2 + strength * 0.8}
                          style={{ filter: 'url(#glow)' }}
                          className="transition-all duration-700"
                        />
                        <circle r={1.5 + strength * 2.5} fill="white">
                          <animateMotion dur={`${2 - strength * 1.5}s`} repeatCount="indefinite" path={`M ${tx} ${ty} L ${center} ${center}`} />
                        </circle>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 pointer-events-none">
              {tokens.map((token, i) => {
                const angle = (i / tokens.length) * 2 * Math.PI - Math.PI / 2;
                const x = 50 + (Math.cos(angle) * (radius / size * 100));
                const y = 50 + (Math.sin(angle) * (radius / size * 100));
                const isCenter = Number(token.id) === Number(sourceTokenId);
                const hasConnection = activeRules.some(r => Number(r.target) === Number(token.id));

                return (
                  <div 
                    key={token.id} 
                    className="absolute pointer-events-auto" 
                    style={{ 
                      left: `${x}%`, top: `${y}%`, 
                      transform: `translate(-50%, -50%) scale(${isCenter ? 0 : 1})`,
                      opacity: isCenter ? 0 : 1,
                      transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                    onMouseEnter={() => !isCenter && updateInspector(token.id)}
                    onMouseLeave={() => updateInspector(selectedTokenId)}
                    onClick={(e) => { e.stopPropagation(); setSelectedTokenId(token.id); }}
                  >
                    <div className={`px-2.5 py-1 rounded-lg border-2 transition-all duration-300 font-mono text-[9px] font-bold whitespace-nowrap
                      ${hasConnection ? 'bg-slate-900 border-white text-white shadow-lg scale-110' : 'bg-slate-950/80 border-slate-800 text-slate-600'}
                      ${selectedTokenId === token.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-950' : ''}`}>
                      {token.text}
                    </div>
                  </div>
                );
              })}

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <div className="relative flex flex-col items-center justify-center bg-slate-900 w-24 h-24 lg:w-28 lg:h-28 rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 opacity-10 animate-pulse transition-colors duration-1000" style={{ backgroundColor: themeColor }}></div>
                  <span className="text-[6px] text-slate-500 uppercase font-black tracking-widest mb-1 relative z-10">Query</span>
                  <span className="text-white font-black text-[10px] lg:text-xs uppercase tracking-tighter px-3 text-center truncate w-full relative z-10">
                    {sourceToken?.text}
                  </span>
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent animate-scan"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      controls={
        profiles.map(p => (
          <button
            key={p.id}
            onClick={() => { setSelectedTokenId(null); setActiveProfileId(p.id); }}
            className={`py-2 px-2 rounded-lg border-2 transition-all duration-500 text-center ${
              activeProfileId === p.id 
                ? (isEmotional ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-blue-600 border-blue-400 text-white shadow-lg') 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="text-[8px] font-black uppercase tracking-widest">{p.label}</div>
          </button>
        ))
      }
    />
  );
};

export default Phase2_Attention;