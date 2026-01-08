import React, { useState } from 'react';

const Phase0_Tokenization = ({ simulator, theme, setHoveredItem }) => {
  const { phase_0_tokenization } = simulator;
  const [clickedTokenId, setClickedTokenId] = useState(null);

  if (!phase_0_tokenization) return null;

  return (
    <div className="flex flex-col h-full w-full p-8 animate-in fade-in duration-700 relative">
      <h2 className="text-center text-slate-500 uppercase tracking-[0.2em] text-[10px] mb-10">
        Input Decomposition (Tokens)
      </h2>

      <div className="flex flex-wrap justify-center gap-4">
        {phase_0_tokenization.tokens.map((token, index) => (
          <div
            key={index}
            // WICHTIG: Hier wird z-50 hinzugefügt, wenn das Token aktiv ist
            className={`group relative flex flex-col items-center p-6 min-w-[100px] rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
              clickedTokenId === token.id
                ? 'bg-blue-600 border-blue-400 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.4)] z-50' // z-50 hinzugefügt
                : theme === 'dark' 
                  ? 'bg-slate-900 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 z-10' 
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-lg z-10'
            }`}
            onClick={() => setClickedTokenId(clickedTokenId === token.id ? null : token.id)}
            onMouseEnter={() => setHoveredItem({
              title: `Token Analysis`,
              data: {
                "Token-ID": token.id,
                "Text": token.text,
                "Länge": token.text.length,
                "Index": index
              }
            })}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <span className={`text-[10px] font-mono mb-1 ${clickedTokenId === token.id ? 'text-blue-200' : 'opacity-40'}`}>
              #{token.id}
            </span>
            <span className={`text-2xl font-black tracking-tighter ${clickedTokenId === token.id ? 'text-white' : 'text-blue-500'}`}>
              {token.text}
            </span>

            {/* Der Klick-Tooltip */}
            {clickedTokenId === token.id && (
              <div 
                className="absolute top-full mt-4 w-64 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-top-2 duration-200 bg-slate-900 border-blue-400 text-white cursor-default left-1/2 -translate-x-1/2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-2 border-b border-blue-500/30 pb-2">
                  <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest text-left">Semantische Bedeutung</span>
                  <button onClick={() => setClickedTokenId(null)} className="text-lg leading-none opacity-50 hover:opacity-100">&times;</button>
                </div>
                <p className="text-[12px] leading-relaxed italic text-slate-200 text-left">
                  {token.explanation}
                </p>
                {/* Pfeil */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-l border-t border-blue-400 rotate-45"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto p-6 bg-blue-600/5 border border-blue-500/10 rounded-2xl">
        <p className={`text-[10px] uppercase tracking-widest text-center font-bold ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
          Tipp: Klicke auf ein Token für die semantische Analyse.
        </p>
      </div>
    </div>
  );
};

export default Phase0_Tokenization;