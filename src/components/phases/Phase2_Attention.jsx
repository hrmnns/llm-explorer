import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useScenarios } from '../../context/ScenarioContext';

const Phase2_Attention = ({ simulator, setHoveredItem }) => {
  const { activeScenario } = useScenarios();
  const { activeProfileId, setActiveProfileId, currentProfile: simulatorProfile } = simulator;
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  if (!activeScenario) return null;

  const tokens = activeScenario.phase_0_tokenization.tokens;
  const profiles = activeScenario.phase_2_attention.attention_profiles;

  // 1. Lokales Profil-Matching (Sicherheitsnetz gegen Simulator-Lag)
  const currentProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  // 2. Bestimmung des Zentrums (Source Token)
  const sourceTokenId = useMemo(() => {
    if (selectedTokenId) return selectedTokenId;

    // Priorität 1: Die Source der ersten Regel im aktuell gültigen Profil
    if (currentProfile?.rules?.length > 0) {
      return currentProfile.rules[0].source;
    }

    // Priorität 2: Fallback auf das vorletzte Token (meist das Hauptnomen vor dem "?")
    return tokens[tokens.length - 2]?.id || tokens[0]?.id;
  }, [selectedTokenId, currentProfile, tokens]);

  const sourceToken = tokens.find(t => Number(t.id) === Number(sourceTokenId));

  // 3. Filtern der Regeln für die aktuelle Anzeige
  const activeRules = useMemo(() => {
    if (!currentProfile?.rules) return [];

    // Wir filtern alle Regeln, bei denen das aktuelle Zentrum die Quelle ist
    const filtered = currentProfile.rules.filter(r => 
      Number(r.source) === Number(sourceTokenId)
    );

    // Debugging-Log (kann später entfernt werden)
    console.log(`Phase 2 - Zentrum: ${sourceToken?.text} (ID: ${sourceTokenId}), Verbindungen: ${filtered.length}`);
    
    return filtered;
  }, [currentProfile, sourceTokenId, sourceToken]);

  // Inspector Update Logic
  const updateInspector = useCallback((tokenId) => {
    if (!tokenId) { setHoveredItem(null); return; }
    const token = tokens.find(t => Number(t.id) === Number(tokenId));
    const rule = activeRules.find(r => Number(r.target) === Number(tokenId));
    const strength = rule ? rule.strength : 0.05;

    setHoveredItem({
      title: `Attention Analysis`,
      data: {
        "Token": `"${token?.text}"`,
        "Gewichtung": (strength * 100).toFixed(1) + "%",
        "Zentrum": `"${sourceToken?.text}"`,
        "Kontext": rule?.explanation || "Basis-Rauschen der Aufmerksamkeit."
      }
    });
  }, [tokens, activeRules, setHoveredItem, sourceToken]);

  // SICHERHEITS-CHECK: Korrigiert das Profil beim Szenarien-Wechsel
  useEffect(() => {
    const currentProfileExists = profiles.some(p => p.id === activeProfileId);
    if (!currentProfileExists && profiles.length > 0) {
      setActiveProfileId(profiles[0].id);
    }
  }, [activeScenario.id, activeProfileId, setActiveProfileId, profiles]);

  useEffect(() => {
    if (selectedTokenId) updateInspector(selectedTokenId);
  }, [activeProfileId, selectedTokenId, updateInspector]);

  const isEmotional = activeProfileId?.includes('emotional') || activeProfileId?.includes('nature') || activeProfileId?.includes('metaphorical') || activeProfileId?.includes('conspiracy');
  const themeColor = isEmotional ? '#a855f7' : '#3b82f6';

  return (
    <div className="flex flex-col h-full p-6 select-none bg-slate-950" onClick={() => { setSelectedTokenId(null); setHoveredItem(null); }}>
      
      {/* Header Bereich */}
      <div className="mb-6 text-center">
        <h2 className="text-slate-500 uppercase tracking-[0.3em] text-[10px] mb-2 font-black">Phase 2: Self-Attention Mechanism</h2>
        <div className="flex justify-center items-center gap-3">
            <div className={`text-[10px] font-black px-4 py-1 rounded-full border uppercase tracking-wider ${isEmotional ? 'border-purple-500 text-purple-400 bg-purple-500/10' : 'border-blue-500 text-blue-400 bg-blue-500/10'}`}>
                Modus: {currentProfile?.label || "Laden..."}
            </div>
            <div className={`text-[10px] font-mono font-bold px-4 py-1 rounded-full border ${activeRules.length > 0 ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-orange-500 text-orange-400 bg-orange-500/10'}`}>
                {activeRules.length} Verbindungen aktiv
            </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative bg-slate-900/10 rounded-[3rem] border border-white/5 overflow-hidden shadow-inner">
        <div className="relative w-80 h-80 flex items-center justify-center">
          
          {/* SVG STRAHLEN */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            {tokens.map((token, i) => {
              if (Number(token.id) === Number(sourceTokenId)) return null;

              const angle = (i / tokens.length) * 2 * Math.PI;
              const rule = activeRules.find(r => Number(r.target) === Number(token.id));
              const strength = rule ? rule.strength : 0;
              const isActive = strength > 0.1;
              
              const tx = 160 + Math.cos(angle) * 135;
              const ty = 160 + Math.sin(angle) * 135;

              return (
                <g key={`line-${token.id}`}>
                  <line x1="160" y1="160" x2={tx} y2={ty} stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
                  {isActive && (
                    <g>
                      <line 
                        x1="160" y1="160" x2={tx} y2={ty} 
                        stroke={themeColor} 
                        strokeWidth={4 + strength * 25} 
                        opacity="0.8" 
                        className="transition-all duration-700"
                      />
                      <circle r="4" fill="white">
                        <animateMotion dur={`${1.5 - strength}s`} repeatCount="indefinite" path={`M ${tx} ${ty} L 160 160`} />
                      </circle>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* TOKEN NODES */}
          {tokens.map((token, i) => {
            const angle = (i / tokens.length) * 2 * Math.PI;
            const x = Math.cos(angle) * 135;
            const y = Math.sin(angle) * 135;
            const isCenter = Number(token.id) === Number(sourceTokenId);

            return (
              <div 
                key={token.id} 
                className="absolute z-20" 
                style={{ 
                  left: `calc(50% + ${x}px)`, 
                  top: `calc(50% + ${y}px)`, 
                  transform: `translate(-50%, -50%) scale(${isCenter ? 0 : 1})`,
                  opacity: isCenter ? 0 : 1,
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  pointerEvents: isCenter ? 'none' : 'auto'
                }}
                onMouseEnter={() => !isCenter && updateInspector(token.id)}
                onMouseLeave={() => updateInspector(selectedTokenId)}
                onClick={(e) => { e.stopPropagation(); setSelectedTokenId(token.id); }}
              >
                <div className={`px-3 py-1.5 rounded-xl border-2 transition-all duration-300 font-mono text-[10px] font-black ${
                    activeRules.some(r => Number(r.target) === Number(token.id)) ? 'bg-slate-900 border-white text-white shadow-lg scale-110' : 'bg-slate-900 border-slate-800 text-slate-600'
                }`}>
                  {token.text}
                </div>
              </div>
            );
          })}

          {/* CENTER NODE */}
          <div className="z-10 flex flex-col items-center justify-center bg-slate-900 w-32 h-32 rounded-full border-4 border-slate-800 shadow-2xl relative">
            <div className="absolute inset-0 rounded-full opacity-10 animate-pulse" style={{ backgroundColor: themeColor }}></div>
            <span className="text-[7px] text-slate-500 uppercase font-black tracking-widest mb-1">Query Focus</span>
            <span className="text-white font-black text-sm uppercase tracking-tighter px-4 text-center truncate w-full">
              {sourceToken?.text}
            </span>
          </div>
        </div>
      </div>

      {/* PROFIL UMSCHALTER */}
      <div className="mt-8 grid grid-cols-2 gap-4">
        {profiles.map(p => (
          <button
            key={p.id}
            onClick={() => { setSelectedTokenId(null); setActiveProfileId(p.id); }}
            className={`p-4 rounded-[2rem] border-2 transition-all duration-500 ${
              activeProfileId === p.id 
                ? (isEmotional ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-blue-600 border-blue-400 text-white shadow-lg') 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
            }`}
          >
            <div className="text-[11px] font-black uppercase tracking-widest">{p.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Phase2_Attention;