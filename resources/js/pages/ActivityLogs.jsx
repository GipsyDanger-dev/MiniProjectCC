import React, { useState } from "react";
import { Calendar, ChevronDown, Download, Flame, Siren, Waves } from "lucide-react";

const filters = ["All", "Danger", "Warning", "Info", "Resolved"];

function formatTime(value) {
    if (!value) return "just now";
    return new Date(value).toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
    });
}

export default function ActivityLogs({ activeRoom, iot }) {
    const [activeFilter, setActiveFilter] = useState("All");
    const [expandedId, setExpandedId] = useState(null);
    const logs = iot.data?.activity_logs || [];

    const filteredLogs = logs.filter((log) => {
        if (activeFilter === "All") return true;
        if (activeFilter === "Danger") return log.status === "BAHAYA" && log.action_type === "SENSOR_DATA";
        if (activeFilter === "Resolved") return log.status === "AMAN";
        if (activeFilter === "Warning") return log.status === "BAHAYA" && log.action_type !== "SENSOR_DATA";
        if (activeFilter === "Info") return log.action_type === "SYSTEM_UPDATE" || log.action_type === "MODE_SWITCH";
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

    const entries = filteredLogs.length
        ? filteredLogs.slice(0, 8).map((item) => ({
              id: item.id,
              title: item.status === "BAHAYA" ? "Danger Event Triggered" : "Normal Event",
              desc: item.message || item.description,
              time: formatTime(item.created_at),
              duration: "auto",
              status: item.status === "BAHAYA" ? "TRIGGERED" : "INFO",
              room: activeRoom,
              icon: item.status === "BAHAYA" ? Flame : Siren,
              tone: item.status === "BAHAYA" ? "danger" : "info",
          }))
        : [];

    const stats = [
        { label: "Total Events Today", value: `${logs.length}`, tone: "text-ink" },
        { label: "Danger Events", value: `${logs.filter((l) => l.status === "BAHAYA").length}`, tone: "text-danger" },
        { label: "Resolved", value: `${logs.filter((l) => l.status === "AMAN").length}`, tone: "text-success" },
        { label: "Worker Online", value: iot.data?.worker_online ? "YES" : "NO", tone: "text-ink" },
    ];

    return (
        <div className="flex flex-col gap-2.5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.10em] text-ink2">Activity Log</p>
                    <p className="text-[9px] text-ink3 mt-0.5">Chronological event timeline & alerts</p>
                </div>
                <button
                    type="button"
                    onClick={exportCSV}
                    className="h-7 px-3 bg-accent text-white text-[9px] uppercase tracking-[0.1em] font-medium inline-flex items-center gap-1.5 hover:bg-accent/80 transition-smooth"
                >
                    <Download className="w-3 h-3" />
                    Export
                </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-surface2 border border-edge px-3 py-2.5">
                        <p className="text-[9px] uppercase tracking-[0.08em] text-ink3">{stat.label}</p>
                        <p className={`text-lg font-medium mt-1 tabular-nums ${stat.tone}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Event timeline */}
            <div className="bg-surface2 border border-edge">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-edge">
                    <div className="flex flex-wrap gap-1">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={`px-2 py-1 text-[9px] uppercase tracking-[0.08em] border border-r-0 last:border-r transition-smooth ${
                                    activeFilter === filter
                                        ? "bg-surface text-accent border-accent"
                                        : "bg-surface3 text-ink3 border-edge"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <span className="text-[9px] text-ink3">
                        {entries.length} of {filteredLogs.length} filtered ({logs.length} total)
                    </span>
                </div>

                <div className="px-3 py-2 space-y-2">
                    {entries.length === 0 && (
                        <p className="text-[9px] text-ink3 py-4 text-center uppercase tracking-[0.06em]">No entries found</p>
                    )}
                    {entries.map((entry, index) => {
                        const Icon = entry.icon;
                        const isDanger = entry.tone === "danger";
                        return (
                            <div key={entry.id} className="flex gap-2">
                                <div className="pt-2 flex flex-col items-center">
                                    <span className={`w-1.5 h-1.5 ${index === 0 ? "bg-accent" : "bg-edge2"}`} />
                                    {index < entries.length - 1 && <span className="w-px flex-1 bg-edge mt-1" />}
                                </div>

                                <div className="flex-1 border border-edge bg-surface p-2.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                            <div className={`w-6 h-6 flex items-center justify-center shrink-0 ${
                                                isDanger ? "text-danger" : "text-ink3"
                                            }`}>
                                                <Icon className="w-3 h-3" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="text-[9px] font-medium text-ink tracking-[0.02em]">{entry.title}</span>
                                                    <span className={`text-[8px] uppercase tracking-[0.08em] px-1 py-0.5 border ${
                                                        isDanger
                                                            ? "text-danger border-danger bg-danger/10"
                                                            : "text-ink3 border-edge2 bg-surface3"
                                                    }`}>
                                                        {entry.status}
                                                    </span>
                                                    <span className="text-[8px] text-ink3">{entry.room}</span>
                                                </div>
                                                <p className="text-[9px] text-ink3 mt-0.5">{entry.desc}</p>
                                                <div className="mt-1 flex items-center gap-2 text-[8px] text-ink3">
                                                    <span>{entry.time}</span>
                                                    <span className="inline-flex items-center gap-0.5">
                                                        <Waves className="w-2.5 h-2.5" />
                                                        {entry.duration}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                                            className="w-5 h-5 border border-edge bg-surface3 inline-flex items-center justify-center"
                                        >
                                            <ChevronDown className={`w-3 h-3 text-ink3 transition-transform ${expandedId === entry.id ? "rotate-180" : ""}`} />
                                        </button>
                                    </div>
                                    {expandedId === entry.id && (
                                        <div className="mt-2 pt-2 border-t border-edge text-[9px] text-ink3 space-y-0.5">
                                            <p><span className="text-ink2">Action:</span> {logs.find(l => l.id === entry.id)?.action_type || "N/A"}</p>
                                            <p><span className="text-ink2">Description:</span> {logs.find(l => l.id === entry.id)?.description || "N/A"}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
