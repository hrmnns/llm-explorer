import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PhaseLayout from './../PhaseLayout';
import { useScenarios } from '../../context/ScenarioContext';

// Robuster Vergleich
const idsMatch = (a, b) => {
  if (a === null || b === null || a === undefined || b === undefined) return false;
  return String(a).trim() === String(b).trim();
};

const generateKey = (profileId, sourceId, headId) =>
  `${String(profileId)}_s${String(sourceId)}_h${String(headId)}`;

const Phase2_Attention = ({ simulator, setHoveredItem, theme }) => {
  const { activeScenario } = useScenarios();

  // Defensive Daten-Ladung
  const activeProfileId = simulator?.activeProfileId || 'default';

  // WICHTIG: Prüfen, ob activeAttention auch zum aktuellen Szenario passt
  const activeAttention = simulator?.activeAttention || { rules: [], avgSignal: 1.0 };
  const pipelineSignal = activeAttention?.avgSignal || 1.0;

  const SESSION_STORAGE_KEY = activeScenario ? `sim_overrides_${activeScenario.id}` : 'sim_overrides_temp';
  const PERSIST_HEAD_KEY = activeScenario ? `sim_lastHead_${activeScenario.id}` : null;
  const PERSIST_TOKEN_KEY = activeScenario ? `sim_lastToken_${activeScenario.id}` : null;

  // PERSISTENZ FÜR TOKEN UND HEAD
  const [selectedTokenId, setSelectedTokenId] = useState(() => {
    try {
      return PERSIST_TOKEN_KEY ? sessionStorage.getItem(PERSIST_TOKEN_KEY) : null;
    } catch (e) { return null; }
  });

  const [activeHead, setActiveHead] = useState(() => {
    try {
      const saved = PERSIST_HEAD_KEY ? sessionStorage.getItem(PERSIST_HEAD_KEY) : null;
      return saved ? parseInt(saved) : 1;
    } catch (e) { return 1; }
  });

  const [hoveredTokenId, setHoveredTokenId] = useState(null);
  const [zoom, setZoom] = useState(1);

  const [headOverrides, setHeadOverrides] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const tokens = activeScenario?.phase_0_tokenization?.tokens || [];
  const profiles = activeScenario?.phase_2_attention?.attention_profiles || [];

  // Kennzeichnung ob Token im aktuellen Profil interaktiv ist
  const interactiveTokenIds = useMemo(() => {
    const currentProfile = profiles.find(p => p.id === activeProfileId);
    if (!currentProfile) return new Set();
    return new Set(currentProfile.rules.map(r => String(r.source).trim()));
  }, [profiles, activeProfileId]);

  // RESET LOGIK
  const handleReset = (e) => {
    e.stopPropagation();
    if (window.confirm("Möchtest du alle manuellen Justierungen für dieses Szenario zurücksetzen?")) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(PERSIST_HEAD_KEY);
      sessionStorage.removeItem(PERSIST_TOKEN_KEY);
      setHeadOverrides({});
      setActiveHead(1);
      setSelectedTokenId(null);
      // Optional: Simulator über Reset informieren, falls Methode existiert
      if (simulator?.resetAttention) simulator.resetAttention();
    }
  };

  // AUTO-PROFIL-KORREKTUR
  useEffect(() => {
    if (profiles.length > 0) {
      const currentProfileExists = profiles.some(p => p.id === activeProfileId);
      if (!currentProfileExists && simulator?.setActiveProfileId) {
        simulator.setActiveProfileId(profiles[0].id);
      }
    }
  }, [activeProfileId, profiles, simulator]);

  const V_SIZE = 400;
  const V_CENTER = 200;
  const V_BASE_RADIUS = 120;
  const V_DYNAMIC_RADIUS = V_BASE_RADIUS * zoom;

  const handleZoomIn = (e) => { e.stopPropagation(); setZoom(prev => Math.min(prev + 0.2, 3)); };
  const handleZoomOut = (e) => { e.stopPropagation(); setZoom(prev => Math.max(prev - 0.2, 0.4)); };

  const sourceTokenId = useMemo(() => {
    if (selectedTokenId !== null) return selectedTokenId;
    if (activeAttention?.rules?.length > 0) return activeAttention.rules[0].source;
    return tokens[tokens.length - 2]?.id || tokens[0]?.id;
  }, [selectedTokenId, activeAttention, tokens]);

  const sourceToken = tokens.find(t => idsMatch(t.id, sourceTokenId));

  const getConnectionInfo = useCallback((targetId, headId) => {
    const key = generateKey(activeProfileId, sourceTokenId, headId);
    let sliderVal = headOverrides[key];
    if (sliderVal === undefined) sliderVal = 0.7;

    let rule = activeAttention?.rules?.find(r =>
      idsMatch(r.source, sourceTokenId) && idsMatch(r.target, targetId) && idsMatch(r.head, headId)
    );

    if (!rule) {
      const currentProfileData = profiles.find(p => p.id === activeProfileId);
      rule = currentProfileData?.rules?.find(r =>
        idsMatch(r.source, sourceTokenId) && idsMatch(r.target, targetId) && idsMatch(r.head, headId)
      );
    }

    const baseStrength = rule ? parseFloat(rule.strength) : 0;
    const finalStrength = baseStrength * sliderVal;

    return { strength: finalStrength, hasRule: !!rule, explanation: rule ? rule.explanation : "Keine Verbindung" };
  }, [activeAttention, headOverrides, activeProfileId, sourceTokenId, profiles]);

  const handleSliderChange = (headId, val) => {
    const newVal = parseFloat(val);
    const key = generateKey(activeProfileId, sourceTokenId, headId);
    setHeadOverrides(prev => {
      const next = { ...prev, [key]: newVal };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    if (simulator && typeof simulator.updateAttentionRule === 'function') {
      simulator.updateAttentionRule(headId, newVal);
    }
  };

  const handleProfileSwitch = (pId) => {
    if (simulator?.setActiveProfileId) simulator.setActiveProfileId(pId);
    setHoveredTokenId(null);
  };

  const getHeadActiveCount = (hId) => {
    let count = 0;
    tokens.forEach(t => {
      const { strength } = getConnectionInfo(t.id, hId);
      if (strength > 0.05) count++;
    });
    return count;
  };

  const getPos = useCallback((index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * V_DYNAMIC_RADIUS;
    const y = Math.sin(angle) * V_DYNAMIC_RADIUS;
    return { x, y, xPct: ((V_CENTER + x) / V_SIZE) * 100, yPct: ((V_CENTER + y) / V_SIZE) * 100 };
  }, [V_DYNAMIC_RADIUS]);

  const headDefinitions = {
    1: { label: "Semantik", desc: "Bedeutung" },
    2: { label: "Syntax", desc: "Grammatik" },
    3: { label: "Logik", desc: "Kausalität" },
    4: { label: "Struktur", desc: "Position" }
  };

  useEffect(() => {
    const { strength, explanation } = getConnectionInfo(hoveredTokenId, activeHead);
    const targetToken = tokens.find(t => idsMatch(t.id, hoveredTokenId));

    setHoveredItem({
      title: hoveredTokenId ? `🔍 Detail-Analyse` : `🔒 Head ${activeHead}: ${headDefinitions[activeHead].label}`,
      subtitle: `Profil: ${profiles.find(p => p.id === activeProfileId)?.label || activeProfileId}`,
      data: {
        "Target": targetToken ? `"${targetToken.text}"` : "-",
        "Stärke": (strength * 100).toFixed(0) + "%",
        "Info": explanation
      }
    });
  }, [hoveredTokenId, activeHead, pipelineSignal, setHoveredItem, sourceToken, tokens, getConnectionInfo, activeProfileId, profiles]);

  const themeColor = pipelineSignal < 0.4 ? '#ef4444' : (pipelineSignal < 0.7 ? '#f97316' : '#3b82f6');
  const centerSelfInfo = getConnectionInfo(sourceTokenId, activeHead);
  const showCenterHalo = centerSelfInfo.strength > 0.1;

  if (!activeScenario) return null;

  return (
    <PhaseLayout
      title="Phase 2: Self-Attention Pipeline"
      subtitle="Justierung der Multi-Head Gewichtung"
      theme={theme}
      badges={[
        { text: headDefinitions[activeHead].label, className: "border-blue-500/30 text-blue-400 bg-blue-500/10" },
        { text: Object.keys(headOverrides).length > 0 ? "User Modus" : "Auto-Pilot", className: Object.keys(headOverrides).length > 0 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-blue-500/10 text-blue-400" }
      ]}
      visualization={
        <div className="relative w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden bg-slate-950/20 rounded-2xl p-4" onClick={() => {}}>
          
          {/* ZOOM & RESET CONTROLS */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
            <button onClick={handleZoomIn} className="w-9 h-9 rounded-xl bg-slate-900 border border-white/20 text-white flex items-center justify-center hover:bg-blue-600 shadow-xl transition-colors">+</button>
            <button onClick={handleZoomOut} className="w-9 h-9 rounded-xl bg-slate-900 border border-white/20 text-white flex items-center justify-center hover:bg-blue-600 shadow-xl transition-colors">-</button>
            <button onClick={handleReset} title="Alles zurücksetzen" className="w-9 h-9 rounded-xl bg-red-900/40 border border-red-500/40 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-all mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
              </svg>
            </button>
          </div>

          <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center">
            <svg viewBox={`0 0 ${V_SIZE} ${V_SIZE}`} className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
              <defs>
                <filter id="glowAtt"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>

              {showCenterHalo && (
                <g>
                  <circle cx={V_CENTER} cy={V_CENTER} r={60} fill="none" stroke={themeColor} strokeWidth={3 + (centerSelfInfo.strength * 10)} opacity={0.5} style={{ filter: `url(#glowAtt)` }} />
                  <text x={V_CENTER} y={V_CENTER + 85} fill={themeColor} fontSize="9" textAnchor="middle" opacity="0.9">Self: {(centerSelfInfo.strength * 100).toFixed(0)}%</text>
                </g>
              )}

              {tokens.map((token, i) => {
                if (idsMatch(token.id, sourceTokenId)) return null;
                const { strength, hasRule } = getConnectionInfo(token.id, activeHead);
                const { x, y } = getPos(i, tokens.length);
                const x2 = V_CENTER + x;
                const y2 = V_CENTER + y;
                if (!hasRule || strength <= 0.01) return null;
                const strokeW = 1.5 + (strength * 16.5); 
                const baseOpacity = 0.4 + (strength * 0.6);

                return (
                  <g key={`l-${token.id}`}>
                    <line x1={V_CENTER} y1={V_CENTER} x2={x2} y2={y2} stroke={themeColor} strokeWidth={strokeW} opacity={baseOpacity} strokeLinecap="round" className="transition-all duration-75" />
                    {strength > 0.1 && (
                      <line x1={V_CENTER} y1={V_CENTER} x2={x2} y2={y2} stroke={themeColor} strokeWidth={strokeW + 2} opacity={0.3} strokeLinecap="round" style={{ filter: 'blur(2px)' }} className="transition-all duration-75" />
                    )}
                    <g transform={`translate(${(V_CENTER + x2) * 0.5}, ${(V_CENTER + y2) * 0.5})`}>
                       <rect x="-11" y="-8" width="22" height="15" rx="4" fill="#0f172a" stroke={themeColor} strokeWidth="1" />
                       <text fill="white" fontSize="9" fontWeight="black" textAnchor="middle" dy="3.5" style={{ pointerEvents: 'none' }}>{(strength * 100).toFixed(0)}</text>
                    </g>
                    {strength > 0.2 && (
                      <circle r={2 + strength * 3} fill="white">
                        <animateMotion dur={`${5 - strength * 4}s`} repeatCount="indefinite" path={`M ${x2} ${y2} L ${V_CENTER} ${V_CENTER}`} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
              {tokens.map((token, i) => {
                const isCenter = idsMatch(token.id, sourceTokenId);
                const { xPct, yPct } = isCenter ? { xPct: 50, yPct: 50 } : getPos(i, tokens.length);
                const { strength } = getConnectionInfo(token.id, activeHead);
                const isActive = strength > 0.1;
                const isInteractive = interactiveTokenIds.has(String(token.id).trim());

                let tokenClasses = "px-2 py-0.5 rounded border-2 font-mono text-[9px] font-bold transition-all cursor-pointer shadow-lg ";
                let tokenStyle = {};

                if (isCenter) {
                  tokenStyle = { borderColor: themeColor, backgroundColor: '#0f172a', color: 'white', boxShadow: `0 0 20px ${themeColor}60` };
                } else if (isActive) {
                  tokenClasses += 'bg-slate-900 border-white text-white scale-110 z-30';
                } else {
                  tokenClasses += 'bg-slate-950/90 border-slate-800 text-slate-600 opacity-40';
                }

                return (
                  <div key={`tp-${token.id}`} className="absolute pointer-events-auto transition-all duration-500 ease-out"
                    style={{ left: `${xPct}%`, top: `${yPct}%`, transform: `translate(-50%, -50%)`, zIndex: isCenter ? 40 : 20 }}>
                    
                    {isInteractive && !isCenter && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6] z-50" />
                    )}

                    {isCenter ? (
                      <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black uppercase tracking-widest mb-1" style={{ color: themeColor }}>Query</span>
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex items-center justify-center bg-slate-900 shadow-2xl transition-all duration-500" style={{ borderColor: themeColor }}>
                          <span className="text-white font-black text-[9px] sm:text-[10px] uppercase px-2 text-center leading-tight">{token.text}</span>
                        </div>
                      </div>
                    ) : (
                      <div onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedTokenId(token.id); 
                        if(PERSIST_TOKEN_KEY) sessionStorage.setItem(PERSIST_TOKEN_KEY, token.id);
                      }}
                        onMouseEnter={() => setHoveredTokenId(token.id)}
                        onMouseLeave={() => setHoveredTokenId(null)}
                        className={tokenClasses} style={tokenStyle}>
                        {token.text}
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
            {[1, 2, 3, 4].map(h => {
              const key = generateKey(activeProfileId, sourceTokenId, h);
              let val = headOverrides[key];
              if (val === undefined) {
                let rules = activeAttention?.rules?.filter(r => idsMatch(r.head, h) && idsMatch(r.source, sourceTokenId));
                if (!rules || rules.length === 0) {
                  const currentProfileData = profiles.find(p => p.id === activeProfileId);
                  rules = currentProfileData?.rules?.filter(r => idsMatch(r.head, h) && idsMatch(r.source, sourceTokenId));
                }
                val = rules && rules.length > 0 ? 0.7 : 0;
              }
              const activeCount = getHeadActiveCount(h);
              return (
                <div key={h} onClick={() => { 
                  setActiveHead(h); 
                  setHoveredTokenId(null); 
                  if(PERSIST_HEAD_KEY) sessionStorage.setItem(PERSIST_HEAD_KEY, h.toString());
                }}
                  className={`relative p-2 rounded-xl flex flex-col gap-2 border transition-all duration-300 ${activeHead === h ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                  <div className="flex justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase">{headDefinitions[h].label}</span>
                      <span className="text-[7px] opacity-60">Head #{h}</span>
                    </div>
                    {activeCount > 0 && (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-lg ${activeHead === h ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}`}>
                        {activeCount}
                      </div>
                    )}
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={val} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}
                    onInput={(e) => { e.stopPropagation(); handleSliderChange(h, e.target.value); }}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-white ${activeHead === h ? 'bg-blue-400' : 'bg-slate-700'}`} />
                </div>
              );
            })}
          </div>
        </div>,
        <div key="profiles-ctrl" className="flex flex-col gap-2 md:border-l md:border-white/10 md:pl-6">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Inferenz-Profil</span>
          <div className="grid grid-cols-2 gap-2">
            {profiles.map(p => (
              <button key={p.id} onClick={() => handleProfileSwitch(p.id)} className={`h-10 px-4 rounded-xl border text-[9px] font-bold uppercase transition-all duration-300 flex items-center justify-center gap-3 ${activeProfileId === p.id ? 'bg-white/10 border-white/40 text-white shadow-inner' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
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