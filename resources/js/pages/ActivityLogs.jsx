import React from "react";
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
    const logs = iot.data?.activity_logs || [];
    const entries = logs.length
        ? logs.slice(0, 8).map((item) => ({
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
                    <h1 className="text-4xl font-semibold text-foreground">
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
                        Last 24 hours
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                        type="button"
                        className="h-10 rounded-full bg-lime text-lime-foreground px-4 font-semibold inline-flex items-center gap-2 shadow-[0_10px_30px_rgba(204,255,0,0.35)]"
                    >
                        <Download className="w-4 h-4" />
                        Export
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
                        {filters.map((filter, index) => (
                            <button
                                key={filter}
                                type="button"
                                className={`h-8 px-3 rounded-full text-xs transition-smooth ${
                                    index === 0
                                        ? "bg-card text-foreground border border-white/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="h-8 px-3 rounded-full text-xs bg-black/20 border border-white/10 inline-flex items-center gap-2"
                        >
                            Current room ({activeRoom})
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                            type="button"
                            className="h-8 px-3 rounded-full text-xs bg-black/20 border border-white/10 inline-flex items-center gap-2"
                        >
                            All sensors
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        Showing {entries.length} of {logs.length}
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
                                        className="w-8 h-8 rounded-full border border-white/10 bg-black/20 inline-flex items-center justify-center"
                                    >
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
