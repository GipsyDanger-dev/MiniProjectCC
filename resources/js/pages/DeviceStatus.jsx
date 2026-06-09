import React from "react";
import { BellRing, Cpu, Fan, Monitor } from "lucide-react";

export default function DeviceStatus({ activeRoom, iot }) {
    const latest = iot.latestReading;
    const emergency = iot.data?.emergency_status || "AMAN";
    const workerOnline = Boolean(iot.data?.worker_online);
    const latestCommand = iot.data?.latest_command;
    const actuator = iot.data?.device_actuator;
    const fanOn = actuator?.fan_status && actuator.fan_status !== "OFF";
    const buzzerOn = actuator?.alarm_status === "ON";

    const cards = [
        {
            title: "ESP32 Microcontroller",
            status: "ONLINE",
            icon: Cpu,
            details: ["Health 98%", "Uptime 4h 52m", "IP Address 192.168.1.4"],
        },
        {
            title: "Exhaust Fan",
            status: fanOn ? "RUNNING" : "IDLE",
            icon: Fan,
            value: fanOn ? actuator.fan_status : "OFF",
            details: [`Fuzzy: ${actuator?.fan_status || "OFF"}`, "Running today: 2h 14m"],
        },
        {
            title: "Buzzer",
            status: buzzerOn ? "ACTIVE" : "SILENT",
            icon: BellRing,
            value: buzzerOn ? "On" : "Silent",
            details: ["Last trigger: 38 mins ago", "Triggers today: 4"],
        },
        {
            title: "OLED Display",
            status: "CONNECTED",
            icon: Monitor,
            details: [
                `Gas: ${Math.round(Number(latest?.gas_value || 0))}ppm`,
                `Api: ${Math.round(Number(latest?.flame_value || 0))} Analog`,
                `Kelembapan: ${Math.round(Number(latest?.humidity || 0))}%`,
                `Suhu: ${Math.round(Number(latest?.temperature || 0))}°C`,
            ],
        },
    ];

    const checks = [
        { endpoint: "GET /api/dashboard/data", latency: iot.error ? "--" : "ok", ok: !iot.error },
        { endpoint: "POST /api/ingest", latency: latest ? "live" : "--", ok: Boolean(latest) },
        { endpoint: "GET /api/command/get", latency: workerOnline ? "active" : "--", ok: workerOnline },
        { endpoint: "POST /api/status/update", latency: latestCommand ? "recent" : "--", ok: Boolean(latestCommand) },
    ];

    return (
        <div className="flex flex-col gap-2.5">
            {/* Header */}
            <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Device Status</p>
                <p className="text-[10px] text-ink3 mt-0.5">Hardware, connectivity, and server diagnostics</p>
            </div>

            {/* Device cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                {cards.map((card) => (
                    <article key={card.title} className="bg-surface2 border border-edge">
                        <div className="px-3 py-2 border-b border-edge">
                            <div className="flex items-center gap-1.5">
                                <card.icon className="w-3 h-3 text-accent" />
                                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink2">{card.title}</p>
                            </div>
                        </div>
                        <div className="px-3 py-2.5">
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] uppercase tracking-[0.06em] px-1.5 py-0.5 border ${
                                    card.status === "RUNNING" || card.status === "ONLINE" || card.status === "CONNECTED"
                                        ? "text-success border-success bg-success/10"
                                        : card.status === "ACTIVE"
                                          ? "text-accent border-accent bg-accent/10"
                                          : "text-ink3 border-edge2 bg-surface3"
                                }`}>
                                    {card.status}
                                </span>
                                {card.value ? (
                                    <span className="text-sm font-medium text-ink tabular-nums">{card.value}</span>
                                ) : null}
                            </div>
                            <div className="mt-2 space-y-1">
                                {card.details.map((detail) => (
                                    <p key={detail} className="text-[10px] text-ink3 tracking-[0.04em]">{detail}</p>
                                ))}
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* API Health Checks */}
            <div className="bg-surface2 border border-edge">
                <div className="px-3 py-2 border-b border-edge">
                    <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">API Health Checks</p>
                </div>
                <div className="px-3">
                    {checks.map((check, i) => (
                        <div key={check.endpoint} className={`flex items-center justify-between py-2 ${i < checks.length - 1 ? "border-b border-edge" : ""}`}>
                            <span className="text-[10px] text-ink2 tracking-[0.04em] font-mono">{check.endpoint}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-ink3 tabular-nums">{check.latency}</span>
                                <span className={`w-1.5 h-1.5 ${check.ok ? "bg-success" : "bg-danger"}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
