import React, { useState } from "react";
import { ChevronDown, Download, AlertTriangle, CheckCircle, Settings, Zap, Activity } from "lucide-react";
import GlassSurface from "../components/GlassSurface";

const filters = ["All", "Danger", "Safe", "System"];

function formatTime(value) {
    if (!value) return "";
    return new Date(value).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
}

function getIcon(actionType) {
    if (actionType === "MANUAL_COMMAND") return Zap;
    if (actionType === "SYSTEM_UPDATE" || actionType === "MODE_SWITCH") return Settings;
    return Activity;
}

export default function ActivityLogs({ activeRoom, iot }) {
    const [activeFilter, setActiveFilter] = useState("All");
    const logs = iot.data?.activity_logs || [];

    const filteredLogs = logs.filter((log) => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Danger") return log.status === "BAHAYA";
        if (activeFilter === "Safe") return log.status === "AMAN";
        if (activeFilter === "System") return log.action_type === "SYSTEM_UPDATE" || log.action_type === "MODE_SWITCH";
        return true;
    });

    const exportCSV = () => {
        const header = "ID,Status,Message,Description,Time\n";
        const rows = filteredLogs.map((l) =>
            `${l.id},"${l.status}","${(l.message || "").replace(/"/g, '""')}","${(l.description || "").replace(/"/g, '""')}","${l.created_at}"`
        ).join("\n");
        const blob = new Blob([header + rows], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "activity_logs.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const stats = [
        { label: "Total Events", value: `${logs.length}`, tone: "text-white" },
        { label: "Danger", value: `${logs.filter((l) => l.status === "BAHAYA").length}`, tone: "text-[#ef4444]" },
        { label: "Safe", value: `${logs.filter((l) => l.status === "AMAN").length}`, tone: "text-[#22c55e]" },
        { label: "Worker", value: iot.data?.worker_online ? "Online" : "Offline", tone: iot.data?.worker_online ? "text-[#22c55e]" : "text-[#ef4444]" },
    ];

    return (
        <div className="pb-4 sm:pb-5 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                <div><h1 className="text-xl sm:text-2xl font-normal tracking-tight">Activity Log</h1><p className="text-xs sm:text-sm text-[#7d8187] mt-0.5">All system events and sensor alerts</p></div>
                <button onClick={exportCSV} className="h-7 sm:h-8 rounded-[9999px] bg-white text-[#0a0a0a] px-2 sm:px-3 font-normal text-[10px] sm:text-xs inline-flex items-center gap-1 sm:gap-1.5"><Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />Export</button>
            </div>

            <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                    <GlassSurface key={s.label} className="p-3 sm:p-4">
                        <p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] sm:tracking-[1.4px] text-[#7d8187] font-normal" style={{ fontFamily: "'Geist Mono', monospace" }}>{s.label}</p>
                        <p className={`mt-1 sm:mt-1.5 text-2xl sm:text-3xl leading-none font-normal tracking-tight ${s.tone}`} style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '-0.5px' }}>{s.value}</p>
                    </GlassSurface>
                ))}
            </div>

            <GlassSurface className="p-3 sm:p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(33,35,39,0.8)] pb-2 sm:pb-3 mb-3 sm:mb-4">
                    <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {filters.map((f, i) => (
                            <button key={f} onClick={() => setActiveFilter(f)}
                                className={`h-7 px-2 sm:px-2.5 rounded-[9999px] text-[10px] sm:text-xs transition-all duration-150 font-normal ${activeFilter === f ? "bg-white text-[#0a0a0a]" : "text-[#7d8187] hover:text-white"}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] sm:text-xs text-[#7d8187]">{filteredLogs.length} events</span>
                </div>

                <div className="space-y-2 sm:space-y-3 max-h-[500px] overflow-auto thin-scroll">
                    {filteredLogs.length === 0 && (
                        <p className="text-xs text-center py-6 sm:py-8 text-[#7d8187]">No events found</p>
                    )}
                    {filteredLogs.slice(0, 12).map((log) => {
                        const isDanger = log.status === "BAHAYA";
                        const isSystem = log.action_type === "SYSTEM_UPDATE" || log.action_type === "MODE_SWITCH";
                        const Icon = isDanger ? AlertTriangle : isSystem ? Settings : CheckCircle;

                        return (
                            <div key={log.id} className="flex gap-3">
                                <div className="pt-2 sm:pt-3 flex flex-col items-center">
                                    <span className={`w-2 h-2 rounded-full ${isDanger ? "bg-[#ef4444]" : "bg-[#22c55e]"}`} />
                                </div>
                                <GlassSurface className="flex-1 !p-2.5 sm:!p-3">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${isDanger ? "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30" : "bg-[rgba(124,58,237,0.1)] text-[#c4b5fd] border border-[rgba(124,58,237,0.15)]"}`}>
                                            <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={1.5} />
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs sm:text-sm font-normal leading-snug ${isDanger ? "text-[#ef4444]" : "text-white"}`}>{log.message}</p>
                                            {log.description && <p className="text-[10px] sm:text-[11px] text-[#7d8187] mt-0.5 truncate">{log.description}</p>}
                                            <div className="mt-1 flex items-center gap-2 text-[10px] sm:text-[11px] text-[#7d8187]">
                                                <span style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{formatTime(log.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassSurface>
                            </div>
                        );
                    })}
                </div>
            </GlassSurface>
        </div>
    );
}
