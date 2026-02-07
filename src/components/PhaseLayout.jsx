import React from 'react';

const PhaseLayout = ({
    title,
    subtitle,
    badges = [],
    visualization,
    controls
}) => {
    return (
        <div className="flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500 p-4 lg:p-6 text-content-main">

            {/* HEADER: Nutzt zentrale Border-Variable */}
            <header className="flex flex-wrap items-center justify-between gap-4 mb-4 shrink-0 border-b border-explore-border pb-4">
                <div className="flex flex-col min-w-[150px]">
                    <h2 className="text-primary uppercase font-black tracking-[0.2em] text-[9px] mb-1 leading-none">
                        {title}
                    </h2>
                    <p className="text-base font-bold tracking-tight leading-none">
                        {subtitle}
                    </p>
                </div>

                {/* BADGE-CONTAINER */}
                <div className="flex flex-wrap gap-2 items-center lg:justify-end ml-auto">
                    {badges && badges.length > 0 && badges.map((badge, idx) => (
                        <div
                            key={idx}
                            className={`px-2 py-0.5 rounded-md border text-[8px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shadow-sm ${badge.className}`}
                        >
                            {badge.text}
                        </div>
                    ))}
                </div>
            </header>

            {/* HAUPT-VISUALISIERUNG (Die Bühne)
                Nutzt bg-explore-viz (Weiß im Lightmode / Transparent-Dark im Darkmode)
                Radius auf rounded-2xl angepasst für Konsistenz mit Sidebar */}
            <div className="flex-1 min-h-0 relative bg-explore-viz rounded-2xl border border-explore-border overflow-hidden flex flex-col transition-all duration-300">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    {visualization}
                </div>
            </div>

            {/* EINSTELLUNGEN FOOTER */}
            {controls && (
                <footer className="shrink-0 mt-4 pt-4 border-t border-explore-border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr gap-4">
                        {controls}
                    </div>
                </footer>
            )}
        </div>
    );
};

export default PhaseLayout;