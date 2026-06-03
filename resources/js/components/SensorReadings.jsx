import React, { useMemo, useState } from "react";

export default function SensorReadings({ readings = [] }) {
    const metrics = ["Gas", "Api", "Kelembapan", "Suhu"];
    const [active, setActive] = useState("Gas");
    const MAX_POINTS = 8;
    const fallbackLabels = ["12:00", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30"];

    const values = useMemo(() => {
        if (!readings.length) {
            return {
                labels: fallbackLabels.slice(-MAX_POINTS),
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
    const thresholds = { Gas: 250, Api: 500, Kelembapan: 70, Suhu: 40 };
    const threshold = thresholds[active] || 100;

    return (
        <div className="bg-surface2 border border-edge">
            <div className="flex items-center justify-between px-3 py-2 border-b border-edge">
                <p className="text-[9px] font-medium uppercase tracking-[0.10em] text-ink2">
                    Sensor Trend
                </p>
                <div className="flex">
                    {metrics.map((metric) => (
                        <button
                            key={metric}
                            type="button"
                            onClick={() => setActive(metric)}
                            className={`px-2.5 py-1 text-[9px] uppercase tracking-[0.08em] border border-r-0 last:border-r transition-smooth ${
                                active === metric
                                    ? "bg-surface text-accent border-accent"
                                    : "bg-surface3 text-ink3 border-edge"
                            }`}
                        >
                            {metric}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-3">
                <div className="h-20 flex items-end gap-1 px-1">
                    {series.map((value, idx) => {
                        const pct = Math.max(4, (value / Math.max(max, threshold * 1.2)) * 100);
                        const color = value > threshold ? "bg-danger" : value < threshold * 0.2 ? "bg-edge" : "bg-accent";
                        return (
                            <div key={idx} className={`flex-1 min-w-0 transition-all duration-300 ${color}`} style={{ height: `${pct}%` }} />
                        );
                    })}
                </div>
                <div className="flex justify-between px-1 pt-1">
                    {values.labels.map((l, i) => (
                        <span key={i} className="text-[9px] text-ink3 tracking-[0.04em]">{l}</span>
                    ))}
                </div>
                <div className="flex gap-3 pt-2">
                    <div className="flex items-center gap-1 text-[9px] text-ink3 uppercase tracking-[0.06em]">
                        <span className="w-1.5 h-1.5 bg-accent" /> Normal
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-ink3 uppercase tracking-[0.06em]">
                        <span className="w-1.5 h-1.5 bg-danger" /> Alert
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-ink3 uppercase tracking-[0.06em]">
                        <span className="w-1.5 h-1.5 bg-edge" /> Low
                    </div>
                </div>
            </div>
        </div>
    );
}
