import React, { useMemo, useState } from "react";

export default function SensorReadings({ readings = [] }) {
    const metrics = ["Gas", "Api", "Kelembapan", "Suhu"];
    const [active, setActive] = useState("Gas");
    const [hovered, setHovered] = useState(null);
    const MAX_POINTS = 8;
    const fallbackLabels = ["12:00", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30"];

    const values = useMemo(() => {
        if (!readings.length) {
            return {
                labels: fallbackLabels.slice(-MAX_POINTS),
                timestamps: fallbackLabels.slice(-MAX_POINTS),
                Gas: [462, 301, 419, 388, 475, 452, 347, 295],
                Api: [3000, 3200, 2900, 3400, 3100, 3300, 2900, 2700],
                Kelembapan: [55, 60, 58, 62, 65, 63, 59, 57],
                Suhu: [30, 32, 31, 33, 35, 34, 32, 31],
            };
        }
        const series = [...readings].slice(0, MAX_POINTS).reverse();
        return {
            labels: series.map((item) =>
                new Intl.DateTimeFormat("id-ID", {
                    timeZone: "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }).format(new Date(item.created_at)),
            ),
            timestamps: series.map((item) =>
                new Intl.DateTimeFormat("id-ID", {
                    timeZone: "Asia/Jakarta",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }).format(new Date(item.created_at)),
            ),
            Gas: series.map((item) => Math.round(Number(item.gas_value) || 0)),
            Api: series.map((item) => Math.round(Number(item.flame_value) || 0)),
            Kelembapan: series.map((item) => Math.round(Number(item.humidity) || 0)),
            Suhu: series.map((item) => Math.round(Number(item.temperature) || 0)),
        };
    }, [readings]);

    const series = values[active];
    const max = Math.max(...series, 1);
    const thresholds = { Gas: 2500, Api: 500, Kelembapan: 70, Suhu: 45 };
    const threshold = thresholds[active] || 100;
    const units = { Gas: "PPM", Api: "Analog", Kelembapan: "%", Suhu: "°C" };

    return (
        <div className="bg-surface2 border border-edge rounded-lg shadow-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
                <p className="text-[12px] font-medium text-ink2">
                    Sensor Trend
                </p>
                <div className="flex gap-1">
                    {metrics.map((metric) => (
                        <button
                            key={metric}
                            type="button"
                            onClick={() => setActive(metric)}
                            className={`px-2.5 py-1 text-[11px] rounded-md transition-smooth ${
                                active === metric
                                    ? "bg-accent/10 text-accent font-medium"
                                    : "text-ink3 hover:text-ink2 hover:bg-surface3"
                            }`}
                        >
                            {metric}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-3">
                <div className="h-20 flex items-end gap-1 px-1 relative">
                    {series.map((value, idx) => {
                        const pct = Math.max(4, (value / Math.max(max, threshold * 1.2)) * 100);
                        // Flame (Api) is active-low: lower value = more dangerous
                        const isFlame = active === "Api";
                        const isDanger = isFlame ? value < threshold : value > threshold;
                        const isLow = isFlame ? value > threshold * 1.5 : value < threshold * 0.2;
                        const color = isDanger ? "bg-danger" : isLow ? "bg-edge" : "bg-success";
                        return (
                            <div
                                key={idx}
                                className="flex-1 min-w-0 relative flex items-end h-full"
                                onMouseEnter={() => setHovered(idx)}
                                onMouseLeave={() => setHovered(null)}
                            >
                                {hovered === idx && (
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 pointer-events-none">
                                        <div className="bg-ink text-surface text-[10px] px-2 py-1 whitespace-nowrap shadow-lg rounded-md">
                                            <div className="font-medium">{value} {units[active]}</div>
                                            <div className="text-ink3">{values.timestamps[idx]}</div>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-ink" />
                                    </div>
                                )}
                                <div
                                    className={`w-full transition-all duration-300 ${hovered === idx ? "opacity-100 brightness-125" : "opacity-80"} ${color}`}
                                    style={{ height: `${pct}%` }}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between px-1 pt-1">
                    {values.labels.map((l, i) => (
                        <span key={i} className="text-[10px] text-ink3 tracking-[0.04em]">{l}</span>
                    ))}
                </div>
                <div className="flex gap-3 pt-2">
                    <div className="flex items-center gap-1 text-[10px] text-ink3 uppercase tracking-[0.06em]">
                        <span className="w-1.5 h-1.5 bg-success" /> Normal
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-ink3 uppercase tracking-[0.06em]">
                        <span className="w-1.5 h-1.5 bg-danger" /> Alert
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-ink3 uppercase tracking-[0.06em]">
                        <span className="w-1.5 h-1.5 bg-edge" /> Low
                    </div>
                </div>
            </div>
        </div>
    );
}
