import React, { useMemo, useState } from "react";
import GlassSurface from "./GlassSurface";

export default function SensorReadings({ readings = [] }) {
    const metrics = ["Gas", "Smoke", "Temperature", "Flame"];
    const [active, setActive] = useState("Gas");
    const MAX = 8;
    const labels = ["12:00", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30"];

    const values = useMemo(() => {
        if (!readings.length) return { labels: labels.slice(-MAX), Gas: [462, 301, 419, 388, 475, 452, 347, 295], Smoke: [250, 322, 294, 340, 301, 333, 290, 274], Temperature: [30, 32, 31, 33, 35, 34, 32, 31], Flame: [11, 18, 15, 22, 17, 13, 16, 14] };
        const s = [...readings].slice(0, MAX).reverse();
        return { labels: s.map(i => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date(i.created_at))), Gas: s.map(i => Math.round(Number(i.gas_value) || 0)), Smoke: s.map(i => Math.round(Number(i.smoke_value) || 0)), Temperature: s.map(i => Math.round(Number(i.temperature) || 0)), Flame: s.map(i => Math.round(Number(i.flame_value) || 0)) };
    }, [readings]);

    const series = values[active];
    const max = Math.max(...series);

    return (
        <GlassSurface className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div><h3 className="text-lg font-semibold">Sensor Readings</h3><p className="text-xs text-muted-foreground mt-0.5">Live data over last 30 min</p></div>
                <div className="inline-flex rounded-lg bg-white/[0.05] border border-white/[0.08] p-0.5">
                    {metrics.map(m => <button key={m} onClick={() => setActive(m)} className={`px-3 py-1 rounded-md text-xs transition-smooth ${active === m ? "bg-card text-foreground" : "text-muted-foreground"}`}>{m}</button>)}
                </div>
            </div>
            <div className="overflow-x-auto thin-scroll pb-1">
                <div className="flex gap-2 min-w-max">
                    {series.map((v, i) => {
                        const h = Math.max(30, Math.round((v / max) * 100));
                        return (
                            <div key={values.labels[i]} className="text-center w-14 shrink-0">
                                <div className="text-[10px] text-muted-foreground mb-2 min-h-3">{i === 0 || i === 4 ? `${v}${active === "Gas" ? "ppm" : ""}` : ""}</div>
                                <div className="h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06] relative overflow-hidden p-1">
                                    <div className="absolute bottom-1 left-1 right-1 rounded-xl bg-violet transition-all duration-500" style={{ height: `${h}%` }} />
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">{values.labels[i]}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </GlassSurface>
    );
}
