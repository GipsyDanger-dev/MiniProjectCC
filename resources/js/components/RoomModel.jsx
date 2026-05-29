import React from "react";
import GlassSurface from "./GlassSurface";

export default function RoomModel({ room }) {
    return (
        <GlassSurface className="p-5">
            <div className="flex items-center justify-between mb-4">
                <div><p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">3D Room Model</p><h3 className="text-lg font-semibold mt-0.5">{room}</h3></div>
                <span className="text-[10px] uppercase tracking-wider text-success font-semibold bg-success/10 px-2 py-0.5 rounded-full">Aman</span>
            </div>
            <div className="relative h-48 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                <div className="absolute left-5 top-6 text-[10px] text-muted-foreground">MQ-2 · 366ppm</div>
                <div className="absolute right-6 top-16 text-[10px] text-muted-foreground">DHT22 · 35°C</div>
                <div className="absolute left-1/3 bottom-8 text-[10px] text-muted-foreground">KY-026 · 26%</div>
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Room visualization placeholder</div>
            </div>
        </GlassSurface>
    );
}
