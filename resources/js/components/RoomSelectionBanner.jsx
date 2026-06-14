import React from "react";
import RoomTabs from "./RoomTabs";

export default function RoomSelectionBanner({ rooms, activeRoomId, loading = false, onChange }) {
    return (
        <section className="py-3 sm:py-4">
            <div className="relative overflow-hidden rounded-lg border border-[#212327] min-h-[90px] sm:min-h-[120px]" style={{ background: '#191919' }}>
                {/* Indigo + white ambient glow */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: `
                        radial-gradient(ellipse 50% 80% at 20% 50%, rgba(124,58,237,0.06) 0%, transparent 60%),
                        radial-gradient(ellipse 40% 70% at 80% 50%, rgba(196,181,253,0.04) 0%, transparent 60%),
                        radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 50%)
                    `
                }} />
                {/* Subtle grid lines */}
                <div className="absolute inset-0 pointer-events-none opacity-30" style={{
                    backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)'
                }} />

                <div className="relative p-3 sm:p-4 md:p-5 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-[9999px] text-[10px] sm:text-[11px] text-white border border-[#212327] bg-[#1a1c20] font-normal uppercase tracking-[1.2px] sm:tracking-[1.4px]" style={{ fontFamily: "'Geist Mono', monospace" }}>
                            Monitoring zone
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#c4b5fd]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd] animate-pulse" />
                            {rooms.length} device{rooms.length !== 1 ? 's' : ''} online
                        </span>
                    </div>
                    {rooms.length ? <RoomTabs rooms={rooms} activeRoomId={activeRoomId} onChange={onChange} /> : <p className="text-xs text-[#7d8187]">{loading ? "Loading rooms..." : "No rooms found"}</p>}
                </div>
            </div>
        </section>
    );
}
