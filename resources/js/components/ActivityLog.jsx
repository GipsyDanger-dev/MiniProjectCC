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

    const badgeStyle = s => {
        if (s === "TRIGGERED") return "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30";
        if (s === "RESOLVED") return "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30";
        return "bg-[#1a1c20] text-[#7d8187] border border-[#212327]";
    };

    return (
        <GlassSurface className="p-3 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-xs sm:text-sm font-normal text-white tracking-tight">Log Aktivitas</h3>
                <span className="text-[10px] sm:text-[11px] bg-[#1a1c20] text-[#dadbdf] px-2 sm:px-3 py-0.5 sm:py-1 rounded-[9999px] font-normal border border-[#212327]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '1px' }}>{entries.length}</span>
            </div>
            {entries.length === 0 ? (
                <p className="text-xs sm:text-sm text-center py-6 sm:py-8 text-[#7d8187]">Tidak ada aktivitas hari ini</p>
            ) : (
                <div className="space-y-1.5 sm:space-y-2 max-h-[300px] sm:max-h-[360px] overflow-auto thin-scroll pr-1" role="log" aria-label="Activity log">
                    {entries.map(e => {
                        const Icon = iconMap[e.icon];
                        return (
                            <div key={e.id} className="flex items-start gap-2.5 sm:gap-3 rounded-lg border border-[#212327] bg-[#0a0a0a] px-2.5 sm:px-3 py-2 sm:py-2.5 hover:bg-[#1a1c20] transition-all duration-150">
                                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(196,181,253,0.05) 100%)', border: '1px solid rgba(124,58,237,0.15)' }}>
                                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c4b5fd]" strokeWidth={1.5} />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-normal leading-snug text-white">{e.text}</p>
                                    <p className="text-[10px] sm:text-[12px] mt-0.5 text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{e.time}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-[9999px] text-[10px] font-normal shrink-0 uppercase tracking-[1px] ${badgeStyle(e.status)}`} style={{ fontFamily: "'Geist Mono', monospace" }}>{e.status}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </GlassSurface>
    );
}
