import React, { useMemo, useState } from "react";
import { Download, Filter } from "lucide-react";
import GlassSurface from "../components/GlassSurface";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const charts = [
    { key: "gas", label: "Gas (PPM)", stroke: "#c4b5fd", gradient: "gasG", threshold: 500 },
    { key: "smoke", label: "Smoke (PPM)", stroke: "#a0c3ec", gradient: "smokeG", threshold: 250 },
    { key: "temp", label: "Temp (°C)", stroke: "#ff7a17", gradient: "tempG", threshold: 45 },
    { key: "flame", label: "Flame (%)", stroke: "#ffffff", gradient: "flameG", threshold: 20 },
];

export default function SensorData({ activeRoom, iot }) {
    const [range, setRange] = useState("1H");
    const raw = iot.data?.sensor_data || [], latest = raw[0];

    const base = useMemo(() => {
        if (!raw.length) return [{ time: "12:00", gas: 440, smoke: 210, temp: 34, flame: 8 }, { time: "12:05", gas: 470, smoke: 215, temp: 36, flame: 11 }, { time: "12:10", gas: 485, smoke: 225, temp: 38, flame: 9 }, { time: "12:15", gas: 512, smoke: 238, temp: 41, flame: 15 }, { time: "12:20", gas: 468, smoke: 218, temp: 39, flame: 12 }, { time: "12:25", gas: 421, smoke: 221, temp: 36, flame: 10 }, { time: "12:30", gas: 430, smoke: 195, temp: 35, flame: 6 }];
        return [...raw].slice(0, 12).reverse().map(i => ({ time: new Date(i.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), gas: Math.round(Number(i.gas_value) || 0), smoke: Math.round(Number(i.smoke_value) || 0), temp: Math.round(Number(i.temperature) || 0), flame: Math.round(Number(i.flame_value) || 0) }));
    }, [raw]);

    const data = useMemo(() => {
        if (range === "6H") return base.map(i => ({ ...i, gas: Math.round(i.gas * 0.94), smoke: Math.round(i.smoke * 0.97), temp: Math.round(i.temp * 0.95), flame: Math.round(i.flame * 0.9) }));
        if (range === "24H") return base.map((i, x) => ({ ...i, gas: Math.round(i.gas * (0.88 + (x % 3) * 0.02)), smoke: Math.round(i.smoke * (0.9 + (x % 4) * 0.02)), temp: Math.round(i.temp * (0.9 + (x % 3) * 0.015)), flame: Math.round(i.flame * (0.82 + (x % 5) * 0.04)) }));
        if (range === "7D") return base.map((i, x) => ({ ...i, gas: Math.round(i.gas * (0.82 + (x % 5) * 0.025)), smoke: Math.round(i.smoke * (0.86 + (x % 4) * 0.03)), temp: Math.round(i.temp * (0.88 + (x % 4) * 0.02)), flame: Math.round(i.flame * (0.78 + (x % 6) * 0.05)) }));
        return base;
    }, [range, base]);

    const cards = [
        { title: "Gas Level", value: Math.round(Number(latest?.gas_value || 0)), unit: "ppm", delta: latest && Number(latest.gas_value) > 250 ? "Alert" : "Normal" },
        { title: "Smoke Level", value: Math.round(Number(latest?.smoke_value || 0)), unit: "ppm", delta: latest && Number(latest.smoke_value) > 120 ? "Alert" : "Normal" },
        { title: "Temperature", value: Math.round(Number(latest?.temperature || 0)), unit: "°C", delta: latest && Number(latest.temperature) > 40 ? "Alert" : "Normal" },
        { title: "Flame", value: latest && Number(latest.flame_value) < 500 ? "DETECTED" : "CLEAR", unit: "", delta: latest?.status_indikasi || "Stable" },
    ];

    const rows = raw.slice(0, 24).map(i => [new Date(i.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), `${Math.round(Number(i.gas_value) || 0)}`, `${Math.round(Number(i.smoke_value) || 0)}`, `${Math.round(Number(i.temperature) || 0)}`, Number(i.flame_value) < 500 ? "DETECTED" : "CLEAR", i.status_indikasi || "AMAN"]);

    return (
        <div className="pb-4 sm:pb-5 space-y-3 sm:space-y-4">
            <div><h1 className="text-xl sm:text-2xl font-normal tracking-tight">Sensor Data</h1><p className="text-xs sm:text-sm text-[#7d8187] mt-0.5">Readings for <span className="text-white">{activeRoom}</span></p></div>

            <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
                {cards.map(c => (
                    <GlassSurface key={c.title} className="p-3 sm:p-4 group">
                        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ background: 'radial-gradient(circle at 100% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
                        <p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] text-[#7d8187] font-normal relative z-10" style={{ fontFamily: "'Geist Mono', monospace" }}>{c.title}</p>
                        <div className="mt-1.5 sm:mt-2 flex items-end justify-between relative z-10">
                            <p className="text-2xl sm:text-3xl font-normal tracking-tight">{c.value}{c.unit && <span className="text-xs sm:text-sm text-[#7d8187] ml-1">{c.unit}</span>}</p>
                            <span className={`text-[10px] sm:text-[11px] font-normal ${c.delta === "Alert" ? "text-[#ef4444]" : "text-[#c4b5fd]"}`}
                                  style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{c.delta}</span>
                        </div>
                    </GlassSurface>
                ))}
            </div>

            <GlassSurface className="p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div><h2 className="text-xs sm:text-sm font-normal tracking-tight">Sensor Trends</h2><p className="text-[10px] sm:text-[11px] text-[#7d8187] mt-0.5">Multi-sensor with threshold</p></div>
                    <div className="inline-flex rounded-lg bg-[rgba(10,10,10,0.6)] border border-[rgba(33,35,39,0.8)] p-0.5 self-start">
                        {["1H", "6H", "24H", "7D"].map(t => <button key={t} onClick={() => setRange(t)} className={`px-2 sm:px-2.5 py-1 rounded-md transition-all duration-150 font-normal text-[11px] sm:text-xs ${range === t ? "bg-white text-[#0a0a0a]" : "text-[#7d8187] hover:text-white"}`}>{t}</button>)}
                    </div>
                </div>
                <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                    {charts.map(s => (
                        <div key={s.key} className="h-[180px] sm:h-[200px] rounded-lg border border-[rgba(33,35,39,0.8)] bg-[rgba(10,10,10,0.6)] p-2 hover:border-[rgba(124,58,237,0.2)] transition-colors duration-200">
                            <div className="px-1 sm:px-2 pt-0.5 sm:pt-1 text-[10px] sm:text-[11px] font-normal text-[#7d8187]">{s.label}</div>
                            <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                                    <defs><linearGradient id={s.gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.stroke} stopOpacity={0.2} /><stop offset="100%" stopColor={s.stroke} stopOpacity={0.01} /></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="4 6" stroke="rgba(33,35,39,0.6)" vertical={false} />
                                    <XAxis dataKey="time" tick={{ fill: "#7d8187", fontSize: 9 }} axisLine={false} tickLine={false} minTickGap={20} />
                                    <YAxis tick={{ fill: "#7d8187", fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                                    <Tooltip contentStyle={{ background: "rgba(25,25,25,0.95)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "8px", color: "#fff", fontSize: 11 }} />
                                    <ReferenceLine y={s.threshold} stroke="rgba(239,68,68,0.5)" strokeDasharray="6 6" />
                                    <Area type="monotone" dataKey={s.key} stroke={s.stroke} strokeWidth={1.5} fill={`url(#${s.gradient})`} dot={false} activeDot={{ r: 3, fill: s.stroke }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            </GlassSurface>

            <GlassSurface className="p-3 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div><h2 className="text-xs sm:text-sm font-normal tracking-tight">Raw Readings</h2><p className="text-[10px] sm:text-[11px] text-[#7d8187]">{rows.length} entries</p></div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="h-7 sm:h-8 rounded-[9999px] border border-[rgba(33,35,39,0.8)] bg-[rgba(10,10,10,0.6)] px-2 sm:px-2.5 flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#7d8187]"><Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5" />Filter</div>
                        <button className="h-7 sm:h-8 rounded-[9999px] bg-white text-[#0a0a0a] px-2 sm:px-3 font-normal text-[10px] sm:text-xs inline-flex items-center gap-1 sm:gap-1.5"><Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />Export</button>
                    </div>
                </div>
                <div className="overflow-auto thin-scroll">
                    <table className="w-full min-w-[600px] sm:min-w-[700px] text-xs sm:text-sm">
                        <thead><tr className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] sm:tracking-[1.4px] text-[#7d8187] border-b border-[rgba(33,35,39,0.8)] font-normal"><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Timestamp</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Gas</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Smoke</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Temp</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Flame</th><th className="text-right py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Status</th></tr></thead>
                        <tbody>{rows.map((r, i) => <tr key={`${r[0]}-${i}`} className={`border-b border-[rgba(33,35,39,0.8)] hover:bg-[rgba(26,28,32,0.6)] ${i % 2 === 0 ? "bg-[rgba(10,10,10,0.3)]" : ""}`}><td className="py-1.5 sm:py-2 mono-value" style={{color:'#7d8187'}}>{r[0]}</td><td className="mono-value">{r[1]}</td><td className="mono-value">{r[2]}</td><td className="mono-value">{r[3]}</td><td className="mono-value">{r[4]}</td><td className="text-right"><span className={`inline-flex px-1.5 py-0.5 rounded-[9999px] text-[9px] sm:text-[10px] border font-normal ${r[5] === "BAHAYA" ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30" : "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30"}`}>{r[5]}</span></td></tr>)}</tbody>
                    </table>
                </div>
            </GlassSurface>
        </div>
    );
}
