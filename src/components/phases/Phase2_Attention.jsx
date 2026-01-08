import React from 'react';
import { useScenarios } from '../../context/ScenarioContext';

// Wir nutzen das zentrale simulator-Prop und setHoveredItem
const Phase2_Attention = ({ simulator, setHoveredItem }) => {
  const { activeScenario } = useScenarios();
  
  // Diese Werte kommen jetzt aus dem zentralen simulator-Prop
  const { activeProfileId, setActiveProfileId, currentProfile } = simulator;

  if (!activeScenario) return null;
  const tokens = activeScenario.phase_0_tokenization.tokens;

  return (
    <div className="flex flex-col h-full p-6">
       <h2 className="text-center text-slate-500 uppercase tracking-widest text-[10px] mb-4">
        Attention Mechanism (Self-Attention)
      </h2>

      <div className="flex-1 flex flex-col items-center justify-center relative bg-slate-900/30 rounded-xl border border-slate-800">
        
        {/* Die Tokens als interaktive Kreise */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {tokens.map((token, i) => {
            const angle = (i / tokens.length) * 2 * Math.PI;
            const x = Math.cos(angle) * 120;
            const y = Math.sin(angle) * 120;
            
            // Regel für diesen Target-Token finden
            const rule = currentProfile?.rules.find(r => r.target === token.id);
            const strength = rule ? rule.strength : 0.1;

            return (
              <div 
                key={token.id} 
                className="absolute transition-all duration-500 cursor-help group" 
                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                // Hover Events für den Detail-Inspektor
                onMouseEnter={() => setHoveredItem({
                  title: `Attention: "${token.text}"`,
                  data: {
                    "Gewichtung": (strength * 100).toFixed(1) + "%",
                    "Fokus-Modus": currentProfile?.label || "Standard",
                    "Beziehung": `Einfluss auf "Hund"`,
                    "Status": strength > 0.5 ? "Starker Kontext" : "Schwacher Kontext",
                    "Token-ID": token.id
                  }
                })}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* Verbindungslinie zum Zentrum */}
                <div 
                  className={`absolute origin-left h-[2px] transition-all duration-500 ${
                    strength > 0.5 ? 'bg-blue-400' : 'bg-slate-600/30'
                  }`}
                  style={{ 
                    width: '120px', 
                    // Hier korrigiert: die Drehung muss zum Zentrum zeigen
                    transform: `rotate(${angle + Math.PI}rad)`, 
                    opacity: strength + 0.2,
                    height: `${Math.max(1, strength * 6)}px`,
                  }}
                />
                <div className={`px-3 py-1 rounded-full bg-slate-800 border transition-all duration-300 ${
                  strength > 0.5 
                    ? 'border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] scale-110' 
                    : 'border-slate-700 text-slate-500 scale-100 opacity-60'
                } text-[11px] font-bold font-mono relative z-10`}>
                  {token.text}
                </div>
              </div>
            );
          })}

          {/* Zentrum: Das Zielwort (Query) */}
          <div className="z-10 bg-blue-600 text-white px-5 py-2 rounded-full font-black text-sm uppercase tracking-tighter shadow-2xl shadow-blue-500/40 border-2 border-blue-400">
            Hund
          </div>
        </div>
      </div>

      {/* Profil-Umschalter */}
      <div className="mt-6 flex gap-3">
        {activeScenario.phase_2_attention.attention_profiles.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveProfileId(p.id)}
            className={`flex-1 py-3 px-4 rounded-2xl border transition-all duration-300 ${
              activeProfileId === p.id 
                ? 'bg-blue-600/20 border-blue-500 text-blue-100 shadow-lg shadow-blue-900/20' 
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
          >
            <div className="text-[9px] uppercase tracking-[0.2em] font-black mb-1 opacity-50">Attention-Head</div>
            <div className="text-[11px] font-bold uppercase tracking-tighter">{p.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Phase2_Attention;