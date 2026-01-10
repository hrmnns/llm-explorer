import React from 'react';
import PhaseLayout from './../PhaseLayout';

const PhaseX_DebugTemplate = ({ theme }) => {
  return (
    <PhaseLayout
      title="Layout: Professional Mode"
      subtitle="Subtile Radien für maximalen Fokus"
      theme={theme}
      badges={[
        { text: "Clean UI", className: "border-green-500/30 text-green-400 bg-green-500/5" },
        { text: "v1.3", className: "border-slate-500/30 text-slate-500" }
      ]}
      visualization={
        <div className="space-y-4">
          {/* Visualisierungs-Platzhalter: rounded-lg */}
          <div className="h-48 bg-slate-900/30 border border-dashed border-white/10 rounded-lg flex items-center justify-center">
            <span className="text-slate-700 uppercase font-black text-[10px] tracking-[0.3em]">Visual Area</span>
          </div>

          {/* Info-Box: rounded-lg */}
          <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
            <h3 className="text-blue-400 font-bold mb-1 uppercase text-[10px] tracking-widest">Design Update</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Die Ecken sind nun deutlich dezenter. Das wirkt technischer, professioneller und lenkt weniger vom eigentlichen Inhalt ab.
            </p>
          </div>

          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-900/20 rounded-md border border-white/5" />
          ))}
        </div>
      }
      controls={
        <>
          <div className="px-4 py-3 bg-slate-900/80 rounded-lg border border-white/5">
            {/* Slider A */}
          </div>
          <div className="px-4 py-3 bg-slate-900/80 rounded-lg border border-white/5">
            {/* Slider B */}
          </div>
          <div className="px-4 py-3 bg-slate-900/80 rounded-lg border border-white/5">
            {/* Slider C */}
          </div>
        </>
      }
    />
  );
};

export default PhaseX_DebugTemplate;