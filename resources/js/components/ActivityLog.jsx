import React from "react";
import { Fan, Flame, Thermometer, Bell } from "lucide-react";

const iconMap = {
    fan: Fan,
    flame: Flame,
    temp: Thermometer,
    alert: Bell,
};

const statusStyles = {
    TRIGGERED: { color: "text-danger", tag: "text-danger border-danger bg-danger/10", label: "DANGER" },
    RESOLVED: { color: "text-success", tag: "text-success border-success bg-success/10", label: "RESOLVED" },
    INFO: { color: "text-accent", tag: "text-ink3 border-edge2 bg-surface3", label: "INFO" },
};

export default function ActivityLog({ entries: incomingEntries = [] }) {
    const defaultEntries = [
        { id: "1", icon: "fan", text: "Exhaust fan activated automatically", time: "2m ago", status: "INFO" },
        { id: "2", icon: "flame", text: "Flame sensor normalized", time: "12m ago", status: "RESOLVED" },
        { id: "3", icon: "temp", text: "Temperature spike detected", time: "18m ago", status: "TRIGGERED" },
        { id: "4", icon: "alert", text: "Buzzer test completed", time: "24m ago", status: "INFO" },
        { id: "5", icon: "temp", text: "Temperature returned to baseline", time: "41m ago", status: "RESOLVED" },
    ];

    const entries = incomingEntries.length ? incomingEntries : defaultEntries;

    return (
        <div className="bg-surface2 border border-edge">
            <div className="flex items-center justify-between px-3 py-2 border-b border-edge">
                <p className="text-[9px] font-medium uppercase tracking-[0.10em] text-ink2">
                    Event Log
                </p>
                <span className="text-[9px] uppercase tracking-[0.08em] text-accent cursor-pointer">
                    Lihat Semua →
                </span>
            </div>
            <div className="px-3 max-h-[300px] overflow-auto thin-scroll">
                {entries.slice(0, 5).map((entry) => {
                    const Icon = iconMap[entry.icon] || Bell;
                    const style = statusStyles[entry.status] || statusStyles.INFO;
                    return (
                        <div key={entry.id} className="flex items-center gap-2 py-[7px] border-b border-edge last:border-b-0">
                            <div className={`w-[18px] h-[18px] flex items-center justify-center shrink-0 ${style.color}`}>
                                <Icon className="w-3 h-3" strokeWidth={1.5} />
                            </div>
                            <span className="flex-1 text-[9px] text-ink2 tracking-[0.02em] leading-snug">
                                {entry.text}
                            </span>
                            <span className="text-[9px] text-ink3 tracking-[0.04em] whitespace-nowrap">
                                {entry.time}
                            </span>
                            <span className={`text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 border ${style.tag}`}>
                                {style.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
