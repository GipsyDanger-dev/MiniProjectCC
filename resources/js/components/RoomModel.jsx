import React from "react";
import GlassSurface from "./GlassSurface";

export default function RoomModel({ room }) {
    return (
        <GlassSurface className="p-3 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] sm:tracking-[1.4px] font-normal text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace" }}>3D Room Model</p>
                    <h3 className="text-base sm:text-lg font-normal text-white mt-0.5 tracking-tight">{room}</h3>
                </div>
                <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-[9999px] text-[10px] sm:text-[11px] font-normal bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 uppercase tracking-[1px]" style={{ fontFamily: "'Geist Mono', monospace" }}>
                    Aman
                </span>
            </div>
            {/* Large room visualization */}
            <div className="relative rounded-lg border border-[#212327] bg-[#0a0a0a] overflow-hidden" style={{ minHeight: '280px' }}>
                {/* Ambient indigo glow in the room */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: `
                        radial-gradient(circle at 15% 25%, rgba(124,58,237,0.08) 0%, transparent 45%),
                        radial-gradient(circle at 85% 75%, rgba(196,181,253,0.05) 0%, transparent 45%),
                        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 50%)
                    `
                }} />
                {/* Grid floor lines */}
                <div className="absolute inset-0 pointer-events-none opacity-25" style={{
                    backgroundImage: 'linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    transform: 'perspective(300px) rotateX(15deg)',
                    transformOrigin: 'bottom center',
                    maskImage: 'linear-gradient(to top, black 30%, transparent 80%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 30%, transparent 80%)'
                }} />

                {/* Sensor labels with colored dots */}
                <div className="absolute left-4 sm:left-8 top-4 sm:top-8 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#c4b5fd] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] text-[#dadbdf] px-2 py-0.5 rounded-md bg-[#0a0a0a]/80 border border-[#212327]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>MQ-2 · 366ppm</span>
                </div>
                <div className="absolute right-4 sm:right-8 top-12 sm:top-20 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ff7a17] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] text-[#dadbdf] px-2 py-0.5 rounded-md bg-[#0a0a0a]/80 border border-[#212327]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>DHT22 · 35°C</span>
                </div>
                <div className="absolute left-1/3 bottom-6 sm:bottom-10 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a0c3ec] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] text-[#dadbdf] px-2 py-0.5 rounded-md bg-[#0a0a0a]/80 border border-[#212327]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>KY-026 · 26%</span>
                </div>

                {/* Center room outline */}
                <div className="absolute inset-8 sm:inset-16 border border-dashed border-[#212327] rounded-lg pointer-events-none" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-[#363a3f]" style={{ fontFamily: "'Geist Mono', monospace" }}>Room visualization placeholder</span>
                </div>
            </div>
        </GlassSurface>
    );
}
