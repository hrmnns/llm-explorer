import React, { useState, useEffect, useCallback, useRef } from 'react';
import PhaseLayout from './../PhaseLayout';
import { useScenarios } from '../../context/ScenarioContext';

const Phase0_Tokenization = ({ simulator, setHoveredItem }) => {
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

  useEffect(() => {
    if (selectedTokenId) {
      const token = tokens.find(t => t.id === selectedTokenId);
      if (token) setHoveredItem(getInspectorData(token));
    }
  }, [selectedTokenId, tokens, setHoveredItem, getInspectorData]);

  if (!tokens.length) return <div className="p-10 text-center opacity-50 font-mono text-content-muted">Initializing Byte-Pair-Encoding...</div>;

  return (
    <PhaseLayout
      title="Phase 0: Tokenisierung"
      subtitle="Zerlegung des Textes in numerische Fragmente"
      badges={[
        { text: `Methode: BPE`, className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        { text: `${tokens.length} Tokens`, className: "bg-explore-item text-content-muted border-explore-border" }
      ]}
      visualization={
        <div 
          className="w-full h-full flex flex-col pt-6"
          onClick={() => { setSelectedTokenId(null); setShowTooltip(false); setHoveredItem(null); }}
        >
          {/* INPUT STRING DISPLAY */}
          <div className="px-8 shrink-0">
            <div className="bg-explore-card p-5 rounded-2xl border border-explore-border shadow-2xl backdrop-blur-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-xl shadow-inner">
                  📑
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] uppercase font-black text-blue-500 block mb-1 tracking-[0.2em]">Input Stream</span>
                  <p className="text-sm font-medium text-content-muted truncate italic tracking-tight">
                    "{rawText}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
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
                        ? 'bg-blue-600 border-blue-400 text-white scale-110 shadow-lg z-20'
                        : 'bg-explore-item border-explore-border text-content-muted hover:border-blue-500/50 hover:bg-explore-card z-10'
                      }
                    `}
                    onMouseEnter={() => !selectedTokenId && setHoveredItem(getInspectorData(token))}
                    onMouseLeave={() => !selectedTokenId && setHoveredItem(null)}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTokenId(isSelected ? null : token.id);
                        setShowTooltip(!isSelected);
                    }}
                  >
                    <span className={`text-[8px] font-mono mb-1 ${isSelected ? 'text-blue-100' : 'text-content-dim'}`}>
                      ID #{token.id}
                    </span>
                    <span className={`text-lg font-black tracking-tighter ${isSelected ? 'text-white' : 'text-blue-500'}`}>
                      {token.text}
                    </span>

                    {isSelected && showTooltip && (
                      <div 
                        className="absolute top-full mt-4 w-64 p-5 rounded-2xl border-2 shadow-2xl z-[100] left-1/2 -translate-x-1/2 cursor-default animate-in zoom-in-95 duration-200 bg-explore-nav border-explore-border text-content-main"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-3 border-b border-explore-border pb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Token Info</span>
                          <button onClick={() => setShowTooltip(false)} className="text-content-dim hover:text-content-main transition-colors">&times;</button>
                        </div>
                        <p className="text-[11px] leading-relaxed italic font-medium text-content-muted">
                          {token.explanation}
                        </p>
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
        <div className="col-span-full px-6 py-4 rounded-2xl border border-explore-border bg-explore-card flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase font-black text-blue-500 tracking-[0.2em]">Encoding Standard</span>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="text-xs font-mono font-bold uppercase tracking-tight text-content-main">GPT-BPE Protocol v2</span>
            </div>
          </div>
          <div className="flex gap-10">
             <div className="text-right border-l border-explore-border pl-10">
                <span className="text-[8px] uppercase font-black text-content-dim block mb-1">Status</span>
                <span className="text-[11px] font-mono font-black text-blue-500 uppercase tracking-tighter">Ready for Embedding</span>
             </div>
             <div className="text-right border-l border-explore-border pl-10">
                <span className="text-[8px] uppercase font-black text-content-dim block mb-1">Vocab Size</span>
                <span className="text-[11px] font-mono font-black text-blue-500 tracking-tighter">50,257 Vectors</span>
             </div>
          </div>
        </div>
      }
    />
  );
};

export default Phase0_Tokenization;