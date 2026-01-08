import React from 'react';
import { useScenarios } from '../context/ScenarioContext'; // Pfad korrigiert von ../../ auf ../

const Footer = () => {
  const { scenariosData } = useScenarios();
  
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '20260108-STABLE';
  const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '08.01.2026';

  return (
    <footer className="w-full p-4 flex flex-col md:flex-row justify-between items-center border-t border-slate-900/50 gap-4 font-mono">
      <div className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.3em] opacity-40">
        CHERWARE.DE
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="text-[9px] text-slate-500 font-mono bg-slate-900/50 px-3 py-1 rounded border border-slate-800/50">
          DATA ENGINE: <span className="text-purple-500 font-bold">v{scenariosData?.version || "?.?"}</span>
        </div>

        <div className="text-[9px] text-slate-500 font-mono bg-slate-900/50 px-3 py-1 rounded border border-slate-800/50">
          BUILD: <span className="text-blue-500 font-bold">{appVersion}</span>
        </div>
        
        <div className="text-[9px] text-slate-500 font-mono opacity-40">
          {buildDate}
        </div>
      </div>
    </footer>
  );
};

export default Footer;