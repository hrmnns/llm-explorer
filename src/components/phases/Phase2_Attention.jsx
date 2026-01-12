import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PhaseLayout from './../PhaseLayout';
import { useScenarios } from '../../context/ScenarioContext';

const Phase2_Attention = ({ simulator, setHoveredItem, theme }) => {
  const { activeScenario } = useScenarios();
  const { activeProfileId, setActiveProfileId } = simulator;
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [hoveredTokenId, setHoveredTokenId] = useState(null);
  const [activeHead, setActiveHead] = useState(1);
  const [zoom, setZoom] = useState(1);

  if (!activeScenario) return null;

  const tokens = activeScenario?.phase_0_tokenization?.tokens || [];
  const profiles = activeScenario?.phase_2_attention?.attention_profiles || [];

  const V_SIZE = 400; 
  const V_CENTER = 200;
  const V_BASE_RADIUS = 120; 
  const V_DYNAMIC_RADIUS = V_BASE_RADIUS * zoom;

  const handleZoomIn = (e) => { e.stopPropagation(); setZoom(prev => Math.min(prev + 0.2, 3)); };
  const handleZoomOut = (e) => { e.stopPropagation(); setZoom(prev => Math.max(prev - 0.2, 0.4)); };

  const currentProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  const sourceTokenId = useMemo(() => {
    if (selectedTokenId) return selectedTokenId;
    if (currentProfile?.rules?.length > 0) return currentProfile.rules[0].source;
    return tokens[tokens.length - 2]?.id || tokens[0]?.id;
  }, [selectedTokenId, currentProfile, tokens]);

  const sourceToken = tokens.find(t => Number(t.id) === Number(sourceTokenId));

  const headDefinitions = {
    1: { label: "Semantik", desc: "Lexikalische Nähe" },
    2: { label: "Syntax", desc: "Grammatik & Lage" },
    3: { label: "Logik", desc: "Handlung & Ziel" },
    4: { label: "Struktur", desc: "Referenz & Artikel" }
  };

  const activeRules = useMemo(() => {
    if (!currentProfile?.rules) return [];
    return currentProfile.rules.filter(r => {
      return Number(r.source) === Number(sourceTokenId) && Number(r.head) === Number(activeHead);
    });
  }, [currentProfile, sourceTokenId, activeHead]);

  const getPos = useCallback((index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * V_DYNAMIC_RADIUS;
    const y = Math.sin(angle) * V_DYNAMIC_RADIUS;
    return { x, y, xPct: ((V_CENTER + x) / V_SIZE) * 100, yPct: ((V_CENTER + y) / V_SIZE) * 100 };
  }, [V_DYNAMIC_RADIUS]);

  const headStats = useMemo(() => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0 };
    currentProfile?.rules?.forEach(r => { stats[r.head] = (stats[r.head] || 0) + 1; });
    return stats;
  }, [currentProfile]);

  const tokensWithActivityInHead = useMemo(() => {
    const activeIds = new Set();
    currentProfile?.rules?.forEach(r => {
      if (Number(r.head) === Number(activeHead)) {
        activeIds.add(Number(r.source));
        activeIds.add(Number(r.target));
      }
    });
    return activeIds;
  }, [currentProfile, activeHead]);

  const updateInspector = useCallback(() => {
    let rule = null;
    let targetId = null;

    if (hoveredTokenId) {
      rule = activeRules.find(r => Number(r.target) === Number(hoveredTokenId));
      targetId = hoveredTokenId;
    } 
    
    if (!rule && activeRules.length > 0) {
      const sorted = [...activeRules].sort((a, b) => b.strength - a.strength);
      rule = sorted[0];
      targetId = rule.target;
    }

    const targetToken = tokens.find(t => Number(t.id) === Number(targetId));
    
    // FIX: Fallback auf 0, damit toFixed() nicht auf undefined aufgerufen wird
    const strength = (rule && typeof rule.strength === 'number') ? rule.strength : 0;
    const isLive = !!hoveredTokenId;

    setHoveredItem({
      title: isLive ? `🔍 ${headDefinitions[activeHead].label}-Analyse` : `🔒 Fokus: ${headDefinitions[activeHead].label}`,
      subtitle: isLive ? "Live Probing" : (rule ? "Dominante Verbindung" : "Keine Aktivität"),
      data: {
        "--- Mechanik": "---",
        "QUERY": sourceToken ? `"${sourceToken.text}" (${sourceToken.id})` : "N/A",
        "KEY": targetToken ? `"${targetToken.text}" (${targetToken.id})` : (isLive ? "Kein Fokus" : "Standby / Inaktiv"),
        "--- Mathematik": "---",
        "Attention Score": (strength * 100).toFixed(1) + "%",
        "Raw Weight": strength.toFixed(4),
        "--- Erkenntnis": "---",
        "Information": rule ? rule.explanation : "Dieser Head liefert für dieses Wort aktuell keine Kontext-Informationen."
      }
    });
  }, [tokens, activeRules, setHoveredItem, sourceToken, activeHead, hoveredTokenId]);

  useEffect(() => {
    updateInspector();
  }, [updateInspector]);

  const isEmotional = activeProfileId?.includes('emotional') || activeProfileId?.includes('poetic');
  const themeColor = isEmotional ? '#a855f7' : '#3b82f6';

  return (
    <PhaseLayout
      title="Phase 2: Self-Attention"
      subtitle="Multi-Head Interaktions-Analyse"
      theme={theme}
      badges={[
        { text: headDefinitions[activeHead].label, className: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
        { text: `Aktiv: ${activeRules.length}`, className: "border-slate-500/30 text-slate-400 bg-white/5" }
      ]}
      visualization={
        <div className="relative w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden bg-slate-950/20 rounded-2xl p-4" 
             onClick={() => { setSelectedTokenId(null); setHoveredTokenId(null); }}>
          
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
            <button onClick={handleZoomIn} className="w-9 h-9 rounded-xl bg-slate-900 border border-white/20 text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl">+</button>
            <button onClick={handleZoomOut} className="w-9 h-9 rounded-xl bg-slate-900 border border-white/20 text-white flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl">-</button>
            <button onClick={(e) => { e.stopPropagation(); setZoom(1); }} className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 text-[7px] text-white flex items-center justify-center hover:bg-slate-800 transition-all font-bold uppercase tracking-tighter">Reset</button>
          </div>

          <div className="relative w-full max-w-[450px] aspect-square transition-all duration-500 ease-out flex items-center justify-center">
            <svg viewBox={`0 0 ${V_SIZE} ${V_SIZE}`} className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
              <defs>
                <filter id="glowAtt"><feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              {tokens.map((token, i) => {
                if (Number(token.id) === Number(sourceTokenId)) return null;
                const { x, y } = getPos(i, tokens.length);
                const rule = activeRules.find(r => Number(r.target) === Number(token.id));
                const strength = rule ? rule.strength : 0;
                
                return (
                  <g key={`l-${token.id}`}>
                    <line x1={V_CENTER} y1={V_CENTER} x2={V_CENTER + x} y2={V_CENTER + y} stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2 4" />
                    {strength > 0.01 && (
                      <>
                        <line x1={V_CENTER} y1={V_CENTER} x2={V_CENTER + x} y2={V_CENTER + y} stroke={themeColor} strokeWidth={1 + strength * 6} opacity={0.2 + strength * 0.6} style={{ filter: 'url(#glowAtt)' }} className="transition-all duration-500" />
                        <circle r={1.5 + strength * 1.5} fill="white">
                          <animateMotion dur={`${2.5 - strength * 2}s`} repeatCount="indefinite" path={`M ${V_CENTER + x} ${V_CENTER + y} L ${V_CENTER} ${V_CENTER}`} />
                        </circle>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
              {tokens.map((token, i) => {
                const isCenter = Number(token.id) === Number(sourceTokenId);
                const { xPct, yPct } = isCenter ? { xPct: 50, yPct: 50 } : getPos(i, tokens.length);
                const rule = activeRules.find(r => Number(r.target) === Number(token.id));
                const strength = rule ? rule.strength : 0;
                const hasActivity = tokensWithActivityInHead.has(Number(token.id));

                let tokenClasses = "px-2 py-0.5 rounded border-2 font-mono text-[9px] font-bold transition-all cursor-pointer shadow-lg ";
                let tokenStyle = {};

                if (isCenter) {
                    tokenStyle = { borderColor: themeColor, backgroundColor: '#0f172a', color: 'white' };
                } else if (strength > 0.1) {
                  tokenClasses += 'bg-slate-900 border-white text-white scale-110 shadow-lg z-30';
                } else if (hasActivity) {
                  tokenClasses += 'bg-slate-950/80 text-slate-300';
                  tokenStyle = { borderColor: `${themeColor}60`, boxShadow: `0 0 12px ${themeColor}30` };
                } else {
                  tokenClasses += 'bg-slate-950/90 border-slate-800 text-slate-600 hover:border-slate-500 opacity-40';
                }

                return (
                  <div key={`tp-${token.id}`} className="absolute pointer-events-auto transition-all duration-500 ease-out"
                    style={{ left: `${xPct}%`, top: `${yPct}%`, transform: `translate(-50%, -50%)`, zIndex: isCenter ? 40 : 20 }}>
                    {isCenter ? (
                      <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black uppercase tracking-widest mb-1" style={{ color: themeColor }}>Query</span>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center bg-slate-900 shadow-2xl" 
                          style={{ borderColor: themeColor }}>
                          <span className="text-white font-black text-[9px] sm:text-[10px] uppercase px-2 text-center leading-tight">{token.text}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group flex flex-col items-center">
                        <div onMouseEnter={() => setHoveredTokenId(token.id)}
                          onMouseLeave={() => setHoveredTokenId(null)}
                          onClick={(e) => { e.stopPropagation(); setSelectedTokenId(token.id); }}
                          className={tokenClasses}
                          style={tokenStyle}
                        >
                          {token.text}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
      controls={[
        <div key="heads-ctrl" className="flex flex-col gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest text-blue-500/80">Multi-Head Specialization</span>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(h => (
              <button key={h} onClick={() => { setActiveHead(h); setHoveredTokenId(null); }} className={`relative h-12 rounded-xl flex flex-col items-center justify-center border transition-all duration-300 ${activeHead === h ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                <span className="text-[9px] font-black uppercase">{headDefinitions[h].label}</span>
                <span className="text-[7px] opacity-60">Head #{h}</span>
                {headStats[h] > 0 && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-lg ${activeHead === h ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                    {headStats[h]}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>,
        <div key="profiles-ctrl" className="flex flex-col gap-2 md:border-l md:border-white/10 md:pl-6">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Inferenz-Profil</span>
          <div className="grid grid-cols-2 gap-2">
            {profiles.map(p => (
              <button key={p.id} onClick={() => { setSelectedTokenId(null); setActiveProfileId(p.id); setHoveredTokenId(null); }} className={`h-10 px-4 rounded-xl border text-[9px] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-3 ${activeProfileId === p.id ? 'bg-white/10 border-white/40 text-white shadow-inner' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${activeProfileId === p.id ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`} />
                <span className="truncate">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      ]}
    />
  );
};

export default Phase2_Attention;