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


export default function SensorData({ activeRoom, iot }) {
    const [activeRange, setActiveRange] = useState("1H");
    const [searchTerm, setSearchTerm] = useState("");
    const rawRows = iot.data?.sensor_data || [];
    const latest = rawRows[0];
    const settings = iot.data?.settings || {};
    const gasTh = Number(settings.gas_threshold) || 2500;
    const flameTh = Number(settings.flame_threshold) || 500;
    const humidityTh = Number(settings.humidity_threshold) || 70;
    const tempTh = Number(settings.temperature_threshold) || 45;

    const sensorCharts = [
        { key: "gas", label: "Gas (PPM)", stroke: "#c45a0a", gradient: "gasGradient", threshold: gasTh },
        { key: "flame", label: "Api (Analog)", stroke: "#dc2626", gradient: "flameGradient", threshold: flameTh },
        { key: "humidity", label: "Kelembapan (%)", stroke: "#9a7b4f", gradient: "humidityGradient", threshold: humidityTh },
        { key: "temp", label: "Suhu (°C)", stroke: "#b45309", gradient: "tempGradient", threshold: tempTh },
    ];

    const exportCSV = () => {
        const header = "Timestamp,Gas,Api,Suhu,Kelembapan,Status\n";
        const rows = rawRows.map((r) =>
            `${r.created_at},${r.gas_value},${r.flame_value},${r.temperature},${r.humidity || 0},${r.status_indikasi}`
        ).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sensor_data.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const baseTrend = useMemo(() => {
        if (!rawRows.length) {
            return [
                { time: "12:00", gas: 440, flame: 3200, humidity: 55, temp: 34 },
                { time: "12:05", gas: 470, flame: 3100, humidity: 58, temp: 36 },
                { time: "12:10", gas: 485, flame: 2900, humidity: 60, temp: 38 },
                { time: "12:15", gas: 512, flame: 2800, humidity: 62, temp: 41 },
                { time: "12:20", gas: 468, flame: 3000, humidity: 59, temp: 39 },
                { time: "12:25", gas: 421, flame: 3300, humidity: 57, temp: 36 },
                { time: "12:30", gas: 430, flame: 3400, humidity: 55, temp: 35 },
            ];
        }

        return [...rawRows].slice(0, 12).reverse().map((item) => ({
            time: new Date(item.created_at).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            gas: Math.round(Number(item.gas_value) || 0),
            flame: Math.round(Number(item.flame_value) || 0),
            humidity: Math.round(Number(item.humidity) || 0),
            temp: Math.round(Number(item.temperature) || 0),
        }));
    }, [rawRows]);

    const chartData = useMemo(() => {
        if (activeRange === "6H") {
            return baseTrend.map((item) => ({
                ...item,
                gas: Math.round(item.gas * 0.94),
                flame: Math.round(item.flame * 0.97),
                humidity: Math.round(item.humidity * 0.98),
                temp: Math.round(item.temp * 0.95),
            }));
        }
        if (activeRange === "24H") {
            return baseTrend.map((item, idx) => ({
                ...item,
                gas: Math.round(item.gas * (0.88 + (idx % 3) * 0.02)),
                flame: Math.round(item.flame * (0.9 + (idx % 4) * 0.02)),
                humidity: Math.round(item.humidity * (0.92 + (idx % 3) * 0.015)),
                temp: Math.round(item.temp * (0.9 + (idx % 3) * 0.015)),
            }));
        }
        if (activeRange === "7D") {
            return baseTrend.map((item, idx) => ({
                ...item,
                gas: Math.round(item.gas * (0.82 + (idx % 5) * 0.025)),
                flame: Math.round(item.flame * (0.86 + (idx % 4) * 0.03)),
                humidity: Math.round(item.humidity * (0.88 + (idx % 4) * 0.02)),
                temp: Math.round(item.temp * (0.88 + (idx % 4) * 0.02)),
            }));
        }
        return baseTrend;
    }, [activeRange, baseTrend]);

    const metricCards = [
        { title: "Gas", value: Math.round(Number(latest?.gas_value || 0)), unit: "ppm", delta: latest && Number(latest.gas_value) > gasTh ? "Alert" : "Normal" },
        { title: "Api", value: Math.round(Number(latest?.flame_value || 0)), unit: "Analog", delta: latest && Number(latest.flame_value) < flameTh ? "Alert" : "Normal" },
        { title: "Kelembapan", value: Math.round(Number(latest?.humidity || 0)), unit: "%", delta: latest && Number(latest.humidity) > humidityTh ? "Alert" : "Normal" },
        { title: "Suhu", value: Math.round(Number(latest?.temperature || 0)), unit: "°C", delta: latest && Number(latest.temperature) > tempTh ? "Alert" : "Normal" },
    ];

    const allReadings = rawRows.slice(0, 24).map((item) => [
        new Date(item.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        `${Math.round(Number(item.gas_value) || 0)}`,
        `${Math.round(Number(item.flame_value) || 0)}`,
        `${Math.round(Number(item.humidity || 0))}`,
        `${Math.round(Number(item.temperature) || 0)}`,
        item.status_indikasi || "AMAN",
    ]);

    const rawReadings = searchTerm
        ? allReadings.filter((row) =>
            row.some((cell) => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : allReadings;

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[12px] font-medium text-ink2">Sensor Data</p>
                    <p className="text-[11px] text-ink3 mt-0.5">Detailed readings for {activeRoom}</p>
                </div>
                <button
                    type="button"
                    onClick={exportCSV}
                    className="h-8 px-3 rounded-lg bg-accent text-accent-foreground text-[12px] font-medium inline-flex items-center gap-1.5 hover:bg-accent/90 transition-smooth"
                >
                    <Download className="w-3 h-3" />
                    Export CSV
                </button>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                {metricCards.map((card) => (
                    <div key={card.title} className="bg-surface2 border border-edge rounded-lg shadow-card px-4 py-3">
                        <p className="text-[11px] text-ink3">{card.title}</p>
                        <p className="text-lg font-semibold text-ink mt-1 tabular-nums">
                            {card.value}{card.unit ? <span className="text-[11px] text-ink3 ml-1">{card.unit}</span> : null}
                        </p>
                        <span className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                            card.delta === "Alert" ? "text-danger bg-danger/10" : "text-ink3 bg-surface3"
                        }`}>
                            {card.delta}
                        </span>
                    </div>
                ))}
            </div>

            <div className="bg-surface2 border border-edge rounded-lg shadow-card">
                <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
                    <p className="text-[12px] font-medium text-ink2">Sensor Trends</p>
                    <div className="flex gap-1">
                        {["1H", "6H", "24H", "7D"].map((item) => {
                            const isRealtime = item === "1H";
                            return (
                                <button
                                    key={item}
                                    type="button"
                                    disabled={!isRealtime}
                                    onClick={() => setActiveRange(item)}
                                    title={isRealtime ? "Real-time data" : "Historical data not available yet"}
                                    className={`px-2.5 py-1 text-[11px] rounded-md transition-smooth ${
                                        activeRange === item
                                            ? "bg-accent/10 text-accent font-medium"
                                            : isRealtime
                                                ? "text-ink3 hover:bg-surface3"
                                                : "text-ink3/40 cursor-not-allowed"
                                    }`}
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-3 grid gap-2 md:grid-cols-2">
                    {sensorCharts.map((sensor) => (
                        <div key={sensor.key} className="h-[180px] border border-edge bg-surface rounded-md p-2">
                            <div className="px-1 pt-0.5 text-[10px] uppercase tracking-[0.06em] text-ink3">
                                {sensor.label}
                            </div>
                            <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -14, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#c45a0a" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#c45a0a" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#9a7b4f" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#9a7b4f" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#b45309" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#b45309" stopOpacity={0.02} />
                                        </linearGradient>
                                        <linearGradient id="flameGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 6" stroke="rgba(26,26,24,0.08)" vertical={false} />
                                    <XAxis dataKey="time" tick={{ fill: "#8a8a82", fontSize: 9 }} axisLine={false} tickLine={false} minTickGap={20} />
                                    <YAxis tick={{ fill: "#8a8a82", fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                                    <Tooltip
                                        contentStyle={{
                                            background: "#1a1a18",
                                            border: "1px solid #3d3d38",
                                            borderRadius: 0,
                                            color: "#f4f2ec",
                                            fontSize: 10,
                                        }}
                                        labelStyle={{ color: "#8a8a82" }}
                                    />
                                    <ReferenceLine y={sensor.threshold} stroke="rgba(220,38,38,0.5)" strokeDasharray="6 6" ifOverflow="extendDomain" />
                                    <Area type="monotone" dataKey={sensor.key} stroke={sensor.stroke} strokeWidth={2} fill={`url(#${sensor.gradient})`} dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: sensor.stroke }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ))}
                </div>
                <div className="px-3 pb-2 flex gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-ink3 uppercase tracking-[0.06em]">
                        <span className="w-1.5 h-1.5 bg-accent" /> Normal
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-ink3 uppercase tracking-[0.06em]">
                        <span className="w-1.5 h-1.5 bg-danger" /> Alert
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-ink3 uppercase tracking-[0.06em]">
                        <span className="w-1.5 h-1.5 bg-edge" /> Threshold
                    </div>
                </div>
            </div>

            <div className="bg-surface2 border border-edge rounded-lg shadow-card">
                <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
                    <div>
                        <p className="text-[12px] font-medium text-ink2">Raw Readings</p>
                        <p className="text-[11px] text-ink3">{rawReadings.length} entries</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-7 border border-edge bg-surface px-2 flex items-center gap-1.5">
                            <Search className="w-3 h-3 text-ink3" />
                            <input
                                type="text"
                                placeholder="Filter..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-[10px] text-ink w-20 md:w-28 placeholder-ink3"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-auto thin-scroll">
                    <table className="w-full min-w-[640px]">
                        <thead>
                            <tr className="text-[11px] text-ink3 border-b border-edge">
                                <th className="text-left px-3 py-2">Timestamp</th>
                                <th className="text-left px-3 py-2">Gas (PPM)</th>
                                <th className="text-left px-3 py-2">Api (Analog)</th>
                                <th className="text-left px-3 py-2">Kelembapan (%)</th>
                                <th className="text-left px-3 py-2">Suhu (°C)</th>
                                <th className="text-right px-3 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rawReadings.map((row, index) => (
                                <tr key={`${row[0]}-${index}`} className="border-b border-edge hover:bg-surface3 transition-smooth">
                                    <td className="px-3 py-2 text-[10px] text-ink2 tabular-nums">{row[0]}</td>
                                    <td className="px-3 py-2 text-[10px] text-ink tabular-nums">{row[1]}</td>
                                    <td className="px-3 py-2 text-[10px] text-ink">{row[2]}</td>
                                    <td className="px-3 py-2 text-[10px] text-ink tabular-nums">{row[3]}</td>
                                    <td className="px-3 py-2 text-[10px] text-ink tabular-nums">{row[4]}</td>
                                    <td className="px-3 py-2 text-right">
                                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-medium rounded-md ${
                                            row[5] === "BAHAYA"
                                                ? "text-danger bg-danger/10"
                                                : "text-success bg-success/10"
                                        }`}>
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
