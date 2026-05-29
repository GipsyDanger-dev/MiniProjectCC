import React, { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import MagicBentoGrid from "../components/MagicBentoGrid";
import GlassSurface from "../components/GlassSurface";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const charts = [
    { key: "gas", label: "Gas (PPM)", stroke: "#7C3AED", g: "gasG", threshold: 500 },
    { key: "smoke", label: "Smoke (PPM)", stroke: "#54a7ff", g: "smokeG", threshold: 250 },
    { key: "temp", label: "Temp (°C)", stroke: "#f59e0b", g: "tempG", threshold: 45 },
    { key: "flame", label: "Flame (%)", stroke: "#f97316", g: "flameG", threshold: 20 },
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
        <div className="pb-5 space-y-5">
            <div><h1 className="text-2xl font-bold">Sensor Data</h1><p className="text-sm text-muted-foreground mt-0.5">Readings for <span className="text-foreground">{activeRoom}</span></p></div>

            <MagicBentoGrid enableSpotlight enableBorderGlow enableTilt enableMagnetism clickEffect glowColor="124, 58, 237" spotlightRadius={300} className="grid gap-3 grid-cols-2 xl:grid-cols-4">
                {cards.map(c => (
                    <GlassSurface key={c.title} className="p-4 bento-card bento-card--border-glow">
                        <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">{c.title}</span>
                        <div className="mt-2 flex items-end justify-between">
                            <p className="text-3xl font-bold">{c.value}{c.unit && <span className="text-sm text-muted-foreground ml-1">{c.unit}</span>}</p>
                            <span className="text-[11px] text-violet font-semibold">{c.delta}</span>
                        </div>
                    </GlassSurface>
                ))}
            </MagicBentoGrid>

            <GlassSurface className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div><h2 className="text-lg font-semibold">Sensor Trends</h2><p className="text-xs text-muted-foreground mt-0.5">Multi-sensor with threshold</p></div>
                    <div className="inline-flex rounded-lg bg-white/[0.05] border border-white/[0.08] p-0.5 text-xs">{["1H", "6H", "24H", "7D"].map(t => <button key={t} onClick={() => setRange(t)} className={`px-2.5 py-1 rounded-md transition-smooth ${range === t ? "bg-card text-foreground" : "text-muted-foreground"}`}>{t}</button>)}</div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    {charts.map(s => (
                        <div key={s.key} className="h-[200px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-2">
                            <div className="px-2 pt-1 text-[11px] font-medium text-muted-foreground">{s.label}</div>
                            <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                                    <defs><linearGradient id={s.g} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.stroke} stopOpacity={0.4} /><stop offset="100%" stopColor={s.stroke} stopOpacity={0.02} /></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="4 6" stroke="rgba(255,255,255,0.06)" vertical={false} />
                                    <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={20} />
                                    <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                                    <Tooltip contentStyle={{ background: "#1A1525", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: 12 }} />
                                    <ReferenceLine y={s.threshold} stroke="rgba(255,75,75,0.5)" strokeDasharray="6 6" />
                                    <Area type="monotone" dataKey={s.key} stroke={s.stroke} strokeWidth={2} fill={`url(#${s.g})`} dot={false} activeDot={{ r: 3, fill: s.stroke }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            </GlassSurface>

            <GlassSurface className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div><h2 className="text-lg font-semibold">Raw Readings</h2><p className="text-xs text-muted-foreground">{rows.length} entries</p></div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.05] px-2.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Search className="w-3.5 h-3.5" /><span>Filter</span></div>
                        <button className="h-8 rounded-lg bg-violet text-white px-3 font-semibold text-xs inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Export</button>
                    </div>
                </div>
                <div className="overflow-auto thin-scroll">
                    <table className="w-full min-w-[700px] text-sm">
                        <thead><tr className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground border-b border-white/[0.06] font-semibold"><th className="text-left py-2">Timestamp</th><th className="text-left py-2">Gas</th><th className="text-left py-2">Smoke</th><th className="text-left py-2">Temp</th><th className="text-left py-2">Flame</th><th className="text-right py-2">Status</th></tr></thead>
                        <tbody>{rows.map((r, i) => <tr key={`${r[0]}-${i}`} className="border-b border-white/[0.04] hover:bg-white/[0.02]"><td className="py-2">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td className="text-right"><span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] border font-semibold ${r[5] === "BAHAYA" ? "bg-danger/20 text-danger border-danger/30" : "bg-success/20 text-success border-success/30"}`}>{r[5]}</span></td></tr>)}</tbody>
                    </table>
                </div>
            </GlassSurface>
        </div>
    );
}
