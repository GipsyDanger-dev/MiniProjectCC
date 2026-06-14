import React from "react";
import { Bell, List, Play, Square, ShieldCheck, AlertTriangle } from "lucide-react";
import GlassSurface from "./GlassSurface";
import Toggle from "./ui/Toggle";

export function StatusCard({ status = "AMAN", systemActive = true, deviceLabel = "IOT-SEC-0A42F", updatedLabel = "Updated 2s ago" }) {
    const isDanger = status === "BAHAYA";
    return (
        <GlassSurface className={`p-3 sm:p-5 h-full ${isDanger ? "animate-danger-border border-[#ef4444]/50" : ""}`}>
            <div className="flex items-center justify-between">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] sm:tracking-[1.4px] font-normal text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace" }}>System Status</p>
                <Toggle checked={systemActive} />
            </div>
            <p className="inline-flex mt-2 items-center px-2 py-0.5 rounded-[9999px] text-[10px] sm:text-[11px] font-normal bg-[#1a1c20] text-[#dadbdf] border border-[#212327]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>
                {updatedLabel}
            </p>
            <div className="mt-3 sm:mt-4 flex items-center gap-3" role={isDanger ? "alert" : "status"} aria-live={isDanger ? "assertive" : "polite"}>
                {isDanger ? (
                    <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-[#ef4444] animate-danger-shake" strokeWidth={1.5} />
                ) : (
                    <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#22c55e]" strokeWidth={1.5} />
                )}
                <p className={`text-xl sm:text-2xl font-normal tracking-tight ${isDanger ? "text-[#ef4444] animate-danger-text" : "text-[#22c55e]"}`}
                   style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '-0.5px' }}>
                    SISTEM {status}
                </p>
            </div>
            <div className="mt-2 sm:mt-3">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] sm:tracking-[1.4px] font-normal text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace" }}>Device ID</p>
                <p className="text-base sm:text-lg font-normal mt-0.5 text-white" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{deviceLabel}</p>
            </div>
        </GlassSurface>
    );
}

export function QuickActions({ actuatorState = {}, onAction }) {
    const actions = [
        { label: "Aktifkan Fan", icon: Play, active: actuatorState.exhaust_fan === "START", action: { target_device: "exhaust_fan", action: "START" } },
        { label: "Hentikan Fan", icon: Square, active: actuatorState.exhaust_fan === "STOP", action: { target_device: "exhaust_fan", action: "STOP" } },
        { label: "Test Buzzer", icon: Bell, active: actuatorState.buzzer === "START", action: { target_device: "buzzer", action: "START" } },
        { label: "Lihat Log", icon: List, active: false },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {actions.map(a => (
                <GlassSurface key={a.label} className={`p-3 sm:p-4 bento-card bento-card--border-glow group ${a.active ? "!bg-[#1a1c20] !border-[rgba(124,58,237,0.3)]" : ""}`}>
                    <button onClick={() => a.action && onAction?.(a.action)}
                        className="flex flex-col justify-between h-full text-left min-h-[70px] sm:min-h-[80px]">
                        <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
                            a.active ? "bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] text-[#c4b5fd]" : "bg-[#1a1c20] border border-[#212327] text-white group-hover:border-[rgba(124,58,237,0.2)]"
                        }`}>
                            <a.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        </span>
                        <span className={`text-xs sm:text-sm font-normal ${a.active ? "text-[#c4b5fd]" : "text-white"}`}>
                            {a.label}
                        </span>
                    </button>
                </GlassSurface>
            ))}
        </div>
    );
}
