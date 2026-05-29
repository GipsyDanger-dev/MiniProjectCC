import React from "react";
import RoomTabs from "./RoomTabs";

export default function RoomSelectionBanner({ rooms, activeRoomId, loading = false, onChange }) {
    return (
        <section className="py-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] min-h-[120px]" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(26,21,37,0.9) 100%)' }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
                <div className="relative p-4 md:p-5 space-y-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] text-violet border border-violet/30 bg-violet/10 font-semibold uppercase tracking-[0.1em]">Monitoring zone</span>
                    {rooms.length ? <RoomTabs rooms={rooms} activeRoomId={activeRoomId} onChange={onChange} /> : <p className="text-xs text-muted-foreground">{loading ? "Loading rooms..." : "No rooms found"}</p>}
                </div>
            </div>
        </section>
    );
}
