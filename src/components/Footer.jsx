import React from 'react';
import { useScenarios } from '../context/ScenarioContext'; 
import AppConfig from '../utils/AppConfig'; 

const Footer = () => {
  const { scenariosData } = useScenarios();
  
  const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '20260108-STABLE';
  const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '08.01.2026';

  return (
    <footer className="w-full p-4 flex flex-col md:flex-row justify-between items-center border-t border-explore-border gap-4 font-mono bg-explore-app transition-colors duration-500">
      <div className="text-[9px] text-content-dim font-mono uppercase tracking-[0.3em] opacity-40">
        CHERWARE.DE
      </div>
      <div className="flex gap-4 items-center">
        <div className="text-[9px] text-content-muted font-mono bg-explore-item px-3 py-1 rounded border border-explore-border shadow-sm">
          DATA ENGINE: <span className="text-purple-500 font-bold">v{AppConfig.getEngineVersion(scenariosData)}</span>
        </div>

        <div className="text-[9px] text-content-muted font-mono bg-explore-item px-3 py-1 rounded border border-explore-border shadow-sm">
          BUILD: <span className="text-blue-500 font-bold">{AppConfig.getAppVersion(scenariosData)}</span>
        </div>
        
        <div className="text-[9px] text-content-dim font-mono opacity-40">
          {buildDate}
        </div>
      </div>
    </footer>
  );
};

export default Footer;