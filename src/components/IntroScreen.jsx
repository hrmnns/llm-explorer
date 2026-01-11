import React from 'react';
import { useScenarios } from '../context/ScenarioContext';

const IntroScreen = ({ onStart, theme }) => {
  const { scenarios, scenariosData } = useScenarios();

  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '20260108-STABLE';
  const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '08.01.2026';

  return (
    /* ÄNDERUNG: 
       - lg:justify-start: Verhindert das Hochschieben unter den Header auf Desktop
       - lg:pt-20: Garantiert einen Sicherheitsabstand zum Header
       - py-12: Sorgt für Abstand zum Footer am Ende des Contents
    */
    <div className="flex-1 flex flex-col items-center justify-center lg:justify-start p-8 lg:pt-20 py-12 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-blue-500/5">
      <div className="max-w-5xl w-full">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-1000">
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent uppercase">
            LLM Explorer
          </h1>
          
          {/* VERSION & BUILD INFO */}
          <div className="flex flex-col items-center mb-8 space-y-1">
            <div className="flex gap-3 items-center opacity-60">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
                Engine: <span className="text-purple-500 font-bold">v{scenariosData?.version || "?.?"}</span>
              </span>
              <span className="text-slate-800">|</span>
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
                Build: <span className="text-blue-500 font-bold">{appVersion}</span>
              </span>
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600 opacity-40">
              {buildDate}
            </div>
          </div>

          <p className="text-lg text-slate-400 font-light max-w-2xl mx-auto italic leading-relaxed">
            Tauchen Sie ein in die verborgenen Schichten der KI. Verfolgen Sie, wie aus einem einfachen Satz eine mathematisch begründete Entscheidung wird.
          </p>
        </div>

        {/* SCENARIO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {scenarios.map((s, idx) => (
            <div 
              key={s.id}
              onClick={() => onStart(s.id)}
              className="group relative p-8 rounded-[2rem] border border-white/5 bg-slate-900/40 hover:bg-slate-800/60 hover:border-blue-500/40 transition-all duration-500 cursor-pointer shadow-2xl flex flex-col animate-in fade-in zoom-in duration-700"
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                 <span className="text-8xl">🧠</span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">Szenario {s.id}</h3>
                <h2 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">
                  {s.name}
                </h2>
              </div>

              <div className="relative mb-6">
                <span className="absolute -top-2 left-3 px-2 bg-slate-900 text-[8px] font-bold uppercase tracking-widest text-slate-500">Eingabe-Prompt</span>
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 italic text-slate-300 text-sm leading-relaxed">
                  "{s.input_prompt}"
                </div>
              </div>

              <div className="flex-1 mb-8">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-700"></span> Briefing
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                  {s.explanation || "In diesem Szenario untersuchen wir die Standard-Verarbeitungspfade des Modells."}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-blue-500 transition-colors">
                  Kausalkette starten
                </span>
                <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;