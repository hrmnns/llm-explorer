import React, { useState, useEffect, useCallback, useRef } from 'react';
import PhaseLayout from './../PhaseLayout';
import { useScenarios } from '../../context/ScenarioContext';

const Phase0_Tokenization = ({ simulator, theme, setHoveredItem }) => {
  const { activeScenario: contextScenario } = useScenarios();
  const { phase_0_tokenization, activeScenario: simScenario } = simulator;
  
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const lastScenarioId = useRef(contextScenario?.id || simScenario?.id);

  const scenario = contextScenario || simScenario;
  const tokens = phase_0_tokenization?.tokens || scenario?.phase_0_tokenization?.tokens || [];
  const rawText = scenario?.input_prompt || "Lade Eingabe-Prompt...";

  // Szenario-Reset Logik
  useEffect(() => {
    const currentId = scenario?.id;
    if (currentId !== lastScenarioId.current) {
      setSelectedTokenId(null);
      setShowTooltip(false);
      setHoveredItem(null);
      lastScenarioId.current = currentId;
    }
  }, [scenario?.id, setHoveredItem]);

  const getBaseVectorForToken = useCallback((tokenId) => {
    const vectorData = scenario?.phase_1_embedding?.token_vectors?.find(
      v => v.token_index === tokenId || v.id === tokenId
    );
    return vectorData?.base_vector;
  }, [scenario]);

  const getInspectorData = useCallback((token) => {
    const baseVec = getBaseVectorForToken(token.id);

    return {
      title: `Token-Analyse: ${token.text}`,
      subtitle: "Preprocessing (BPE)",
      data: {
        "--- Spezifikationen": "---",
        "Token-ID": `#${token.id}`,
        "Inhalt": `"${token.text}"`,
        "Länge": `${token.text.length} Zeichen`,
        "Typ": token.id === 10 ? "Start-of-Sequence" : "Content-Token",
        
        ...(baseVec ? {
          "--- Embedding-Vorschau": "---",
          "Base Vector X": baseVec[0].toFixed(3),
          "Base Vector Y": baseVec[1].toFixed(3),
        } : {}),

        "--- Linguistische Analyse": "---",
        "Information": token.explanation || "Dieses Token wurde erfolgreich segmentiert.",
        "Kontext-Hinweis": "Die genaue Bedeutung wird erst in Phase 2 durch die Attention-Heads bestimmt."
      }
    };
  }, [getBaseVectorForToken]);

  // Effekt für Inspektor-Sync bei Selektion
  useEffect(() => {
    if (selectedTokenId) {
      const token = tokens.find(t => t.id === selectedTokenId);
      if (token) setHoveredItem(getInspectorData(token));
    }
  }, [selectedTokenId, tokens, setHoveredItem, getInspectorData]);

  const handleMouseEnter = (token) => {
    if (!selectedTokenId) setHoveredItem(getInspectorData(token));
  };

  const handleMouseLeave = () => {
    if (!selectedTokenId) {
      setHoveredItem(null);
    } else {
      const selectedToken = tokens.find(t => t.id === selectedTokenId);
      if (selectedToken) setHoveredItem(getInspectorData(selectedToken));
    }
  };

  const handleTokenClick = (token, e) => {
    e.stopPropagation();
    if (selectedTokenId === token.id) {
      setShowTooltip(!showTooltip);
    } else {
      setSelectedTokenId(token.id);
      setShowTooltip(true);
    }
  };

  if (!tokens.length) return <div className="p-10 text-center opacity-50 font-mono">Initializing Byte-Pair-Encoding...</div>;

  return (
    <PhaseLayout
      title="Phase 0: Tokenisierung"
      subtitle="Zerlegung des Textes in numerische Fragmente"
      theme={theme}
      badges={[
        { text: `Methode: BPE`, className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
        { text: `${tokens.length} Tokens`, className: "bg-slate-500/10 text-slate-400 border-slate-500/20" }
      ]}
      visualization={
        <div 
          className="w-full h-full flex flex-col pt-6"
          onClick={() => { setSelectedTokenId(null); setShowTooltip(false); setHoveredItem(null); }}
        >
          {/* INPUT STRING DISPLAY */}
          <div className="px-8 shrink-0">
            <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-xl shadow-inner">
                  📑
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] uppercase font-black text-blue-500/60 block mb-1 tracking-[0.2em]">Input Stream</span>
                  <p className="text-sm font-medium text-slate-300 truncate italic tracking-tight">
                    "{rawText}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 px-12 py-8 shrink-0">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
            <div className="text-[9px] font-black text-blue-500/40 uppercase tracking-[0.3em]">Neural Decomposition</div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
          </div>

          {/* TOKEN CLOUD */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-8 pb-8">
            <div className="flex flex-wrap justify-center gap-3">
              {tokens.map((token) => {
                const isSelected = selectedTokenId === token.id;
                return (
                  <div
                    key={token.id}
                    className={`
                      relative flex flex-col items-center p-4 min-w-[100px] rounded-2xl border-2 transition-all duration-300 cursor-pointer
                      ${isSelected
                        ? 'bg-blue-600 border-white scale-110 shadow-[0_0_30px_rgba(37,99,235,0.4)] z-20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 z-10 shadow-lg'
                      }
                    `}
                    onMouseEnter={() => handleMouseEnter(token)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => handleTokenClick(token, e)}
                  >
                    <span className={`text-[8px] font-mono mb-1 ${isSelected ? 'text-blue-100' : 'text-slate-600'}`}>
                      ID #{token.id}
                    </span>
                    <span className={`text-lg font-black tracking-tighter ${isSelected ? 'text-white' : 'text-blue-500'}`}>
                      {token.text}
                    </span>

                    {isSelected && showTooltip && (
                      <div 
                        className="absolute top-full mt-4 w-64 p-5 rounded-2xl border-2 shadow-2xl bg-slate-900 border-white text-white z-[100] left-1/2 -translate-x-1/2 cursor-default animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
                          <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Token Info</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                            className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-sm"
                          >
                            &times;
                          </button>
                        </div>
                        <p className="text-[11px] leading-relaxed italic text-slate-300 font-medium">
                          {token.explanation}
                        </p>
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-l-2 border-t-2 border-white rotate-45"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
      controls={
        <div className="col-span-full px-6 py-4 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center justify-between shadow-2xl">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase font-black text-blue-500 tracking-[0.2em]">Encoding Standard</span>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-tight">GPT-BPE Protocol v2</span>
            </div>
          </div>
          <div className="flex gap-10">
             <div className="text-right border-l border-white/10 pl-10">
                <span className="text-[8px] uppercase font-black text-slate-600 block mb-1">Status</span>
                <span className="text-[11px] font-mono font-black text-blue-400 uppercase tracking-tighter">Ready for Embedding</span>
             </div>
             <div className="text-right border-l border-white/10 pl-10">
                <span className="text-[8px] uppercase font-black text-slate-600 block mb-1">Vocab Size</span>
                <span className="text-[11px] font-mono font-black text-blue-400 tracking-tighter">50,257 Vectors</span>
             </div>
          </div>
        </div>
      }
    />
  );
};

export default Phase0_Tokenization;