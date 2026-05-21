import React from "react";
import { Fan, Flame, Thermometer, Bell } from "lucide-react";

const iconMap = {
    fan: Fan,
    flame: Flame,
    temp: Thermometer,
    alert: Bell,
};

export default function ActivityLog({ entries: incomingEntries = [] }) {
    const defaultEntries = [
        {
            id: "1",
            icon: "fan",
            text: "Exhaust fan activated automatically",
            time: "2m ago",
            status: "INFO",
        },
        {
            id: "2",
            icon: "flame",
            text: "Flame sensor normalized",
            time: "12m ago",
            status: "RESOLVED",
        },
        {
            id: "3",
            icon: "temp",
            text: "Temperature spike detected",
            time: "18m ago",
            status: "TRIGGERED",
        },
        {
            id: "4",
            icon: "alert",
            text: "Buzzer test completed",
            time: "24m ago",
            status: "INFO",
        },
        {
            id: "5",
            icon: "temp",
            text: "Temperature returned to baseline",
            time: "41m ago",
            status: "RESOLVED",
        },
    ];

    const entries = incomingEntries.length ? incomingEntries : defaultEntries;

    return (
        <div className="relative isolate overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(150deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03)_58%,rgba(99,102,241,0.12))] backdrop-blur-xl p-6">
            <span className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_110%_at_100%_0%,rgba(204,255,0,0.10),transparent_66%)]" />
            <h3 className="text-3xl font-semibold relative">Activity Log</h3>
            <div className="mt-5 space-y-3 max-h-[380px] overflow-auto thin-scroll pr-1 relative">
                {entries.map((entry) => {
                    const Icon = iconMap[entry.icon];
                    const statusClass =
                        entry.status === "TRIGGERED"
                            ? "bg-danger/20 text-danger border-danger/30"
                            : entry.status === "RESOLVED"
                              ? "bg-success/20 text-success border-success/30"
                              : "bg-muted/60 text-muted-foreground border-white/15";

                    return (
                        <div key={entry.id} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-2.5">
                            <span className="w-9 h-9 rounded-full bg-black/30 border border-white/10 flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-lg leading-snug font-medium">
                                    {entry.text}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {entry.time}
                                </p>
                            </div>
                            <span
                                className={`px-2 py-1 rounded-full border text-xs uppercase tracking-wider ${statusClass}`}
                            >
                                {entry.status}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
