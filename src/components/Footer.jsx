import React from 'react';

const Footer = () => {
  // Diese Variablen werden von Vite während des Build-Vorgangs ersetzt
  const version = __APP_VERSION__;
  const deployId = __DEPLOY_ID__;

  return (
    <footer className="fixed bottom-0 left-0 w-full p-2 flex justify-between items-center pointer-events-none">
      <div className="text-[8px] text-slate-700 font-mono uppercase tracking-widest opacity-50">
        Status: Production Stable
      </div>
      <div className="text-[8px] text-slate-700 font-mono opacity-50 bg-slate-950/80 px-2 py-0.5 rounded">
        {version} • Build: {deployId}
      </div>
    </footer>
  );
};

export default Footer;