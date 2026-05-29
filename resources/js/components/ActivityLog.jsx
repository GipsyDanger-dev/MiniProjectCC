import React from "react";
import { Fan, Flame, Thermometer, Bell } from "lucide-react";
import GlassSurface from "./GlassSurface";

const iconMap = { fan: Fan, flame: Flame, temp: Thermometer, alert: Bell };

export default function ActivityLog({ entries: incoming = [] }) {
    const defaults = [
        { id: "1", icon: "fan", text: "Exhaust fan activated", time: "2m ago", status: "INFO" },
        { id: "2", icon: "flame", text: "Flame sensor normalized", time: "12m ago", status: "RESOLVED" },
        { id: "3", icon: "temp", text: "Temperature spike", time: "18m ago", status: "TRIGGERED" },
        { id: "4", icon: "alert", text: "Buzzer test completed", time: "24m ago", status: "INFO" },
        { id: "5", icon: "temp", text: "Temperature baseline", time: "41m ago", status: "RESOLVED" },
    ];
    const entries = incoming.length ? incoming : defaults;
    const sc = s => s === "TRIGGERED" ? "bg-danger/20 text-danger border-danger/30" : s === "RESOLVED" ? "bg-success/20 text-success border-success/30" : "bg-muted/60 text-muted-foreground border-white/[0.08]";

    return (
        <GlassSurface className="p-5">
            <h3 className="text-lg font-semibold mb-4">Activity Log</h3>
            <div className="space-y-2 max-h-[360px] overflow-auto thin-scroll pr-1">
                {entries.map(e => {
                    const Icon = iconMap[e.icon];
                    return (
                        <div key={e.id} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                            <span className="w-8 h-8 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5 text-violet" /></span>
                            <div className="flex-1 min-w-0"><p className="text-sm font-medium leading-snug">{e.text}</p><p className="text-[11px] text-muted-foreground mt-0.5">{e.time}</p></div>
                            <span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider font-semibold shrink-0 ${sc(e.status)}`}>{e.status}</span>
                        </div>
                    );
                })}
            </div>
        </GlassSurface>
    );
}
