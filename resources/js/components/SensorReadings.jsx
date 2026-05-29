import React, { useMemo, useState } from "react";

export default function SensorReadings({ readings = [] }) {
    const metrics = ["Gas", "Api", "Kelembapan", "Suhu"];
    const [active, setActive] = useState("Gas");
    const MAX_POINTS = 8;
    const fallbackLabels = [
        "12:00",
        "12:05",
        "12:10",
        "12:15",
        "12:20",
        "12:25",
        "12:30",
    ];

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
            Suhu: series.map((item) =>
                Math.round(Number(item.temperature) || 0),
            ),
        };
    }, [readings]);

    const series = values[active];
    const max = Math.max(...series);

    return (
        <div className="card-surface p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-3xl font-semibold">Sensor Readings</h3>
                    <p className="text-muted-foreground mt-1">
                        Live data over last 30 minutes
                    </p>
                </div>
                <div className="inline-flex rounded-full bg-muted/40 p-1">
                    {metrics.map((metric) => (
                        <button
                            key={metric}
                            type="button"
                            onClick={() => setActive(metric)}
                            className={`px-4 py-2 rounded-full text-sm transition-smooth ${
                                active === metric
                                    ? "bg-card text-foreground"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {metric}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 overflow-x-auto thin-scroll pb-1">
                <div className="flex gap-2 md:gap-3 min-w-max">
                {series.map((value, idx) => {
                    const height = Math.max(
                        34,
                        Math.round((value / max) * 100),
                    );
                    return (
                        <div
                            key={values.labels[idx]}
                            className="text-center w-[58px] md:w-[62px] shrink-0"
                        >
                            <div className="text-xs text-muted-foreground mb-3 min-h-4">
                                {idx === 0 || idx === 4
                                    ? `${value}${active === "Gas" ? " ppm" : active === "Kelembapan" ? "%" : active === "Suhu" ? "°C" : ""}`
                                    : ""}
                            </div>
                            <div className="h-56 rounded-[30px] bg-[#0f1118] border border-white/5 relative overflow-hidden p-1">
                                <div
                                    className="absolute bottom-1 left-1 right-1 rounded-[24px] bg-lime transition-all duration-500 shadow-[0_0_24px_rgba(204,255,0,0.28)]"
                                    style={{ height: `${height}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                {values.labels[idx]}
                            </p>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
    );
}
