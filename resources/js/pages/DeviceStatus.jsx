import React from "react";
import {
    BellRing,
    Cpu,
    Fan,
    Monitor,
} from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

const deviceCards = [
    {
        title: "ESP32 Microcontroller",
        status: "ONLINE",
        icon: Cpu,
        details: ["Health 98%", "Uptime 4h 52m", "IP Address 192.168.1.4"],
    },
    {
        title: "Exhaust Fan",
        status: "RUNNING",
        icon: Fan,
        value: "66%",
        details: ["Fuzzy: MEDIUM-HIGH", "Running today: 2h 14m"],
    },
    {
        title: "Buzzer",
        status: "SILENT",
        icon: BellRing,
        value: "Silent",
        details: ["Last trigger: 38 mins ago", "Triggers today: 4"],
    },
    {
        title: "OLED Display",
        status: "CONNECTED",
        icon: Monitor,
        details: ["SentinelIoT", "Status: AMAN", "Gas: 328ppm"],
    },
];

function GaugeCard({ title, value, color }) {
    return (
        <article className="rounded-[20px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_58%,rgba(99,102,241,0.12))] p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
            <div className="mt-2 h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        innerRadius="68%"
                        outerRadius="96%"
                        data={[{ name: title, value, fill: color }]}
                        startAngle={90}
                        endAngle={-270}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={99} background />
                        <text
                            x="50%"
                            y="47%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#fff"
                            fontSize="34"
                            fontWeight="700"
                        >
                            {value}%
                        </text>
                        <text
                            x="50%"
                            y="63%"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="rgba(255,255,255,0.6)"
                            fontSize="11"
                        >
                            Live metric
                        </text>
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
        </article>
    );
}

export default function DeviceStatus({ activeRoom, iot }) {
    const latest = iot.latestReading;
    const emergency = iot.data?.emergency_status || "AMAN";
    const workerOnline = Boolean(iot.data?.worker_online);
    const latestCommand = iot.data?.latest_command;
    const checks = [
        { endpoint: "GET /api/dashboard/data", latency: iot.error ? "--" : "ok", ok: !iot.error },
        { endpoint: "POST /api/ingest", latency: latest ? "live" : "--", ok: Boolean(latest) },
        { endpoint: "GET /api/command/get", latency: workerOnline ? "active" : "--", ok: workerOnline },
        { endpoint: "POST /api/status/update", latency: latestCommand ? "recent" : "--", ok: Boolean(latestCommand) },
    ];

    const cards = [
        deviceCards[0],
        {
            ...deviceCards[1],
            status:
                latestCommand?.target_device === "exhaust_fan" &&
                latestCommand?.action === "START"
                    ? "RUNNING"
                    : "IDLE",
            value:
                latestCommand?.target_device === "exhaust_fan" &&
                latestCommand?.action === "START"
                    ? "ON"
                    : "OFF",
        },
        {
            ...deviceCards[2],
            status:
                latestCommand?.target_device === "buzzer" &&
                latestCommand?.action === "START"
                    ? "ACTIVE"
                    : "SILENT",
            value:
                latestCommand?.target_device === "buzzer" &&
                latestCommand?.action === "START"
                    ? "On"
                    : "Silent",
        },
        {
            ...deviceCards[3],
            details: [
                "SentinelIoT",
                `Status: ${emergency}`,
                `Gas: ${Math.round(Number(latest?.gas_value || 0))}ppm`,
            ],
        },
    ];

    return (
        <div className="pb-6 space-y-5">
            <div>
                <h1 className="text-4xl font-semibold text-foreground">Device Status</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Hardware, connectivity, and server diagnostics
                </p>
            </div>

            <section className="rounded-[20px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_58%,rgba(99,102,241,0.1))] p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            3D Room Model
                        </p>
                        <h2 className="text-2xl font-semibold mt-1">{activeRoom}</h2>
                    </div>
                    <span className="inline-flex px-2 py-1 rounded-full border border-success/30 bg-success/20 text-success text-[10px] font-semibold">
                        {emergency}
                    </span>
                </div>
                <div className="mt-3 h-[220px] rounded-[16px] border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(204,255,0,0.1),transparent_55%),linear-gradient(180deg,#090b16,#070913)] relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(transparent,rgba(30,35,60,0.5))]" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[160px] border border-white/10 rotate-[-12deg] rounded-xl" />
                    <div className="absolute left-[42%] top-[42%] text-[10px] px-2 py-1 rounded-full bg-black/45 border border-lime/35 text-lime">
                        MQ-2 {Math.round(Number(latest?.gas_value || 0))}ppm
                    </div>
                    <div className="absolute left-[50%] top-[58%] text-[10px] px-2 py-1 rounded-full bg-black/45 border border-pink-400/35 text-pink-300">
                        KY-026 {Math.round(Number(latest?.flame_value || 0))}
                    </div>
                    <div className="absolute left-[55%] top-[30%] text-[10px] px-2 py-1 rounded-full bg-black/45 border border-cyan-300/35 text-cyan-200">
                        DHT-22 {Math.round(Number(latest?.temperature || 0))}°C
                    </div>
                </div>
            </section>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <article
                        key={card.title}
                        className="rounded-[18px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03)_60%,rgba(99,102,241,0.1))] p-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-black/30 border border-white/10 inline-flex items-center justify-center">
                                    <card.icon className="w-4 h-4 text-lime" />
                                </span>
                                <div>
                                    <h3 className="text-sm font-semibold">{card.title}</h3>
                                    <p className="text-[10px] text-success mt-0.5">{card.status}</p>
                                </div>
                            </div>
                            {card.value ? (
                                <span className="text-4xl leading-none font-semibold">{card.value}</span>
                            ) : null}
                        </div>
                        <div className="mt-3 space-y-1">
                            {card.details.map((detail) => (
                                <p key={detail} className="text-xs text-muted-foreground">
                                    {detail}
                                </p>
                            ))}
                        </div>
                    </article>
                ))}
            </div>

            <section className="grid gap-3 xl:grid-cols-[2fr_1fr_1fr]">
                <article className="rounded-[20px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_58%,rgba(99,102,241,0.12))] p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Server Status</h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                Laravel API & database health
                            </p>
                        </div>
                        <span className="inline-flex px-2 py-1 rounded-full border border-success/30 bg-success/20 text-success text-[10px] font-semibold">
                            {workerOnline ? "Operational" : "Degraded"}
                        </span>
                    </div>
                    <div className="mt-4 space-y-2">
                        {checks.map((check) => (
                            <div
                                key={check.endpoint}
                                className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-3 py-2"
                            >
                                <span className="inline-flex items-center gap-2 text-sm">
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            check.ok ? "bg-success" : "bg-danger"
                                        }`}
                                    />
                                    {check.endpoint}
                                </span>
                                <span className="text-xs text-muted-foreground">{check.latency}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                            <p className="text-muted-foreground">Database</p>
                            <p className="text-sm font-semibold mt-1">Connected</p>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                            <p className="text-muted-foreground">Uptime</p>
                            <p className="text-sm font-semibold mt-1">
                                {workerOnline ? "99.94%" : "95.10%"}
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/8 bg-black/20 p-3">
                            <p className="text-muted-foreground">Latency</p>
                            <p className="text-sm font-semibold mt-1">
                                {iot.lastUpdated
                                    ? iot.lastUpdated.toLocaleTimeString("en-GB", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })
                                    : "--"}
                            </p>
                        </div>
                    </div>
                </article>
                <GaugeCard title="System Uptime" value={99} color="#ccff00" />
                <GaugeCard title="Alerts Resolved" value={82} color="#22c55e" />
            </section>
        </div>
    );
}
