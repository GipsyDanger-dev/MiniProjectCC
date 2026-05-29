import React, { useState } from "react";
import {
    Calendar,
    ChevronDown,
    Download,
    Flame,
    Siren,
    Waves,
} from "lucide-react";

const filters = ["All", "Danger", "Warning", "Info", "Resolved"];

const toneClasses = {
    success:
        "bg-success/20 text-success border-success/30",
    danger:
        "bg-danger/20 text-danger border-danger/30",
    info: "bg-muted/60 text-muted-foreground border-white/15",
};

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
        {
            label: "Total Events Today",
            value: `${logs.length}`,
            tone: "text-foreground",
        },
        {
            label: "Danger Events",
            value: `${logs.filter((l) => l.status === "BAHAYA").length}`,
            tone: "text-danger",
        },
        {
            label: "Resolved",
            value: `${logs.filter((l) => l.status === "AMAN").length}`,
            tone: "text-success",
        },
        {
            label: "Worker Online",
            value: iot.data?.worker_online ? "YES" : "NO",
            tone: "text-foreground",
        },
    ];

    return (
        <div className="pb-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-4xl font-semibold text-foreground">
                        Activity Log
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Chronological event timeline & alerts
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        className="h-10 rounded-full border border-white/10 bg-black/25 px-3 text-sm inline-flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="hidden sm:inline">Last 24 hours</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                        type="button"
                        onClick={exportCSV}
                        className="h-10 rounded-full bg-lime text-lime-foreground px-3 md:px-4 font-semibold inline-flex items-center gap-2 shadow-[0_10px_30px_rgba(204,255,0,0.35)]"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => (
                    <div
                        key={stat.label}
                        className={`relative isolate overflow-hidden rounded-[18px] border border-white/10 backdrop-blur-xl p-4 ${
                            index === 1
                                ? "bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_58%,rgba(239,68,68,0.12))]"
                                : index === 2
                                  ? "bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_58%,rgba(34,197,94,0.12))]"
                                  : "bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_58%,rgba(99,102,241,0.10))]"
                        }`}
                    >
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            {stat.label}
                        </p>
                        <p className={`mt-2 text-4xl leading-none font-semibold ${stat.tone}`}>
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            <section className="relative isolate overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03)_58%,rgba(99,102,241,0.12))] p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={`h-8 px-3 rounded-full text-xs transition-smooth ${
                                    activeFilter === filter
                                        ? "bg-card text-foreground border border-white/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="hidden md:inline-flex h-8 px-3 rounded-full text-xs bg-black/20 border border-white/10 items-center gap-2"
                        >
                            Current room ({activeRoom})
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                            type="button"
                            className="hidden md:inline-flex h-8 px-3 rounded-full text-xs bg-black/20 border border-white/10 items-center gap-2"
                        >
                            All sensors
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        Showing {entries.length} of {filteredLogs.length} filtered ({logs.length} total)
                    </span>
                </div>

                <div className="mt-4 space-y-3">
                    {entries.map((entry, index) => (
                        <div key={entry.id} className="flex gap-3">
                            <div className="pt-4 flex flex-col items-center">
                                <span
                                    className={`w-2.5 h-2.5 rounded-full ${
                                        index === 0 ? "bg-success" : "bg-muted-foreground/70"
                                    }`}
                                />
                                {index < entries.length - 1 ? (
                                    <span className="w-px h-[68px] bg-white/15 mt-1" />
                                ) : null}
                            </div>

                            <article className="flex-1 rounded-[16px] border border-white/10 bg-black/25 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <span
                                            className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                                                toneClasses[entry.tone]
                                            }`}
                                        >
                                            <entry.icon className="w-4 h-4" />
                                        </span>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-lg leading-tight">
                                                    {entry.title}
                                                </h3>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wider ${
                                                        toneClasses[entry.tone]
                                                    }`}
                                                >
                                                    {entry.status}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {entry.room}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {entry.desc}
                                            </p>
                                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>{entry.time}</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <Waves className="w-3.5 h-3.5" />
                                                    {entry.duration}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                                        className="w-8 h-8 rounded-full border border-white/10 bg-black/20 inline-flex items-center justify-center"
                                    >
                                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedId === entry.id ? "rotate-180" : ""}`} />
                                    </button>
                                </div>
                                {expandedId === entry.id && (
                                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-muted-foreground space-y-1">
                                        <p><strong>Action:</strong> {logs.find(l => l.id === entry.id)?.action_type || "N/A"}</p>
                                        <p><strong>Full description:</strong> {logs.find(l => l.id === entry.id)?.description || "N/A"}</p>
                                    </div>
                                )}
                            </article>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
