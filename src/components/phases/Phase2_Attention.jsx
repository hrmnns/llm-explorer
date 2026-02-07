import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PhaseLayout from './../PhaseLayout';


const idsMatch = (a, b) => {
  if (a === null || b === null || a === undefined || b === undefined) return false;
  return String(a).trim() === String(b).trim();
};

const generateKey = (profileId, sourceId, headId) =>
  `${String(profileId)}_s${String(sourceId)}_h${String(headId)}`;

const Phase2_Attention = ({
  tokens = [],
  activeAttention = { avgSignal: 1.0, profiles: [] },
  activeProfileId,
  setActiveProfileId,
  headOverrides,
  setHeadOverrides,
  updateHeadWeight,
  scenarioId,
  theme,
  setHoveredItem,
  setSourceTokenId
}) => {
  // Removed useScenarios() as we pass scenarioId and data via props

  const pipelineSignal = activeAttention?.avgSignal || 1.0;
  // Use scenarioId for storage keys to avoid stale state across scenarios
  const SESSION_STORAGE_KEY = scenarioId ? `sim_overrides_${scenarioId}` : 'sim_overrides_temp';
  const PERSIST_HEAD_KEY = scenarioId ? `sim_lastHead_${scenarioId}` : null;
  const PERSIST_TOKEN_KEY = scenarioId ? `sim_lastToken_${scenarioId}` : null;

  const [selectedTokenId, setSelectedTokenId] = useState(() => {
    try {
      const saved = PERSIST_TOKEN_KEY ? sessionStorage.getItem(PERSIST_TOKEN_KEY) : null;
      return saved || null;
    } catch (e) { return null; }
  });

  const [activeHead, setActiveHead] = useState(() => {
    try {
      const saved = PERSIST_HEAD_KEY ? sessionStorage.getItem(PERSIST_HEAD_KEY) : null;
      return saved ? parseInt(saved) : 1;
    } catch (e) { return 1; }
  });

  const lastSyncedKey = useRef(null);
  const isInteracting = useRef(false);

  // --- SYNC-EFFEKT FÜR GOAL-SEEKING (🎯) ---
  useEffect(() => {
    if (!headOverrides || isInteracting.current) return;

    const forcedEntry = Object.entries(headOverrides).find(([key, val]) =>
      val === 1.0 && key.startsWith(`${activeProfileId}_`)
    );

    if (forcedEntry) {
      const [key] = forcedEntry;
      const match = key.match(/_s([^_]+)_h(\d+)/);

      if (match) {
        const [, sId, hId] = match;
        const headNum = parseInt(hId);

        // Auto-select token and head if forced by Goal Seeking from another phase
        if ((!idsMatch(sId, selectedTokenId) || activeHead !== headNum) && key !== lastSyncedKey.current) {
          lastSyncedKey.current = key;
          setSelectedTokenId(sId);
          setActiveHead(headNum);
          if (PERSIST_TOKEN_KEY) sessionStorage.setItem(PERSIST_TOKEN_KEY, sId);
          if (PERSIST_HEAD_KEY) sessionStorage.setItem(PERSIST_HEAD_KEY, hId);
        }
      }
    }
  }, [headOverrides, activeProfileId, selectedTokenId, activeHead, PERSIST_TOKEN_KEY, PERSIST_HEAD_KEY]);

  const handleHeadChange = (hId) => {
    if (isInteracting.current) return;
    setActiveHead(hId);
    if (PERSIST_HEAD_KEY) sessionStorage.setItem(PERSIST_HEAD_KEY, hId.toString());
  };

  const handleTokenSelect = (tId) => {
    setSelectedTokenId(tId);
    if (PERSIST_TOKEN_KEY) sessionStorage.setItem(PERSIST_TOKEN_KEY, String(tId));
  };

  const [hoveredTokenId, setHoveredTokenId] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Keep internal session storage sync
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      // We only restore if overrides are empty (initial load)
      if (saved && setHeadOverrides && Object.keys(headOverrides || {}).length === 0) {
        setHeadOverrides(JSON.parse(saved));
      }
    } catch (e) { }
  }, [SESSION_STORAGE_KEY, setHeadOverrides, headOverrides]);

  const lastScenarioId = useRef(scenarioId);

  // Reset logic when scenario changes
  useEffect(() => {
    if (!scenarioId) return;
    const isNewScenario = lastScenarioId.current !== scenarioId;
    if (isNewScenario) {
      // Local reset
      if (setHeadOverrides) setHeadOverrides({});

      const savedToken = PERSIST_TOKEN_KEY ? sessionStorage.getItem(PERSIST_TOKEN_KEY) : null;
      // Default to last-but-one token (usually the last input token before generation)
      const defaultTokenId = savedToken || tokens[tokens.length - 2]?.id || tokens[0]?.id;

      if (defaultTokenId) {
        setSelectedTokenId(defaultTokenId);
      }
      lastScenarioId.current = scenarioId;
      lastSyncedKey.current = null;
    }
  }, [scenarioId, tokens, PERSIST_TOKEN_KEY]);

  const profiles = activeAttention?.profiles || [];

  const interactiveTokenIds = useMemo(() => {
    const currentProfile = profiles.find(p => p.id === activeProfileId);
    if (!currentProfile) return new Set();
    return new Set(currentProfile.rules.map(r => String(r.source).trim()));
  }, [profiles, activeProfileId]);

  const handleReset = (e) => {
    e.stopPropagation();
    if (window.confirm("Slider-Werte zurücksetzen?")) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      if (setHeadOverrides) setHeadOverrides({});
      lastSyncedKey.current = null;
    }
  };

  const handleZeroAll = (e) => {
    e.stopPropagation();
    if (window.confirm("Alle Heads auf 0 setzen?")) {
      const newOverrides = {};
      tokens.forEach(token => {
        [1, 2, 3, 4].forEach(hId => {
          const key = generateKey(activeProfileId, token.id, hId);
          newOverrides[key] = 0;
        });
      });
      setHeadOverrides(newOverrides);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newOverrides));
      lastSyncedKey.current = null;
    }
  };

  const V_SIZE = 400;
  const V_CENTER = 200;
  const V_DYNAMIC_RADIUS = 130 * zoom;

  const getPos = useCallback((index, total) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * V_DYNAMIC_RADIUS;
    const y = Math.sin(angle) * V_DYNAMIC_RADIUS;
    return { x, y, xPct: ((V_CENTER + x) / V_SIZE) * 100, yPct: ((V_CENTER + y) / V_SIZE) * 100 };
  }, [V_DYNAMIC_RADIUS]);

  const currentSourceTokenId = useMemo(() => {
    if (selectedTokenId !== null) return selectedTokenId;
    return tokens[tokens.length - 2]?.id || tokens[0]?.id;
  }, [selectedTokenId, tokens]);

  useEffect(() => {
    if (setSourceTokenId && currentSourceTokenId) {
      setSourceTokenId(currentSourceTokenId);
    }
  }, [currentSourceTokenId, setSourceTokenId]);

  const getConnectionInfo = useCallback((targetId, headId) => {
    const key = generateKey(activeProfileId, currentSourceTokenId, headId);
    let sliderVal = headOverrides?.[key] ?? 0.7;
    let rule = activeAttention?.rules?.find(r =>
      idsMatch(r.source, currentSourceTokenId) && idsMatch(r.target, targetId) && idsMatch(r.head, headId)
    );
    if (!rule) {
      const currentProfileData = profiles.find(p => p.id === activeProfileId);
      rule = currentProfileData?.rules?.find(r =>
        idsMatch(r.source, currentSourceTokenId) && idsMatch(r.target, targetId) && idsMatch(r.head, headId)
      );
    }
    const baseStrength = rule ? parseFloat(rule.strength) : 0;
    return {
      strength: baseStrength * sliderVal,
      hasRule: !!rule,
      explanation: rule?.explanation || "Keine spezifische Regel hinterlegt.",
      label: rule?.label || "Neutrale Kopplung"
    };
  }, [activeAttention, headOverrides, activeProfileId, currentSourceTokenId, profiles]);

  const getHeadActiveCount = (hId) => {
    let count = 0;
    tokens.forEach(t => {
      if (idsMatch(t.id, currentSourceTokenId)) return;
      const { strength } = getConnectionInfo(t.id, hId);
      if (strength > 0.05) count++;
    });
    return count;
  };

  const headDefinitions = {
    1: { label: "Semantik", desc: "Inhaltliche Ähnlichkeit." },
    2: { label: "Syntax", desc: "Grammatikalische Abhängigkeiten." },
    3: { label: "Logik", desc: "Kausale Zusammenhänge." },
    4: { label: "Struktur", desc: "Formale Abschnitte." }
  };

  useEffect(() => {
    const targetId = hoveredTokenId || selectedTokenId || currentSourceTokenId;
    const { strength, explanation, label } = getConnectionInfo(targetId, activeHead);
    const targetToken = tokens.find(t => idsMatch(t.id, targetId));
    const sourceToken = tokens.find(t => idsMatch(t.id, currentSourceTokenId));

    if (targetToken && sourceToken) {
      const isSelf = idsMatch(targetId, currentSourceTokenId);
      setHoveredItem({
        title: isSelf ? `Query-Fokus: ${targetToken.text}` : `Relation: ${sourceToken.text} → ${targetToken.text}`,
        subtitle: `Head ${activeHead}: ${headDefinitions[activeHead].label}`,
        data: {
          "--- Verbindung": "---",
          "Match-Qualität": (strength * 100).toFixed(0) + "%",
          "Funktion": label,
          "Kopf-Spezialisierung": headDefinitions[activeHead].label,
          "--- Mathematischer Kontext": "---",
          "Query-ID": sourceToken.id,
          "Key-ID": targetToken.id,
          "Signal-Impact": strength > 0.8 ? "Dominant" : (strength > 0.4 ? "Stabil" : "Schwach"),
          "--- Analyse ": "---",
          "Information": isSelf ? `Token '${targetToken.text}' ist Query.` : explanation
        }
      });
    }
  }, [hoveredTokenId, selectedTokenId, currentSourceTokenId, activeHead, getConnectionInfo, tokens, setHoveredItem]);

  const handleSliderChange = (headId, val) => {
    const newVal = parseFloat(val);
    const key = generateKey(activeProfileId, currentSourceTokenId, headId);
    lastSyncedKey.current = key;
    if (updateHeadWeight) updateHeadWeight(key, newVal);
    // Note: headOverrides is typically updated by the parent via updateHeadWeight calling setHeadOverrides
    // But if we want optimistic updates we could do it locally, but better to rely on props
  };

  const themeColor = pipelineSignal < 0.4 ? 'var(--color-error)' : (pipelineSignal < 0.7 ? 'var(--color-warning)' : 'var(--color-primary)');

  return (
    <PhaseLayout
      title="Phase 2: Self-Attention Pipeline"
      subtitle="Justierung der Multi-Head Gewichtung"
      theme={theme}
      badges={[
        { text: headDefinitions[activeHead].label, className: "bg-primary/10 text-primary border-primary/20" },
        { text: Object.keys(headOverrides || {}).length > 0 ? "User Modus" : "Auto-Pilot", className: "bg-warning/10 text-warning border-warning/20" }
      ]}
      visualization={
        <div className="relative w-full h-full min-h-[420px] flex items-center justify-center overflow-hidden bg-explore-viz rounded-lg">
          <div className="absolute top-6 right-6 flex flex-col gap-2 z-50">
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))} className="w-10 h-10 rounded-xl bg-explore-nav border border-explore-border text-content-main hover:bg-primary-hover hover:text-white transition-all shadow-xl font-bold">+</button>
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="w-10 h-10 rounded-xl bg-explore-nav border border-explore-border text-content-main hover:bg-primary-hover hover:text-white transition-all shadow-xl">-</button>
            <button title="Alle Heads auf 0" onClick={handleZeroAll} className="w-10 h-10 rounded-xl bg-explore-nav border border-explore-border text-content-main flex items-center justify-center mt-2 hover:bg-warning-hover hover:text-white transition-all font-black text-xs">Ø</button>
            <button title="Reset" onClick={handleReset} className="w-10 h-10 rounded-xl bg-error/10 border border-error/30 text-error flex items-center justify-center hover:bg-error hover:text-white transition-all shadow-xl">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-1.103 4.116c-.806 1.347-2.277 2.25-3.965 2.25-2.5 0-4.5-2.03-4.5-4.5s2.03-4.5 4.5-4.5c1.75 0 3.27 1 4.026 2.484.061.121.23.13.34.023l.592-.572a.124.124 0 0 0 .03-.127C10.17 3.501 8.25 2 6 2 2.69 2 0 4.69 0 8s2.69 6 6 6c2.123 0 3.997-1.123 5.062-2.803.047-.074.024-.173-.05-.223l-.56-.381a.125.125 0 0 0-.121-.011z" /></svg>
            </button>
          </div>

          <div className="relative w-full max-w-[450px] aspect-square">
            <svg viewBox={`0 0 ${V_SIZE} ${V_SIZE}`} className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
              <defs><filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
              {tokens.map((token, i) => {
                if (idsMatch(token.id, currentSourceTokenId)) return null;
                const { strength, hasRule } = getConnectionInfo(token.id, activeHead);
                if (!hasRule || strength <= 0.05) return null;
                const { x, y } = getPos(i, tokens.length);
                const x2 = V_CENTER + x;
                const y2 = V_CENTER + y;
                return (
                  <g key={`att-line-${token.id}`}>
                    <line x1={V_CENTER} y1={V_CENTER} x2={x2} y2={y2} stroke={themeColor} strokeWidth={1 + strength * 16} opacity={0.3 + strength * 0.7} strokeLinecap="round" />
                    <circle r={2 + strength * 3} fill="currentColor" className="text-white" style={{ filter: 'url(#glow)' }}>
                      <animateMotion dur={`${4 - strength * 3}s`} repeatCount="indefinite" path={`M ${x2} ${y2} L ${V_CENTER} ${V_CENTER}`} />
                    </circle>
                    <g transform={`translate(${(V_CENTER + x2) / 2}, ${(V_CENTER + y2) / 2})`}>
                      <rect x="-12" y="-9" width="24" height="16" rx="5" fill="currentColor" className="text-explore-nav" stroke={themeColor} strokeWidth="1" />
                      <text fill="currentColor" className="text-content-main" fontSize="9" fontWeight="900" textAnchor="middle" dy="3.5">{(strength * 100).toFixed(0)}</text>
                    </g>
                  </g>
                );
              })}
            </svg>

            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {tokens.map((token, i) => {
                const isCenter = idsMatch(token.id, currentSourceTokenId);
                const { xPct, yPct } = isCenter ? { xPct: 50, yPct: 50 } : getPos(i, tokens.length);
                const { strength } = getConnectionInfo(token.id, activeHead);
                const isProfileInteractive = interactiveTokenIds.has(String(token.id).trim());
                return (
                  <div key={`tk-${token.id}`} className="absolute pointer-events-auto transition-all duration-700 ease-in-out" style={{ left: `${xPct}%`, top: `${yPct}%`, transform: 'translate(-50%, -50%)', zIndex: isCenter ? 50 : 20 }}>
                    {isProfileInteractive && !isCenter && <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_12px_var(--color-primary)] border border-white/20" />}
                    {isCenter ? (
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black uppercase text-primary mb-2 tracking-widest animate-pulse">Query</span>
                        <div className="w-20 h-20 rounded-full border-[6px] bg-explore-nav flex items-center justify-center shadow-2xl" style={{ borderColor: themeColor, boxShadow: `0 0 35px ${themeColor}50` }}>
                          <span className="text-content-main font-black text-[11px] uppercase text-center px-2">{token.text}</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleTokenSelect(token.id)}
                        onMouseEnter={() => setHoveredTokenId(token.id)}
                        onMouseLeave={() => setHoveredTokenId(null)}
                        className={`px-4 py-1.5 rounded-2xl border-2 font-mono text-[10px] font-black cursor-pointer transition-all ${strength > 0.1 ? 'bg-explore-nav border-primary text-content-main shadow-2xl scale-110' : 'bg-explore-item border-explore-border text-content-dim opacity-70 hover:opacity-100'}`}>
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
        <div key="c-heads" className="flex flex-col gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Attention Heads</span>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(h => {
              const activeCount = getHeadActiveCount(h);
              const currentVal = headOverrides[`${activeProfileId}_s${currentSourceTokenId}_h${h}`] ?? 0.7;
              return (
                <div key={h} onClick={() => handleHeadChange(h)} className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${activeHead === h ? 'bg-primary-hover border-primary text-white shadow-lg' : 'bg-explore-card border-explore-border text-content-dim hover:border-primary/50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase ${activeHead === h ? 'text-white' : 'text-content-main'}`}>{headDefinitions[h].label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeHead === h ? 'bg-white/20 text-white' : 'bg-explore-item text-content-dim'}`}>
                        {currentVal.toFixed(2)}
                      </span>
                    </div>
                    {activeCount > 0 && <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${activeHead === h ? 'bg-white text-primary' : 'bg-primary text-white'}`}>{activeCount}</div>}
                  </div>
                  <input type="range" min="0" max="1" step="0.05" value={currentVal}
                    onPointerDown={e => { e.stopPropagation(); isInteracting.current = true; }}
                    onPointerUp={() => { isInteracting.current = false; }}
                    onMouseDown={e => { e.stopPropagation(); isInteracting.current = true; }}
                    onMouseUp={() => { isInteracting.current = false; }}
                    onClick={e => e.stopPropagation()}
                    onInput={e => handleSliderChange(h, e.target.value)}
                    className={`w-full h-1.5 rounded-lg appearance-none cursor-ew-resize ${activeHead === h ? 'bg-white/30 accent-white' : 'bg-explore-item accent-primary'}`} />
                </div>
              );
            })}
          </div>
        </div>,
        <div key="c-profiles" className="flex flex-col gap-3 md:border-l border-explore-border md:pl-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-content-dim">Inference Context</span>
          <div className="grid grid-cols-2 gap-2">
            {profiles.map(p => (
              <button key={p.id} onClick={() => setActiveProfileId && setActiveProfileId(p.id)} className={`h-12 px-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all ${activeProfileId === p.id ? 'bg-primary/10 border-primary text-primary shadow-inner' : 'bg-explore-card border-explore-border text-content-dim hover:border-primary/50'}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      ]}
    />
  );
};

export default Phase2_Attention;