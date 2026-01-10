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
        { title: "Layout Debug", details: "Vorschau der standardisierten UI-Komponenten und Layout-Stabilität." }
    ];

    const currentPhaseIndex = activePhase === 99 ? 6 : activePhase;

    // --- MINIMIERTER ZUSTAND (Responsive Breite) ---
    if (!isExpanded) return (
        <div className="w-full h-full flex items-center justify-center bg-slate-900/20 backdrop-blur-md rounded-2xl border border-slate-800">
            <button
                onClick={() => setIsExpanded(true)}
                className={`
                    group relative flex flex-row lg:flex-col items-center justify-center
                    w-full lg:w-12 h-16 lg:h-64 rounded-xl border transition-all duration-500 gap-4
                    ${theme === 'dark'
                        ? 'bg-slate-900/60 border-slate-700 hover:bg-blue-600/20 hover:border-blue-500/50'
                        : 'bg-white border-slate-200 hover:bg-blue-50 shadow-sm'}
                `}
            >
                {/* Dekorativer Balken: Oben auf Mobil, Links auf Desktop */}
                <div className="absolute top-0 lg:top-auto lg:left-0 w-full lg:w-[2px] h-[2px] lg:h-3/4 bg-blue-500 rounded-full opacity-40 group-hover:opacity-100 transition-opacity" />
                
                <span className="lg:rotate-180 lg:[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-[0.3em] text-blue-500/70 group-hover:text-blue-500">
                    System Details
                </span>
                <div className="text-blue-500/40 group-hover:text-blue-500 text-base lg:rotate-0 rotate-90">«</div>
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
        /* HAUPT-CONTAINER: 
           w-full erlaubt es der Sidebar, sich dem aside-Tag der App.jsx anzupassen.
           Abgerundete Ecken auf rounded-2xl für den einheitlichen Look.
        */
        <div className={`w-full h-full flex flex-col p-4 lg:p-6 rounded-2xl border shadow-2xl transition-all duration-500 overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900/60 border-slate-800 backdrop-blur-md' : 'bg-white border-slate-200 text-slate-900'
        }`}>

            {/* 1. HEADER */}
            <div className="flex justify-between items-start mb-5 shrink-0">
                <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-0.5">System Monitor</h3>
                    <h4 className="text-sm font-bold uppercase tracking-tighter opacity-90">
                        {phaseContent[currentPhaseIndex]?.title}
                    </h4>
                </div>
                <button 
                    onClick={() => setIsExpanded(false)} 
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors opacity-30 hover:opacity-100 text-xl"
                >
                    ×
                </button>
            </div>

            {/* 2. SCROLL-CONTENT */}
            <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar">

                {/* Definition Box */}
                <section>
                    <div className="p-4 rounded-lg bg-blue-600/5 border border-blue-500/10 border-l-2 border-l-blue-500">
                        <p className="text-[10px] leading-relaxed opacity-70 italic">
                            {phaseContent[currentPhaseIndex]?.details}
                        </p>
                    </div>
                </section>

                {/* Live Parameter */}
                <section>
                    <button
                        onClick={() => setShowTech(!showTech)}
                        className="w-full flex justify-between items-center text-[9px] font-black text-slate-500 mb-3 uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Live Telemetrie {showTech ? '▼' : '▲'}
                    </button>

                    {showTech && (
                        /* Responsive Grid: 2 Spalten auf Desktop/Mobil, 4 Spalten auf breiten Zwischengrößen */
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 animate-in fade-in duration-300">
                            <div className="col-span-2 sm:col-span-4 lg:col-span-2">
                                <MetricBox label="Active Scenario" value={activeScenario?.name || "None"} />
                            </div>

                            {(activePhase === 1 || activePhase === 2) && (
                                <>
                                    <MetricBox label="Noise" value={(simulator.noise * 100).toFixed(0)} unit="%" />
                                    <MetricBox label="Pos. Weight" value={simulator.positionWeight?.toFixed(2)} />
                                </>
                            )}
                            
                            {activePhase === 3 && (
                                <>
                                    <MetricBox label="FFN Filter" value={simulator.mlpThreshold?.toFixed(2)} />
                                    <MetricBox label="Cluster ID" value={simulator.activeProfileId} color="text-green-500" />
                                </>
                            )}

                            {activePhase === 4 && (
                                <>
                                    <MetricBox
                                        label="Temperature"
                                        value={simulator.temperature?.toFixed(2)}
                                        color={simulator.temperature > 1.2 ? "text-orange-500" : "text-blue-500"}
                                    />
                                    <MetricBox
                                        label="Min-P Rank"
                                        value={simulator.temperature > 1.5 ? "Volatile" : "Stable"}
                                        color={simulator.temperature > 1.5 ? "text-red-500" : "text-green-500"}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </section>

                {/* Detail-Inspektor */}
                <section className="flex flex-col border-t border-white/5 pt-5 pb-4">
                    <p className="text-[9px] font-black text-blue-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${hoveredItem ? 'bg-blue-500 animate-pulse' : 'bg-slate-700'}`}></span>
                        Pipeline Inspector
                    </p>

                    <div className={`min-h-[140px] rounded-lg border transition-all duration-300 ${hoveredItem
                        ? (theme === 'dark' ? 'bg-slate-950/40 border-blue-500/30 p-4' : 'bg-blue-50/50 border-blue-200 p-4')
                        : 'border-dashed border-white/5 flex items-center justify-center p-4'
                    }`}>
                        {hoveredItem ? (
                            <div className="animate-in fade-in duration-300 w-full">
                                <h6 className="text-[10px] font-bold uppercase mb-3 text-blue-500 border-b border-white/5 pb-1 flex justify-between">
                                    <span>{hoveredItem.title}</span>
                                    {hoveredItem.subtitle && <span className="opacity-40 font-normal lowercase">{hoveredItem.subtitle}</span>}
                                </h6>

                                <div className="space-y-2.5">
                                    {Object.entries(hoveredItem.data || {}).map(([key, value]) => {
                                        if (key === "Trace-Analyse" || key === "Trace") {
                                            return (
                                                <div key={key} className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                                    <span className="text-[7px] uppercase font-black text-blue-400/60 block mb-1">Causal Trace</span>
                                                    <p className="text-[10px] leading-relaxed italic opacity-80 font-medium">{value}</p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={key} className="flex justify-between items-center text-[9px] font-mono border-b border-white/5 pb-1">
                                                <span className="opacity-40 uppercase tracking-tighter">{key}</span>
                                                <span className="font-bold text-blue-400/90">{value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center group">
                                <div className="text-[8px] uppercase tracking-[0.2em] opacity-20 group-hover:opacity-40 transition-opacity">
                                    Select element<br/>to analyze logic
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* 3. FOOTER */}
            <div className="mt-3 pt-3 border-t border-white/5 shrink-0">
                <div className="flex justify-between items-center opacity-20 text-[7px] font-black uppercase tracking-[0.2em]">
                    <span>Analysis Engine</span>
                    <span className="font-mono">v1.3.0</span>
                </div>
            </div>
        </div>
    );
};

export default PhaseSidebar;