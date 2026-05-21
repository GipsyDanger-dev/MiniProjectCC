import React from "react";

export default function RoomModel({ room, iot }) {
    const latest = iot?.latestReading;
    const emergency = iot?.data?.emergency_status || "AMAN";
    const gas = Math.round(Number(latest?.gas_value || 0));
    const temp = Math.round(Number(latest?.temperature || 0));
    const flame = Math.round(Number(latest?.flame_value || 0));

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
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                    emergency === "BAHAYA"
                        ? "bg-danger/20 text-danger"
                        : "bg-success/20 text-success"
                }`}>
                    {emergency}
                </span>
            </div>
            <div className="mt-6 relative h-56 rounded-2xl border border-border/40 bg-gradient-to-br from-muted/20 to-card overflow-hidden">
                <div className={`absolute inset-0 opacity-30 ${
                    emergency === "BAHAYA"
                        ? "bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.35),_transparent_55%)]"
                        : "bg-[radial-gradient(circle_at_top,_rgba(204,255,0,0.35),_transparent_55%)]"
                }`} />
                <div className="absolute left-6 top-8 text-[10px] px-2 py-1 rounded-full bg-black/45 border border-lime/35 text-lime">
                    MQ-2 · {gas}ppm
                </div>
                <div className="absolute right-8 top-20 text-[10px] px-2 py-1 rounded-full bg-black/45 border border-cyan-300/35 text-cyan-200">
                    DHT22 · {temp}°C
                </div>
                <div className="absolute left-1/3 bottom-10 text-[10px] px-2 py-1 rounded-full bg-black/45 border border-orange-400/35 text-orange-300">
                    KY-026 · {flame < 500 ? "DETECTED" : "CLEAR"}
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                    Room visualization placeholder
                </div>
            </div>
        </div>
    );
}
