import React, { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const sensorCharts = [
    { key: "gas", label: "Gas (PPM)", stroke: "#ccff00", gradient: "gasGradient", threshold: 500 },
    { key: "smoke", label: "Smoke (PPM)", stroke: "#54a7ff", gradient: "smokeGradient", threshold: 250 },
    { key: "temp", label: "Temperature (°C)", stroke: "#f59e0b", gradient: "tempGradient", threshold: 45 },
    { key: "flame", label: "Flame (%)", stroke: "#f97316", gradient: "flameGradient", threshold: 20 },
];

export default function SensorData({ activeRoom, iot }) {
    const [activeRange, setActiveRange] = useState("1H");
    const rawRows = iot.data?.sensor_data || [];
    const latest = rawRows[0];

    const baseTrend = useMemo(() => {
        if (!rawRows.length) {
            return [
                { time: "12:00", gas: 440, smoke: 210, temp: 34, flame: 8 },
                { time: "12:05", gas: 470, smoke: 215, temp: 36, flame: 11 },
                { time: "12:10", gas: 485, smoke: 225, temp: 38, flame: 9 },
                { time: "12:15", gas: 512, smoke: 238, temp: 41, flame: 15 },
                { time: "12:20", gas: 468, smoke: 218, temp: 39, flame: 12 },
                { time: "12:25", gas: 421, smoke: 221, temp: 36, flame: 10 },
                { time: "12:30", gas: 430, smoke: 195, temp: 35, flame: 6 },
            ];
        }

        return [...rawRows].slice(0, 12).reverse().map((item) => ({
            time: new Date(item.created_at).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            gas: Math.round(Number(item.gas_value) || 0),
            smoke: Math.round(Number(item.smoke_value) || 0),
            temp: Math.round(Number(item.temperature) || 0),
            flame: Math.round(Number(item.flame_value) || 0),
        }));
    }, [rawRows]);
    const chartData = useMemo(() => {
        if (activeRange === "6H") {
            return baseTrend.map((item) => ({
                ...item,
                gas: Math.round(item.gas * 0.94),
                smoke: Math.round(item.smoke * 0.97),
                temp: Math.round(item.temp * 0.95),
                flame: Math.round(item.flame * 0.9),
            }));
        }
        if (activeRange === "24H") {
            return baseTrend.map((item, idx) => ({
                ...item,
                gas: Math.round(item.gas * (0.88 + (idx % 3) * 0.02)),
                smoke: Math.round(item.smoke * (0.9 + (idx % 4) * 0.02)),
                temp: Math.round(item.temp * (0.9 + (idx % 3) * 0.015)),
                flame: Math.round(item.flame * (0.82 + (idx % 5) * 0.04)),
            }));
        }
        if (activeRange === "7D") {
            return baseTrend.map((item, idx) => ({
                ...item,
                gas: Math.round(item.gas * (0.82 + (idx % 5) * 0.025)),
                smoke: Math.round(item.smoke * (0.86 + (idx % 4) * 0.03)),
                temp: Math.round(item.temp * (0.88 + (idx % 4) * 0.02)),
                flame: Math.round(item.flame * (0.78 + (idx % 6) * 0.05)),
            }));
        }
        return baseTrend;
    }, [activeRange, baseTrend]);

    const metricCards = [
        {
            title: "Gas Level",
            value: Math.round(Number(latest?.gas_value || 0)),
            unit: "ppm",
            delta:
                latest && Number(latest.gas_value) > 250 ? "Alert" : "Normal",
        },
        {
            title: "Smoke Level",
            value: Math.round(Number(latest?.smoke_value || 0)),
            unit: "ppm",
            delta:
                latest && Number(latest.smoke_value) > 120 ? "Alert" : "Normal",
        },
        {
            title: "Temperature",
            value: Math.round(Number(latest?.temperature || 0)),
            unit: "°C",
            delta:
                latest && Number(latest.temperature) > 40 ? "Alert" : "Normal",
        },
        {
            title: "Flame",
            value:
                latest && Number(latest.flame_value) < 500 ? "DETECTED" : "CLEAR",
            unit: "",
            delta: latest?.status_indikasi || "Stable",
        },
    ];

    const rawReadings = rawRows.slice(0, 24).map((item) => [
        new Date(item.created_at).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        `${Math.round(Number(item.gas_value) || 0)}`,
        `${Math.round(Number(item.smoke_value) || 0)}`,
        `${Math.round(Number(item.temperature) || 0)}`,
        Number(item.flame_value) < 500 ? "DETECTED" : "CLEAR",
        item.status_indikasi || "AMAN",
    ]);

    return (
        <div className="pb-6 space-y-5">
            <div>
                <h1 className="text-4xl font-semibold text-foreground">Sensor Data</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Detailed readings for <span className="text-foreground">{activeRoom}</span>
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map((card, idx) => (
                    <div
                        key={card.title}
                        className={`relative isolate overflow-hidden rounded-[18px] border border-white/10 backdrop-blur-xl p-4 ${
                            idx === 2
                                ? "bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03)_60%,rgba(204,255,0,0.15))]"
                                : "bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03)_60%,rgba(99,102,241,0.10))]"
                        }`}
                    >
                        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {card.title}
                        </span>
                        <div className="mt-3 flex items-end justify-between">
                            <p className="text-4xl font-semibold leading-none">
                                {card.value}
                                {card.unit ? (
                                    <span className="text-lg text-muted-foreground ml-1">
                                        {card.unit}
                                    </span>
                                ) : null}
                            </p>
                            <span className="text-xs text-lime">{card.delta}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative isolate overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_58%,rgba(102,126,234,0.11))] p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">Sensor Trends</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Multi-sensor overlay with danger threshold
                        </p>
                    </div>
                    <div className="inline-flex rounded-full bg-black/25 border border-white/10 p-1 text-xs">
                        {["1H", "6H", "24H", "7D"].map((item, i) => (
                            <button
                                key={item}
                                className={`px-3 py-1 rounded-full transition-smooth ${
                                    activeRange === item
                                        ? "bg-card text-foreground"
                                        : "text-muted-foreground"
                                }`}
                                type="button"
                                onClick={() => setActiveRange(item)}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {sensorCharts.map((sensor) => (
                        <div
                            key={sensor.key}
                            className="h-[220px] rounded-[16px] border border-white/10 bg-black/25 p-2"
                        >
                            <div className="px-2 pt-1 text-xs font-medium text-muted-foreground">
                                {sensor.label}
                            </div>
                            <ResponsiveContainer width="100%" height="92%">
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 14, right: 10, left: -12, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ccff00" stopOpacity={0.45} />
                                            <stop offset="100%" stopColor="#ccff00" stopOpacity={0.03} />
                                        </linearGradient>
                                        <linearGradient id="smokeGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4ba2ff" stopOpacity={0.42} />
                                            <stop offset="100%" stopColor="#4ba2ff" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.42} />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="flameGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f97316" stopOpacity={0.42} />
                                            <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="4 6"
                                        stroke="rgba(255,255,255,0.08)"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                        minTickGap={20}
                                    />
                                    <YAxis
                                        tick={{ fill: "rgba(255,255,255,0.42)", fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={30}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: "rgba(13,16,26,0.92)",
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            borderRadius: "12px",
                                            color: "#fff",
                                        }}
                                        labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                                    />
                                    <ReferenceLine
                                        y={sensor.threshold}
                                        stroke="rgba(255,75,75,0.6)"
                                        strokeDasharray="6 6"
                                        ifOverflow="extendDomain"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey={sensor.key}
                                        stroke={sensor.stroke}
                                        strokeWidth={2.4}
                                        fill={`url(#${sensor.gradient})`}
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0, fill: sensor.stroke }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative isolate overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_58%,rgba(99,102,241,0.12))] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">Raw Readings</h2>
                        <p className="text-xs text-muted-foreground">
                            {rawReadings.length} entries
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-10 rounded-full border border-white/10 bg-black/25 px-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Search className="w-4 h-4" />
                            <span>Filter</span>
                        </div>
                        <button
                            type="button"
                            className="h-10 rounded-full bg-lime text-lime-foreground px-4 font-semibold inline-flex items-center gap-2 shadow-[0_10px_30px_rgba(204,255,0,0.35)]"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="mt-4 overflow-auto thin-scroll">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground border-b border-white/10">
                                <th className="text-left py-3">Timestamp</th>
                                <th className="text-left py-3">Gas (PPM)</th>
                                <th className="text-left py-3">Smoke (PPM)</th>
                                <th className="text-left py-3">Temp (°C)</th>
                                <th className="text-left py-3">Flame</th>
                                <th className="text-right py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rawReadings.map((row, index) => (
                                <tr
                                    key={`${row[0]}-${index}`}
                                    className="border-b border-white/5 hover:bg-white/5"
                                >
                                    <td className="py-3">{row[0]}</td>
                                    <td>{row[1]}</td>
                                    <td>{row[2]}</td>
                                    <td>{row[3]}</td>
                                    <td>{row[4]}</td>
                                    <td className="py-3 text-right">
                                        <span
                                            className={`inline-flex px-2 py-1 rounded-full text-[10px] border ${
                                                row[5] === "BAHAYA"
                                                    ? "bg-danger/20 text-danger border-danger/40"
                                                    : "bg-success/20 text-success border-success/40"
                                            }`}
                                        >
                                            {row[5]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
