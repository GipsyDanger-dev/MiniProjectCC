import React from "react";
import { AlertTriangle, CheckCircle, Settings, Zap, Activity } from "lucide-react";
import GlassSurface from "./GlassSurface";

function formatTime(value) {
    if (!value) return "";
    const d = new Date(value);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function getIcon(isDanger, actionType) {
    if (isDanger) return AlertTriangle;
    if (actionType === "MANUAL_COMMAND") return Zap;
    if (actionType === "SYSTEM_UPDATE" || actionType === "MODE_SWITCH") return Settings;
    return Activity;
}

export default function ActivityLog({ entries: incomingEntries = [] }) {
    const entries = incomingEntries.length ? incomingEntries : [];

    return (
        <GlassSurface className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs sm:text-sm font-normal text-white tracking-tight">Event Log</p>
                <span className="text-[10px] sm:text-[11px] bg-[rgba(26,28,32,0.6)] text-[#dadbdf] px-2 sm:px-3 py-0.5 sm:py-1 rounded-[9999px] font-normal border border-[rgba(33,35,39,0.8)]"
                      style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '1px' }}>
                    {entries.length}
                </span>
            </div>
            <div className="max-h-[300px] overflow-auto thin-scroll">
                {entries.length === 0 && (
                    <p className="text-xs text-center py-6 text-[#7d8187]">No recent events</p>
                )}
                {entries.slice(0, 6).map((entry, i) => {
                    const isDanger = entry.status === "BAHAYA";
                    const Icon = getIcon(isDanger, entry.action_type);

                    return (
                        <div key={entry.id || i}
                            className="flex items-start gap-2.5 sm:gap-3 rounded-lg border border-[rgba(33,35,39,0.8)] bg-[rgba(10,10,10,0.6)] px-2.5 sm:px-3 py-2 sm:py-2.5 mb-1.5 hover:bg-[rgba(26,28,32,0.6)] transition-all duration-150">
                            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: isDanger ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(196,181,253,0.05) 100%)', border: `1px solid ${isDanger ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.15)'}` }}>
                                <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDanger ? 'text-[#ef4444]' : 'text-[#c4b5fd]'}`} strokeWidth={1.5} />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs sm:text-sm font-normal leading-snug ${isDanger ? 'text-[#ef4444]' : 'text-white'}`}>
                                    {entry.message}
                                </p>
                                {entry.description && (
                                    <p className="text-[10px] sm:text-[11px] mt-0.5 text-[#7d8187] truncate">{entry.description}</p>
                                )}
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-[#7d8187] whitespace-nowrap shrink-0 mt-0.5"
                                  style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>
                                {entry.time || formatTime(entry.created_at)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </GlassSurface>
    );
}
