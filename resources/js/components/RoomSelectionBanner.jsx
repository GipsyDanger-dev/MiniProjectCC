import React from "react";
import RoomTabs from "./RoomTabs";
import GlassSurface from "./GlassSurface";

export default function RoomSelectionBanner({ rooms, activeRoomId, loading = false, onChange }) {
    return (
        <section className="py-3 sm:py-4">
            <GlassSurface className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-[9999px] text-[10px] sm:text-[11px] text-white border border-[rgba(33,35,39,0.8)] bg-[rgba(26,28,32,0.6)] font-normal uppercase"
                          style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '1.2px' }}>
                        Monitoring Zone
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#c4b5fd]"
                          style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd] animate-pulse" />
                        {rooms.length} device{rooms.length !== 1 ? 's' : ''} online
                    </span>
                </div>
                {rooms.length ? (
                    <RoomTabs rooms={rooms} activeRoomId={activeRoomId} onChange={onChange} />
                ) : (
                    <p className="text-xs text-[#7d8187]">{loading ? "Loading rooms..." : "No rooms found"}</p>
                )}
            </GlassSurface>
        </section>
    );
}
