import React from "react";
import { BellRing, Cpu, Fan, Monitor } from "lucide-react";
import GlassSurface from "../components/GlassSurface";

const dc = [
    { title: "ESP32 Microcontroller", status: "ONLINE", icon: Cpu, details: ["Health 98%", "Uptime 4h 52m", "IP 192.168.1.4"] },
    { title: "Exhaust Fan", status: "RUNNING", icon: Fan, value: "66%", details: ["Fuzzy: MEDIUM-HIGH", "Running: 2h 14m"] },
    { title: "Buzzer", status: "SILENT", icon: BellRing, value: "Silent", details: ["Last trigger: 38m ago", "Triggers today: 4"] },
    { title: "OLED Display", status: "CONNECTED", icon: Monitor, details: ["SentinelIoT", "Status: AMAN", "Gas: 328ppm"] },
];

export default function DeviceStatus({ activeRoom, iot }) {
    const latest = iot.latestReading, emergency = iot.data?.emergency_status || "AMAN", cmd = iot.data?.latest_command;
    const cards = [dc[0], { ...dc[1], status: cmd?.target_device === "exhaust_fan" && cmd?.action === "START" ? "RUNNING" : "IDLE", value: cmd?.target_device === "exhaust_fan" && cmd?.action === "START" ? "ON" : "OFF" }, { ...dc[2], status: cmd?.target_device === "buzzer" && cmd?.action === "START" ? "ACTIVE" : "SILENT" }, { ...dc[3], details: ["SentinelIoT", `Status: ${emergency}`, `Gas: ${Math.round(Number(latest?.gas_value || 0))}ppm`] }];

    return (
        <div className="pb-5 space-y-5">
            <div><h1 className="text-2xl font-bold">Device Status</h1><p className="text-sm text-muted-foreground mt-0.5">Hardware & connectivity</p></div>
            <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
                {cards.map(c => (
                    <GlassSurface key={c.title} className="p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-lg bg-violet/10 border border-violet/20 inline-flex items-center justify-center"><c.icon className="w-3.5 h-3.5 text-violet" /></span><div><h3 className="text-sm font-semibold">{c.title}</h3><p className="text-[10px] text-success font-semibold">{c.status}</p></div></div>
                            {c.value && <span className="text-3xl leading-none font-bold">{c.value}</span>}
                        </div>
                        <div className="mt-2 space-y-0.5">{c.details.map(d => <p key={d} className="text-[11px] text-muted-foreground">{d}</p>)}</div>
                    </GlassSurface>
                ))}
            </div>
        </div>
    );
}
