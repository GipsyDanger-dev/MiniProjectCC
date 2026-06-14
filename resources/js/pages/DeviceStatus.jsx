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
        <div className="pb-4 sm:pb-5 space-y-3 sm:space-y-5">
            <div><h1 className="text-xl sm:text-2xl font-normal tracking-tight">Device Status</h1><p className="text-xs sm:text-sm text-[#7d8187] mt-0.5">Hardware & connectivity</p></div>
            <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
                {cards.map(c => (
                    <GlassSurface key={c.title} className="p-3 sm:p-4">
                        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0"><span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#1a1c20] border border-[#212327] inline-flex items-center justify-center shrink-0"><c.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={1.5} /></span><div className="min-w-0"><h3 className="text-xs sm:text-sm font-normal truncate">{c.title}</h3><p className="text-[9px] sm:text-[10px] text-[#22c55e] font-normal" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '1px' }}>{c.status}</p></div></div>
                            {c.value && <span className="text-2xl sm:text-3xl leading-none font-normal tracking-tight shrink-0" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '-0.5px' }}>{c.value}</span>}
                        </div>
                        <div className="mt-1.5 sm:mt-2 space-y-0.5">{c.details.map(d => <p key={d} className="text-[10px] sm:text-[11px] text-[#7d8187]">{d}</p>)}</div>
                    </GlassSurface>
                ))}
            </div>
        </div>
    );
}
