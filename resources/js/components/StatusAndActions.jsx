import React from "react";
import { Bell, List, Play, Square } from "lucide-react";
import GlassSurface from "./GlassSurface";

export function StatusCard({ status = "AMAN", systemActive = true, deviceLabel = "IOT-SEC-0A42F", updatedLabel = "Updated 2s ago" }) {
    return (
        <GlassSurface className="p-5 h-full">
            <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">System Status</p>
                <button className={`w-11 h-6 rounded-full p-0.5 transition-all ${systemActive ? "bg-violet" : "bg-muted"}`}>
                    <span className={`block w-5 h-5 rounded-full bg-background transition-transform ${systemActive ? "translate-x-5" : "translate-x-0"}`} />
                </button>
            </div>
            <p className="inline-flex mt-2 items-center px-2 py-0.5 rounded-full text-[10px] bg-muted/40 text-muted-foreground">{updatedLabel}</p>
            <p className="mt-4 text-5xl leading-none font-extrabold text-violet">{status}.</p>
            <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Device ID</p>
                <p className="text-2xl font-bold mt-0.5">{deviceLabel}</p>
            </div>
        </GlassSurface>
    );
}

export function QuickActions({ actuatorState = {}, onAction }) {
    const actions = [
        { label: "Activate Fan", icon: Play, active: actuatorState.exhaust_fan === "START", action: { target_device: "exhaust_fan", action: "START" } },
        { label: "Stop Fan", icon: Square, active: actuatorState.exhaust_fan === "STOP", action: { target_device: "exhaust_fan", action: "STOP" } },
        { label: "Test Buzzer", icon: Bell, active: actuatorState.buzzer === "START", action: { target_device: "buzzer", action: "START" } },
        { label: "View Logs", icon: List, active: false },
    ];
    return (
        <div className="grid grid-cols-2 gap-3 h-full">
            {actions.map(a => (
                <GlassSurface key={a.label} className={`p-4 bento-card bento-card--border-glow ${a.active ? "!bg-violet/15 !border-violet/30" : ""}`}>
                    <button onClick={() => a.action && onAction?.(a.action)} className="flex flex-col justify-between h-full text-left min-h-[90px]">
                        <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.active ? "bg-violet/20 border border-violet/30" : "bg-white/[0.05] border border-white/[0.08]"}`}><a.icon className={`w-4 h-4 ${a.active ? "text-violet" : ""}`} /></span>
                        <span className={`text-lg font-semibold ${a.active ? "text-violet" : "text-foreground"}`}>{a.label}</span>
                    </button>
                </GlassSurface>
            ))}
        </div>
    );
}
