import React from 'react';
import { useScenarios } from '../context/ScenarioContext';
import AppConfig from '../utils/AppConfig'; 

const IntroScreen = ({ onStart }) => {
  const { scenarios, scenariosData } = useScenarios();

  return (
    <div className="flex-1 flex flex-col items-center justify-center lg:justify-start p-8 lg:pt-20 py-12 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-blue-500/5">
      <div className="max-w-5xl w-full">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-1000">
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent uppercase">
            LLM Explorer 
          </h1>
          
          {/* VERSION & BUILD INFO */}
          <div className="flex flex-col items-center mb-8 space-y-1">
            <div className="flex gap-3 items-center opacity-60">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-content-muted">
                {AppConfig.getFullVersionString(scenariosData)}
              </span>
            </div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-content-dim opacity-40">
              {AppConfig.getBuildDate()}
            </div>
          </div>

          <p className="text-lg text-content-muted font-light max-w-2xl mx-auto italic leading-relaxed">
            Tauchen Sie ein in die verborgenen Schichten der KI. Verfolgen Sie, wie aus einem einfachen Satz eine mathematisch begründete Entscheidung wird.
          </p>
        </div>

        {/* SCENARIO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {scenarios.map((s, idx) => (
            <div 
              key={s.id}
              onClick={() => onStart(s.id)}
              className="group relative p-8 rounded-[2rem] border border-explore-border bg-explore-card hover:bg-explore-item hover:border-blue-500/40 transition-all duration-500 cursor-pointer shadow-2xl flex flex-col animate-in fade-in zoom-in duration-700"
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
                 <span className="text-8xl">🧠</span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-2">Szenario {s.id}</h3>
                <h2 className="text-3xl font-black text-content-main group-hover:text-blue-500 transition-colors">
                  {s.name}
                </h2>
              </div>

              <div className="relative mb-6">
                <span className="absolute -top-2 left-3 px-2 bg-explore-card group-hover:bg-explore-item transition-colors text-[8px] font-bold uppercase tracking-widest text-content-dim">                
                Eingabe-Prompt</span>
                <div className="p-4 rounded-xl bg-explore-viz border border-explore-border italic text-content-muted text-sm leading-relaxed">
                  "{s.input_prompt}"
                </div>
              </div>

              <div className="flex-1 mb-8">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-content-dim mb-2 flex items-center gap-2">
                  <span className="w-4 h-px bg-explore-border"></span> Briefing
                </h4>
                <p className="text-sm text-content-muted leading-relaxed font-medium">
                  {s.explanation || "In diesem Szenario untersuchen wir die Standard-Verarbeitungspfade des Modells."}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-explore-border">
                <span className="text-[10px] font-bold uppercase tracking-widest text-content-dim group-hover:text-blue-500 transition-colors">
                  Kausalkette starten
                </span>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
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