import React, { useState } from 'react';

const PhaseSidebar = ({ activePhase, activeScenario, simulator, theme, isExpanded, setIsExpanded, hoveredItem }) => {
    const [showTech, setShowTech] = useState(true);

    const phaseContent = [
        { title: "Tokenisierung", details: "Text wird in kleine Einheiten (Tokens) zerlegt. Jeder Token erhält eine ID." },
        { title: "Vektorraum", details: "Wörter werden im Vektorraum platziert. Mathematische Nähe entspricht semantischer Ähnlichkeit." },
        { title: "Attention", details: "Das Modell bestimmt, welche Wörter im Kontext für die Bedeutung entscheidend sind." },
        { title: "FFN & Wissen", details: "Aktivierung gespeicherten Wissens in Kategorien wie 'Wissenschaft' oder 'Poesie'." },
        { title: "Decoding", details: "Berechnung der Wahrscheinlichkeiten. Hier entscheidet die 'Temperature' über Präzision oder Kreativität." },
        { title: "Analyse", details: "Interpretation der finalen Ergebnisse und des gewählten Pfades." },
    ];

    const currentPhaseIndex = activePhase === 99 ? 5 : activePhase;

    // --- PIPELINE LOGIK ---
    // Wir nutzen das neue avgSignal aus dem simulator, um die Integrität anzuzeigen
    const pipelineSignal = simulator?.activeAttention?.avgSignal || 1.0;
    const isDegraded = pipelineSignal < 0.7;
    const isCritical = pipelineSignal < 0.4;

    if (!isExpanded) return (
        <div className="w-full h-full flex items-center justify-center bg-slate-900/20 backdrop-blur-md rounded-2xl border border-slate-800">
            <button
                onClick={() => setIsExpanded(true)}
                className={`group relative flex flex-row lg:flex-col items-center justify-center w-full lg:w-12 h-16 lg:h-64 rounded-xl border transition-all duration-500 gap-4
                    ${theme === 'dark' ? 'bg-slate-900/60 border-slate-700 hover:bg-blue-600/20' : 'bg-white border-slate-200 hover:bg-blue-50'}
                `}
            >
                <div className={`absolute top-0 lg:top-auto lg:left-0 w-full lg:w-[2px] h-[2px] lg:h-3/4 rounded-full transition-all duration-500
                    ${isCritical ? 'bg-red-500 shadow-[0_0_8px_red]' : isDegraded ? 'bg-orange-500' : 'bg-blue-500'}
                `} />
                <span className="lg:rotate-180 lg:[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-[0.3em] text-blue-500/70">System Details</span>
                <div className="text-blue-500/40 text-base lg:rotate-0 rotate-90">«</div>
            </button>
        </div>
    );

    const MetricBox = ({ label, value, unit = "", color = "text-blue-500" }) => (
        <div className="flex flex-col p-3 rounded-lg bg-slate-500/5 border border-slate-500/10 transition-all hover:bg-slate-500/10 overflow-hidden">
            <span className="text-[7px] uppercase font-black opacity-40 tracking-widest mb-1">{label}</span>
            <span className={`text-[10px] font-mono font-bold truncate ${color}`}>{value}{unit}</span>
        </div>
    );

    return (
        <div className={`w-full h-full flex flex-col p-4 lg:p-6 rounded-2xl border shadow-2xl transition-all duration-500 overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 text-slate-900'
        }`}>

            {/* 1. HEADER */}
            <div className="flex justify-between items-start mb-5 shrink-0">
                <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-0.5">System Monitor</h3>
                    <h4 className="text-sm font-bold uppercase tracking-tighter opacity-90">{phaseContent[currentPhaseIndex]?.title}</h4>
                </div>
                <button onClick={() => setIsExpanded(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors opacity-30 hover:opacity-100 text-xl">×</button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                
                {/* GLOBAL PIPELINE INTEGRITY */}
                <section className="animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className={`p-3 rounded-xl border transition-all duration-500 ${
                        isCritical ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 
                        isDegraded ? 'bg-orange-500/10 border-orange-500/40' : 'bg-blue-500/5 border-blue-500/20'
                    }`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isCritical ? 'text-red-400' : isDegraded ? 'text-orange-400' : 'text-blue-400'}`}>
                                {isCritical ? '⚠️ Signal Critical' : isDegraded ? '⚡ Signal Degraded' : '💎 Signal Clear'}
                            </span>
                            <span className="text-[10px] font-mono font-bold">{(pipelineSignal * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ease-out ${isCritical ? 'bg-red-500' : isDegraded ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${pipelineSignal * 100}%` }} />
                        </div>
                    </div>
                </section>

                <section>
                    <div className="p-4 rounded-lg bg-blue-600/5 border border-blue-500/10 border-l-2 border-l-blue-500 shadow-inner">
                        <p className="text-[10px] leading-relaxed opacity-70 italic font-medium">{phaseContent[currentPhaseIndex]?.details}</p>
                    </div>
                </section>

                {/* TELEMETRIE */}
                <section>
                    <button onClick={() => setShowTech(!showTech)} className="w-full flex justify-between items-center text-[9px] font-black text-slate-500 mb-3 uppercase tracking-widest hover:text-white transition-colors">
                        Live Telemetrie {showTech ? '▼' : '▲'}
                    </button>

                    {showTech && (
                        <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
                            <div className="col-span-2"><MetricBox label="Active Scenario" value={activeScenario?.name || "None"} /></div>
                            <MetricBox label="Noise" value={(simulator.noise * 100).toFixed(0)} unit="%" color={isCritical ? "text-red-500" : isDegraded ? "text-orange-500" : "text-blue-500"} />
                            <MetricBox label="Pos. Weight" value={simulator.positionWeight?.toFixed(2)} />
                            {activePhase >= 3 && <MetricBox label="FFN Activation" value={(pipelineSignal * 100).toFixed(1)} unit="%" color="text-green-400" />}
                            {activePhase >= 4 && <MetricBox label="Temperature" value={simulator.temperature?.toFixed(2)} color={simulator.temperature > 1.2 ? "text-orange-500" : "text-blue-500"} />}
                        </div>
                    )}
                </section>

                {/* PIPELINE INSPECTOR */}
                <section className="flex flex-col border-t border-white/5 pt-5 pb-4">
                    <p className="text-[9px] font-black text-blue-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${hoveredItem ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></span>
                        Pipeline Inspector
                    </p>

                    <div className={`min-h-[160px] rounded-xl border transition-all duration-300 ${hoveredItem
                        ? (theme === 'dark' ? 'bg-slate-950/40 border-blue-500/30 p-4' : 'bg-blue-50/50 border-blue-200 p-4 shadow-inner')
                        : 'border-dashed border-white/5 flex items-center justify-center p-4'
                    }`}>
                        {hoveredItem ? (
                            <div className="animate-in fade-in slide-in-from-right-2 duration-300 w-full">
                                <h6 className="text-[10px] font-black uppercase mb-4 text-blue-500 border-b border-blue-500/20 pb-1 flex justify-between items-end">
                                    <span>{hoveredItem.title}</span>
                                    {hoveredItem.subtitle && <span className="opacity-40 font-normal lowercase tracking-normal italic">{hoveredItem.subtitle}</span>}
                                </h6>
                                <div className="space-y-4">
                                    {Object.entries(hoveredItem.data || {}).map(([key, value]) => {
                                        if (!value || value.toString().includes('---')) {
                                            return <div key={key} className="pt-3 border-t border-white/5 first:pt-0 first:border-0"><span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500/80">{key.replace(/-/g, '').trim()}</span></div>;
                                        }
                                        const isLongText = ["Information", "Kontext", "Transfer-Value", "Erkenntnis"].some(k => key.includes(k));
                                        if (isLongText) {
                                            return <div key={key} className="flex flex-col gap-1.5"><span className="text-[7px] uppercase font-black text-slate-500/60 tracking-widest">{key}</span><p className="text-[10px] leading-relaxed italic text-blue-100/90 font-medium bg-blue-500/5 p-2.5 rounded-lg border border-blue-500/10 shadow-inner">{value}</p></div>;
                                        }
                                        return (
                                            <div key={key} className="flex flex-col gap-1">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[7px] uppercase font-black text-slate-500/80 tracking-tighter">{key}</span>
                                                    <span className="text-[10px] font-bold text-blue-400 font-mono tracking-tight">{value}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center group"><div className="text-[8px] uppercase font-black tracking-[0.3em] opacity-10 group-hover:opacity-30 transition-all duration-700">System Standby<br/><span className="font-normal lowercase tracking-normal">Select token to probe pipeline</span></div></div>
                        )}
                    </div>
                </section>
            </div>

            {/* FOOTER */}
            <div className="mt-3 pt-3 border-t border-white/5 shrink-0">
                <div className="flex justify-between items-center opacity-20 text-[7px] font-black uppercase tracking-[0.2em]">
                    <span>Neural Analysis Engine</span>
                    <span className="font-mono tracking-tighter">v1.5.0_PIPELINE</span>
                </div>
            </div>
        </div>
    );
};

export default PhaseSidebar;