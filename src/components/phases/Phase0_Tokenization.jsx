import React, { useState, useEffect } from 'react';
import PhaseLayout from './../PhaseLayout';
import { useScenarios } from '../../context/ScenarioContext';

const Phase0_Tokenization = ({ simulator, theme, setHoveredItem }) => {
  const { activeScenario: contextScenario } = useScenarios();
  const { phase_0_tokenization, activeScenario: simScenario } = simulator;
  
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const scenario = contextScenario || simScenario;
  const tokens = phase_0_tokenization?.tokens || scenario?.phase_0_tokenization?.tokens || [];
  const rawText = scenario?.input_prompt || "Lade Eingabe-Prompt...";

  if (!tokens.length) return <div className="p-10 text-center opacity-50">Warte auf Token-Daten...</div>;

  // Optimierte Datenstruktur für den Inspektor
  const getInspectorData = (token) => ({
    title: `Token-Analyse: ${token.text}`,
    subtitle: "Preprocessing (BPE)",
    data: {
      "--- Spezifikationen": "---",
      "Token-ID": `#${token.id}`,
      "Inhalt": `"${token.text}"`,
      "Länge": token.text.length + " Zeichen",
      "Typ": token.id === 10 ? "Start-of-Sequence" : "Content-Token",
      
      "--- Linguistik": "---",
      // Wir nutzen "Information", damit die Sidebar die große Textbox rendert
      "Information": token.explanation || "Dieses Token wurde erfolgreich durch Byte-Pair-Encoding segmentiert und der Vokabular-ID zugewiesen."
    }
  });

  useEffect(() => {
    if (selectedTokenId) {
      const token = tokens.find(t => t.id === selectedTokenId);
      if (token) setHoveredItem(getInspectorData(token));
    }
  }, [selectedTokenId, tokens, setHoveredItem]);

  const handleMouseEnter = (token) => {
    setHoveredItem(getInspectorData(token));
  };

  const handleMouseLeave = () => {
    if (selectedTokenId) {
      const selectedToken = tokens.find(t => t.id === selectedTokenId);
      if (selectedToken) setHoveredItem(getInspectorData(selectedToken));
    } else {
      setHoveredItem(null);
    }
  };

  const handleTokenClick = (token, e) => {
    e.stopPropagation();
    if (selectedTokenId === token.id) {
      setShowTooltip(!showTooltip);
    } else {
      setSelectedTokenId(token.id);
      setShowTooltip(true);
      setHoveredItem(getInspectorData(token));
    }
  };

  return (
    <PhaseLayout
      title="Phase 0: Tokenisierung"
      subtitle="Transformation von Text in mathematische IDs"
      theme={theme}
      badges={[
        { text: `Methode: BPE`, className: "border-blue-500/30 text-blue-400 bg-blue-500/5" },
        { text: `${tokens.length} Einheiten`, className: "border-slate-500/30 text-slate-500 bg-white/5" }
      ]}
      visualization={
        <div 
          className="w-full h-full flex flex-col pt-4"
          onClick={() => { setSelectedTokenId(null); setShowTooltip(false); setHoveredItem(null); }}
        >
          {/* INPUT STRING BEREICH */}
          <div className="px-6 shrink-0">
            <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-lg border border-white/5 shadow-inner">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-lg">
                📑
              </div>
              <div className="min-w-0">
                <span className="text-[7px] uppercase font-black text-slate-600 block mb-0.5 tracking-widest">Aktueller Prompt</span>
                <p className="text-sm font-medium text-slate-300 truncate italic">
                  "{rawText}"
                </p>
              </div>
            </div>
          </div>

          {/* TRENNER */}
          <div className="flex items-center gap-2 px-10 py-6 shrink-0">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
            <div className="text-[8px] font-black text-blue-500/40 uppercase tracking-widest">Decomposition</div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
          </div>

          {/* TOKEN CLOUD BEREICH */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <div className="flex flex-wrap justify-center content-center gap-4 p-8">
              {tokens.map((token, index) => {
                const isSelected = selectedTokenId === token.id;
                return (
                  <div
                    key={index}
                    className={`
                      relative group flex flex-col items-center p-3 min-w-[85px] rounded-lg border-2 transition-all duration-300 cursor-pointer
                      ${isSelected
                        ? 'bg-blue-600 border-white scale-105 shadow-xl z-20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 z-10 shadow-lg'
                      }
                    `}
                    onMouseEnter={() => handleMouseEnter(token)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => handleTokenClick(token, e)}
                  >
                    <span className={`text-[7px] font-mono ${isSelected ? 'text-blue-200' : 'opacity-30'}`}>
                      #{token.id}
                    </span>
                    <span className={`text-base font-black tracking-tighter ${isSelected ? 'text-white' : 'text-blue-500'}`}>
                      {token.text}
                    </span>

                    {isSelected && showTooltip && (
                      <div 
                        className="absolute top-full mt-3 w-56 p-4 rounded-lg border shadow-2xl bg-slate-900 border-white text-white z-[100] left-1/2 -translate-x-1/2 cursor-default animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
                          <span className="text-[8px] font-black uppercase text-blue-400 tracking-widest">Quickinfo</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                            className="text-white opacity-50 hover:opacity-100 transition-opacity text-sm leading-none"
                          >
                            &times;
                          </button>
                        </div>
                        <p className="text-[11px] leading-relaxed italic text-slate-300">
                          {token.explanation}
                        </p>
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-l border-t border-white rotate-45"></div>
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
        <div className="col-span-full px-4 py-3 bg-slate-900/80 rounded-lg border border-white/5 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[7px] uppercase font-black text-slate-500 tracking-widest mb-0.5">Encoding Standard</span>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-tight">BPE / UTF-8 Protocol</span>
            </div>
          </div>
          <div className="flex gap-6">
             <div className="text-right border-l border-white/5 pl-6">
                <span className="text-[7px] uppercase font-black text-slate-600 block">System-Status</span>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-tighter">Input segmentiert</span>
             </div>
             <div className="text-right border-l border-white/5 pl-6">
                <span className="text-[7px] uppercase font-black text-slate-600 block">Vocab-ID Space</span>
                <span className="text-[10px] font-mono font-bold text-blue-400 tracking-tighter">#50.257 (GPT-Standard)</span>
             </div>
          </div>
        </div>
      }
    />
  );
};

export default Phase0_Tokenization;