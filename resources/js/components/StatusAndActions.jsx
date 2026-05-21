import React from "react";
import { Bell, List, Play, Square } from "lucide-react";

export function StatusCard({
    status = "AMAN",
    systemActive = true,
    deviceLabel = "IOT-SEC-0A42F",
    updatedLabel = "Updated 2s ago",
}) {
    return (
        <div className="card-surface p-6 h-full bg-[radial-gradient(120%_120%_at_100%_0%,rgba(204,255,0,0.12),transparent_62%)] border border-white/5">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    System Status
                </p>
                <button
                    type="button"
                    className={`w-12 h-7 rounded-full p-1 transition-all ${systemActive ? "bg-lime" : "bg-muted"}`}
                >
                    <span
                        className={`block w-5 h-5 rounded-full bg-background transition-transform ${systemActive ? "translate-x-5" : "translate-x-0"}`}
                    />
                </button>
            </div>
            <p className="inline-flex mt-3 items-center px-3 py-1 rounded-full text-xs bg-muted/40 text-muted-foreground">
                {updatedLabel}
            </p>
            <p className="mt-5 text-6xl leading-none font-extrabold text-lime drop-shadow-[0_0_22px_rgba(204,255,0,0.32)]">
                {status}.
            </p>
            <div className="mt-5 flex items-end justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        Device ID
                    </p>
                    <p className="text-3xl font-semibold mt-1">{deviceLabel}</p>
                </div>
            </div>
        </div>
    );
}

export function QuickActions({ actuatorState = {}, onAction }) {
    const actions = [
        {
            label: "Activate Fan",
            icon: Play,
            active: actuatorState.exhaust_fan === "START",
            action: { target_device: "exhaust_fan", action: "START" },
        },
        {
            label: "Stop Fan",
            icon: Square,
            active: actuatorState.exhaust_fan === "STOP",
            action: { target_device: "exhaust_fan", action: "STOP" },
        },
        {
            label: "Test Buzzer",
            icon: Bell,
            active: actuatorState.buzzer === "START",
            action: { target_device: "buzzer", action: "START" },
        },
        { label: "View Logs", icon: List, active: false },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            {actions.map((action) => (
                <button
                    key={action.label}
                    type="button"
                    onClick={() => action.action && onAction?.(action.action)}
                    className={`relative isolate overflow-hidden p-6 text-left flex flex-col justify-between min-h-[122px] rounded-[20px] border backdrop-blur-xl transition-smooth ${
                        action.active
                            ? "text-[#10130a] border-lime/70 shadow-[0_14px_36px_rgba(204,255,0,0.38)] bg-[linear-gradient(135deg,rgba(214,255,94,0.92),rgba(170,232,0,0.86))]"
                            : "text-foreground border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03)_58%,rgba(102,126,234,0.12))]"
                    }`}
                >
                    <span
                        className={`absolute inset-0 pointer-events-none ${
                            action.active
                                ? "bg-[radial-gradient(130%_100%_at_0%_0%,rgba(255,255,255,0.36),transparent_62%)]"
                                : "bg-[radial-gradient(120%_110%_at_100%_0%,rgba(204,255,0,0.10),transparent_64%)]"
                        }`}
                    />
                    <span
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                            action.active
                                ? "bg-black/15"
                                : "bg-black/25 border border-white/10"
                        }`}
                    >
                        <action.icon className="w-5 h-5" />
                    </span>
                    <span className="relative text-2xl font-semibold">
                        {action.label}
                    </span>
                </button>
            ))}
        </div>
    );
}
