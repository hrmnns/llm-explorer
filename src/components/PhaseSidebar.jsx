import React, { useState, useMemo } from 'react';

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
    const pipelineSignal = simulator?.activeAttention?.avgSignal ?? 1.0;
    const isDegraded = pipelineSignal < 0.7;
    const isCritical = pipelineSignal < 0.4;



    if (!isExpanded) return (
        <div className="w-full h-full flex items-center justify-center bg-explore-nav/20 backdrop-blur-md rounded-2xl border border-explore-border">
            <button
                onClick={() => setIsExpanded(true)}
                className={`group relative flex flex-row lg:flex-col items-center justify-center w-full lg:w-12 h-16 lg:h-64 rounded-xl border transition-all duration-500 gap-4
                    bg-explore-nav border-explore-border hover:bg-blue-500/10 cursor-pointer
                `}
            >
                <div className={`absolute top-0 lg:top-auto lg:left-0 w-full lg:w-[2px] h-[2px] lg:h-3/4 rounded-full transition-all duration-500
                    ${isCritical ? 'bg-error shadow-[0_0_8px_red]' : isDegraded ? 'bg-warning' : 'bg-primary'}
                `} />
                <span className="lg:rotate-180 lg:[writing-mode:vertical-lr] text-[9px] font-black uppercase tracking-[0.3em] text-primary/70">System Details</span>
                <div className="text-primary/40 text-base lg:rotate-0 rotate-90">«</div>
            </button>
        </div>
    );

    const MetricBox = ({ label, value, unit = "", color = "text-primary" }) => (
        <div className="flex flex-col p-3 rounded-lg bg-explore-item border border-explore-border transition-all hover:bg-primary/5 overflow-hidden">
            <span className="text-[7px] uppercase font-black text-content-dim tracking-widest mb-1">{label}</span>
            <span className={`text-[10px] font-mono font-bold truncate ${color}`}>{value}{unit}</span>
        </div>
    );

    return (
        <div className={`w-full h-full flex flex-col p-4 lg:p-6 rounded-2xl border shadow-2xl transition-all duration-500 overflow-hidden bg-explore-nav border-explore-border text-content-main backdrop-blur-md`}>

            <div className="flex justify-between items-start mb-5 shrink-0">
                <div>
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">System Monitor</h3>
                    <h4 className="text-sm font-bold uppercase tracking-tighter opacity-90">{phaseContent[currentPhaseIndex]?.title}</h4>
                </div>
                <button onClick={() => setIsExpanded(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-explore-item transition-colors text-content-dim hover:text-content-main text-xl cursor-pointer">×</button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scrollbar">

                {/* SIGNAL STATUS */}
                <section className="animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className={`p-3 rounded-xl border transition-all duration-500 ${isCritical ? 'bg-error/10 border-error/40' :
                        isDegraded ? 'bg-warning/10 border-warning/40' : 'bg-primary/5 border-primary/20'
                        }`}>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isCritical ? 'text-error' : isDegraded ? 'text-warning' : 'text-primary'}`}>
                                {isCritical ? '⚠️ Signal Critical' : isDegraded ? '⚡ Signal Degraded' : '💎 Signal Clear'}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-content-main">{(pipelineSignal * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1 bg-explore-item rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ease-out ${isCritical ? 'bg-error' : isDegraded ? 'bg-warning' : 'bg-primary'}`} style={{ width: `${pipelineSignal * 100}%` }} />
                        </div>
                    </div>
                </section>

                {/* PHASE INFO */}
                <section>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 border-l-2 border-l-primary shadow-inner">
                        <p className="text-[10px] leading-relaxed text-content-muted italic font-medium">{phaseContent[currentPhaseIndex]?.details}</p>
                    </div>
                </section>

                {/* TELEMETRIE */}
                <section>
                    <button onClick={() => setShowTech(!showTech)} className="w-full flex justify-between items-center text-[9px] font-black text-content-dim mb-3 uppercase tracking-widest hover:text-content-main transition-colors cursor-pointer">
                        Live Telemetrie {showTech ? '▼' : '▲'}
                    </button>

                    {showTech && (
                        <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
                            <div className="col-span-2"><MetricBox label="Active Scenario" value={activeScenario?.name || "None"} /></div>
                            <MetricBox label="Noise" value={(simulator.noise * 100).toFixed(0)} unit="%" color={isCritical ? "text-error" : isDegraded ? "text-warning" : "text-primary"} />
                            <MetricBox label="Pos. Weight" value={simulator.positionWeight?.toFixed(2)} />

                            {activePhase === 1 && (
                                <div className="col-span-2 mt-1 p-3 rounded-lg bg-primary/5 border border-primary/10 border-dashed animate-pulse">
                                    <p className="text-[9px] leading-snug text-primary/80 italic font-medium">
                                        Vektor-Basis stabil. Konfiguration der Fokus-Köpfe erfolgt in Phase 2
                                    </p>
                                </div>
                            )}

                            {activePhase >= 3 && <MetricBox label="FFN Activation" value={(pipelineSignal * 100).toFixed(1)} unit="%" color="text-success" />}
                            {activePhase >= 4 && <MetricBox label="Temperature" value={simulator.temperature?.toFixed(2)} color={simulator.temperature > 1.2 ? "text-warning" : "text-primary"} />}
                        </div>
                    )}
                </section>

                {/* INSPECTOR SECTION */}
                <section className="flex flex-col border-t border-explore-border pt-5 pb-4">
                    <p className="text-[9px] font-black text-primary mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${hoveredItem ? 'bg-primary animate-pulse' : 'bg-content-dim/30'}`}></span>
                        Pipeline Inspector
                    </p>

                    <div className={`min-h-[160px] rounded-xl border transition-all duration-500 ${hoveredItem
                        ? 'bg-explore-item border-blue-500/30 p-4 shadow-sm'
                        : 'border-dashed border-explore-border flex items-center justify-center p-4'
                        }`}>
                        {hoveredItem ? (
                            <div className="animate-in fade-in slide-in-from-right-2 duration-300 w-full">
                                <h6 className="text-[10px] font-black uppercase mb-4 text-blue-500 border-b border-explore-border pb-1 flex justify-between items-end">
                                    <span>{hoveredItem.title}</span>
                                    {hoveredItem.subtitle && <span className="text-content-dim font-normal lowercase tracking-normal italic">{hoveredItem.subtitle}</span>}
                                </h6>
                                <div className="space-y-3">
                                    {Object.entries(hoveredItem.data || {}).map(([key, value]) => {
                                        if (!value || value.toString().includes('---')) {
                                            const cleanKey = key.replace(/-/g, '').trim();
                                            return cleanKey ? (
                                                <div key={key} className="pt-3 border-t border-explore-border first:pt-0 first:border-0">
                                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-content-dim">{cleanKey}</span>
                                                </div>
                                            ) : <div key={key} className="h-px bg-explore-border my-2" />;
                                        }

                                        const isLong = value && value.toString().length > 25;

                                        return (
                                            <div key={key} className="flex flex-col group/row">
                                                <div className={`flex ${isLong ? 'flex-col gap-0.5' : 'justify-between items-end gap-2'}`}>
                                                    <span className="text-[7px] uppercase font-black text-content-dim tracking-widest group-hover/row:text-primary transition-colors shrink-0">{key}</span>
                                                    <div className={`text-[10px] font-bold text-primary font-mono leading-tight break-words ${isLong ? 'ml-3 pl-2 border-l border-primary/20 bg-primary/2 shadow-inner rounded-r-sm py-1' : 'text-right'}`}>
                                                        {value}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center group">
                                <div className="text-[8px] uppercase font-black tracking-[0.3em] text-content-dim/30 group-hover:text-content-dim/50 transition-all duration-700">
                                    System Standby<br />
                                    <span className="font-normal lowercase tracking-normal">Select item to probe pipeline</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className="mt-3 pt-3 border-t border-explore-border shrink-0">
                <div className="flex justify-between items-center text-content-dim/40 text-[7px] font-black uppercase tracking-[0.2em]">
                    <span>Neural Analysis Engine</span>
                    <span className="font-mono tracking-tighter">v1.6.0_SMART_DECODER</span>
                </div>
            </div>
        </div>
    );
};

export default PhaseSidebar;