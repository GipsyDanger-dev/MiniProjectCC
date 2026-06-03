import React from "react";
import { Bell, List, Loader2, Play, Square, Zap } from "lucide-react";

export function StatusCard({
    status = "AMAN",
    systemActive = true,
    onToggle,
    deviceLabel = "IOT-SEC-0A42F",
    updatedLabel = "Updated 2s ago",
}) {
    const isDanger = status === "BAHAYA";
    return (
        <div className="bg-surface2 border border-edge p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[9px] uppercase tracking-[0.10em] text-ink3">
                    Status Indikasi
                </p>
                <div
                    onClick={onToggle}
                    className={`w-9 h-[18px] border cursor-pointer relative transition-smooth ${
                        systemActive
                            ? "bg-accent/10 border-accent"
                            : "bg-surface3 border-edge2"
                    }`}
                >
                    <span
                        className={`absolute top-0.5 w-3 h-3 transition-all ${
                            systemActive
                                ? "left-[18px] bg-accent"
                                : "left-0.5 bg-edge2"
                        }`}
                    />
                </div>
            </div>
            <p className="text-center text-[9px] text-ink3 mb-3 tracking-[0.04em]">
                {updatedLabel}
            </p>
            <p
                className={`text-2xl font-medium text-center tracking-[0.02em] ${
                    isDanger ? "text-danger animate-pulse" : "text-success"
                }`}
            >
                {status}
            </p>
            <div className="mt-auto pt-3 flex items-end justify-between">
                <div>
                    <p className="text-[9px] uppercase tracking-[0.10em] text-ink3">
                        Device ID
                    </p>
                    <p className="text-sm font-medium mt-0.5">{deviceLabel}</p>
                </div>
            </div>
        </div>
    );
}

export function QuickActions({ actuatorState = {}, onAction, loading }) {
    const actions = [
        {
            label: "Aktifkan Fan",
            icon: Zap,
            target: "exhaust_fan",
            active: actuatorState.exhaust_fan === "START" || actuatorState.exhaust_fan === "HIGH" || actuatorState.exhaust_fan === "MEDIUM" || actuatorState.exhaust_fan === "LOW",
            action: { target_device: "exhaust_fan", action: "START" },
            primary: true,
        },
        {
            label: "Stop Fan",
            icon: Square,
            target: "exhaust_fan",
            active: actuatorState.exhaust_fan === "STOP" || actuatorState.exhaust_fan === "OFF",
            action: { target_device: "exhaust_fan", action: "STOP" },
            primary: false,
        },
        {
            label: "Test Buzzer",
            icon: Bell,
            target: "buzzer",
            active: actuatorState.buzzer === "START",
            action: { target_device: "buzzer", action: "START" },
            primary: false,
        },
        { label: "View Logs", icon: List, target: null, active: false, action: { navigate: "activity" }, primary: false },
    ];

    return (
        <div className="grid grid-cols-2 gap-1.5">
            {actions.map((action) => {
                const isLoading = loading && action.target === loading;
                return (
                    <button
                        key={action.label}
                        type="button"
                        disabled={isLoading}
                        onClick={() => onAction?.(action.action)}
                        className={`h-8 border text-[8px] uppercase tracking-[0.08em] flex items-center justify-center gap-1.5 transition-smooth cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                            action.primary
                                ? "bg-accent text-white border-accent hover:bg-accent/80"
                                : "bg-surface3 border-edge2 text-ink2 hover:border-accent hover:text-accent"
                        }`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <action.icon className="w-3 h-3" />
                        )}
                        {action.label}
                    </button>
                );
            })}
        </div>
    );
}
