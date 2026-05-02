import React from "react";

export default function RoomModel({ room }) {
    return (
        <div className="card-surface p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        3D Room Model
                    </p>
                    <h3 className="text-lg font-semibold text-foreground mt-1">
                        {room}
                    </h3>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] uppercase tracking-wider bg-success/20 text-success">
                    Aman
                </span>
            </div>
            <div className="mt-6 relative h-56 rounded-2xl border border-border/40 bg-gradient-to-br from-muted/20 to-card overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(204,255,0,0.35),_transparent_55%)]" />
                <div className="absolute left-6 top-8 text-[10px] text-muted-foreground">
                    MQ-2 · 366ppm
                </div>
                <div className="absolute right-8 top-20 text-[10px] text-muted-foreground">
                    DHT22 · 35°C
                </div>
                <div className="absolute left-1/3 bottom-10 text-[10px] text-muted-foreground">
                    KY-026 · 26%
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                    Room visualization placeholder
                </div>
            </div>
        </div>
    );
}
