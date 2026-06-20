import React, { useState } from "react";
import { ChevronDown, Download, AlertTriangle, CheckCircle, Settings, Zap, Activity } from "lucide-react";

const filters = ["All", "Danger", "Safe", "System"];

function formatTime(value) {
    if (!value) return "";
    return new Date(value).toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
    });
}

function parseDescription(desc) {
    if (!desc) return null;
    const triggered = desc.match(/Triggered:\s*([^|]+)/)?.[1]?.trim();
    const nearLimit = desc.match(/Near limit:\s*([^|]+)/)?.[1]?.trim();
    const sensors = [];
    const re = /(Gas|Smoke|Temp|Flame):\s*([\d.]+(?:C?))\/([\d.]+(?:C?))/g;
    let m;
    while ((m = re.exec(desc)) !== null) {
        const [, name, current, threshold] = m;
        const cur = parseFloat(current);
        const thr = parseFloat(threshold);
        let pct;
        if (name === "Flame") {
            // Flame: lower = worse
            pct = thr > 0 ? Math.round((1 - cur / thr) * 100) : 0;
        } else {
            pct = thr > 0 ? Math.round((cur / thr) * 100) : 0;
        }
        sensors.push({ name, current: current.replace("C", ""), threshold: threshold.replace("C", ""), pct });
    }
    return { triggered, nearLimit, sensors };
}

function getIcon(actionType) {
    if (actionType === "MANUAL_COMMAND") return Zap;
    if (actionType === "SYSTEM_UPDATE" || actionType === "MODE_SWITCH") return Settings;
    return Activity;
}

function SensorBar({ name, current, threshold, pct, isDanger }) {
    const barPct = Math.min(100, Math.max(2, pct));
    return (
        <div className="flex items-center gap-2">
            <span className="text-[9px] text-ink3 w-12 shrink-0">{name}</span>
            <div className="flex-1 h-1 bg-edge rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${isDanger ? "bg-danger" : pct > 80 ? "bg-amber-500" : "bg-edge2"}`}
                    style={{ width: `${barPct}%` }}
                />
            </div>
            <span className={`text-[9px] tabular-nums shrink-0 ${isDanger ? "text-danger" : "text-ink3"}`}>
                {current}/{threshold}
            </span>
        </div>
    );
}

export default function ActivityLogs({ activeRoom, iot }) {
    const [activeFilter, setActiveFilter] = useState("All");
    const [expandedId, setExpandedId] = useState(null);
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
        { label: "Total Events", value: `${logs.length}`, tone: "text-ink" },
        { label: "Danger", value: `${logs.filter((l) => l.status === "BAHAYA").length}`, tone: "text-danger" },
        { label: "Safe", value: `${logs.filter((l) => l.status === "AMAN").length}`, tone: "text-success" },
        { label: "Worker", value: iot.data?.worker_online ? "Online" : "Offline", tone: iot.data?.worker_online ? "text-success" : "text-danger" },
    ];

    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Activity Log</p>
                    <p className="text-[10px] text-ink3 mt-0.5">All system events and sensor alerts</p>
                </div>
                <button
                    type="button"
                    onClick={exportCSV}
                    className="h-7 px-3 bg-accent text-white text-[10px] uppercase tracking-[0.1em] font-medium inline-flex items-center gap-1.5 hover:bg-accent/80 transition-smooth"
                >
                    <Download className="w-3 h-3" />
                    Export
                </button>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-surface2 border border-edge px-3 py-2.5">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-ink3">{stat.label}</p>
                        <p className={`text-lg font-medium mt-1 tabular-nums ${stat.tone}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-surface2 border border-edge">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-edge">
                    <div className="flex flex-wrap gap-1">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                className={`px-2 py-1 text-[10px] uppercase tracking-[0.08em] border border-r-0 last:border-r transition-smooth ${
                                    activeFilter === filter
                                        ? "bg-surface text-accent border-accent"
                                        : "bg-surface3 text-ink3 border-edge"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <span className="text-[10px] text-ink3">
                        {filteredLogs.length} events
                    </span>
                </div>

                <div className="divide-y divide-edge">
                    {filteredLogs.length === 0 && (
                        <p className="text-[10px] text-ink3 py-4 text-center px-3">No events found</p>
                    )}
                    {filteredLogs.slice(0, 10).map((log) => {
                        const isDanger = log.status === "BAHAYA";
                        const isSystem = log.action_type === "SYSTEM_UPDATE" || log.action_type === "MODE_SWITCH";
                        const Icon = isDanger ? AlertTriangle : isSystem ? Settings : CheckCircle;
                        const parsed = parseDescription(log.description);
                        const isExpanded = expandedId === log.id;

                        return (
                            <div
                                key={log.id}
                                className={`border-l-2 ${
                                    isDanger ? "border-l-danger bg-danger/[0.03]" : "border-l-transparent"
                                }`}
                            >
                                <div className="flex items-start gap-2 px-3 py-2.5">
                                    <div className={`shrink-0 mt-0.5 ${isDanger ? "text-danger" : "text-ink3"}`}>
                                        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-[10px] leading-snug ${isDanger ? "text-danger font-medium" : "text-ink2"}`}>
                                                {log.message}
                                            </p>
                                            <span className="text-[9px] text-ink3 whitespace-nowrap">
                                                {formatTime(log.created_at)}
                                            </span>
                                        </div>

                                        {parsed?.triggered && (
                                            <p className="text-[9px] text-danger leading-snug mt-1">
                                                Triggered: {parsed.triggered}
                                            </p>
                                        )}

                                        {parsed?.nearLimit && (
                                            <p className="text-[9px] text-amber-500 leading-snug mt-0.5">
                                                Near limit: {parsed.nearLimit}
                                            </p>
                                        )}

                                        {!parsed?.triggered && !parsed?.nearLimit && log.description && (
                                            <p className="text-[9px] text-ink3 leading-snug mt-0.5">{log.description}</p>
                                        )}

                                        {parsed?.sensors?.length > 0 && (
                                            <div className="mt-1.5 space-y-0.5 max-w-xs">
                                                {parsed.sensors.map((s) => {
                                                    const isTriggered = parsed.triggered?.includes(s.name);
                                                    return (
                                                        <SensorBar
                                                            key={s.name}
                                                            name={s.name}
                                                            current={s.current}
                                                            threshold={s.threshold}
                                                            pct={s.pct}
                                                            isDanger={isTriggered}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                                        className="w-5 h-5 border border-edge bg-surface3 inline-flex items-center justify-center shrink-0"
                                    >
                                        <ChevronDown className={`w-3 h-3 text-ink3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                    </button>
                                </div>
                                {isExpanded && (
                                    <div className="px-3 pb-2.5 ml-5 text-[9px] text-ink3 space-y-0.5">
                                        <p><span className="text-ink2">Type:</span> {log.action_type || "N/A"}</p>
                                        <p><span className="text-ink2">Room:</span> {activeRoom}</p>
                                        {log.description && <p><span className="text-ink2">Raw:</span> {log.description}</p>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
