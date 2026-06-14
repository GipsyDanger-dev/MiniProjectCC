import React, { useMemo, useState } from "react";
import GlassSurface from "./GlassSurface";

const THRESHOLDS = { Gas: 300, Smoke: 200, Temperature: 50, Flame: 20 };

// Color-coded bar: green = normal, yellow = warning, red = danger
function getBarStyle(v, threshold) {
    if (threshold <= 0) return { background: 'linear-gradient(to top, rgba(34,197,94,0.7), rgba(34,197,94,0.3))' };
    const ratio = v / threshold;
    if (ratio >= 1) {
        // DANGER — red
        return { background: 'linear-gradient(to top, rgba(239,68,68,0.8), rgba(239,68,68,0.4))' };
    }
    if (ratio >= 0.75) {
        // WARNING — yellow/amber
        return { background: 'linear-gradient(to top, rgba(245,158,11,0.7), rgba(245,158,11,0.3))' };
    }
    // NORMAL — green
    return { background: 'linear-gradient(to top, rgba(34,197,94,0.6), rgba(34,197,94,0.2))' };
}

function getBarColorClass(v, threshold) {
    if (threshold <= 0) return '';
    const ratio = v / threshold;
    if (ratio >= 1) return 'animate-danger-pulse';
    return '';
}

function getStatusLabel(v, threshold) {
    if (threshold <= 0) return { text: 'OK', color: 'text-[#22c55e]' };
    const ratio = v / threshold;
    if (ratio >= 1) return { text: 'BAHAYA', color: 'text-[#ef4444]' };
    if (ratio >= 0.75) return { text: 'WASPADA', color: 'text-[#f59e0b]' };
    return { text: 'AMAN', color: 'text-[#22c55e]' };
}

export default function SensorReadings({ readings = [] }) {
    const metrics = ["Gas", "Smoke", "Temperature", "Flame"];
    const [active, setActive] = useState("Gas");
    const MAX = 8;

    const values = useMemo(() => {
        const labels = ["12:00", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30"];
        if (!readings.length) return { labels: labels.slice(-MAX), Gas: [462, 301, 419, 388, 475, 452, 347, 295], Smoke: [250, 322, 294, 340, 301, 333, 290, 274], Temperature: [30, 32, 31, 33, 35, 34, 32, 31], Flame: [11, 18, 15, 22, 17, 13, 16, 14] };
        const s = [...readings].slice(0, MAX).reverse();
        return {
            labels: s.map(i => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date(i.created_at))),
            Gas: s.map(i => Math.round(Number(i.gas_value) || 0)),
            Smoke: s.map(i => Math.round(Number(i.smoke_value) || 0)),
            Temperature: s.map(i => Math.round(Number(i.temperature) || 0)),
            Flame: s.map(i => Math.round(Number(i.flame_value) || 0)),
        };
    }, [readings]);

    const series = values[active];
    const max = Math.max(...series);
    const threshold = THRESHOLDS[active] || 0;
    const thresholdPct = Math.min(100, Math.round((threshold / max) * 100));
    const unit = active === "Gas" || active === "Smoke" ? "ppm" : active === "Temperature" ? "°C" : "";

    // Current status based on latest value
    const latestVal = series[series.length - 1] || 0;
    const currentStatus = getStatusLabel(latestVal, threshold);

    return (
        <GlassSurface className="p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-normal text-white tracking-tight">Sensor Readings</h3>
                        <span className={`text-[10px] font-normal uppercase tracking-[1px] px-2 py-0.5 rounded-[9999px] ${currentStatus.color}`}
                            style={{
                                fontFamily: "'Geist Mono', monospace",
                                background: currentStatus.color.includes('ef4444') ? 'rgba(239,68,68,0.1)' : currentStatus.color.includes('f59e0b') ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                                border: `1px solid ${currentStatus.color.includes('ef4444') ? 'rgba(239,68,68,0.3)' : currentStatus.color.includes('f59e0b') ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.3)'}`
                            }}>
                            {currentStatus.text}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="live-dot" style={{ width: '6px', height: '6px' }} />
                        <p className="text-[11px] text-[#7d8187]">Live data</p>
                    </div>
                </div>
                <div className="inline-flex rounded-lg bg-[#0a0a0a] border border-[#212327] p-0.5 self-start">
                    {metrics.map(m => (
                        <button key={m} onClick={() => setActive(m)}
                            className={`px-2 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs transition-all duration-150 font-normal ${active === m ? "bg-white text-[#0a0a0a]" : "text-[#7d8187] hover:text-white"}`}>
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-3 text-[10px] text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace" }}>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#22c55e]" />Aman</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#f59e0b]" />Waspada</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#ef4444]" />Bahaya</span>
            </div>

            <div className="overflow-x-auto thin-scroll pb-1">
                <div className="flex gap-1.5 sm:gap-2 min-w-max">
                    {series.map((v, i) => {
                        const h = Math.max(30, Math.round((v / max) * 100));
                        const isOver = threshold > 0 && v >= threshold;
                        const isWarning = threshold > 0 && v >= threshold * 0.75 && v < threshold;
                        return (
                            <div key={values.labels[i]} className="text-center w-10 sm:w-14 shrink-0">
                                <div className="text-[9px] sm:text-[10px] mb-1.5 sm:mb-2 min-h-3 text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>
                                    {i === 0 || i === 4 || i === series.length - 1 ? `${v}${unit}` : ""}
                                </div>
                                <div className="h-36 sm:h-48 rounded-lg bg-[#0a0a0a] border border-[#212327] relative overflow-hidden p-1">
                                    {threshold > 0 && (
                                        <div className="absolute left-0.5 right-0.5 border-t border-dashed z-10"
                                             style={{
                                                 bottom: `${thresholdPct}%`,
                                                 transform: 'translateY(50%)',
                                                 borderColor: isOver ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.4)'
                                             }} />
                                    )}
                                    {/* Color-coded bar: green → yellow → red */}
                                    <div className={`absolute bottom-1 left-1 right-1 rounded-md transition-all duration-500 ${getBarColorClass(v, threshold)}`}
                                         style={{ height: `${h}%`, ...getBarStyle(v, threshold) }} />
                                </div>
                                <p className="text-[9px] sm:text-[10px] mt-1.5 sm:mt-2 text-[#7d8187]">{values.labels[i]}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </GlassSurface>
    );
}
