import React from "react";
import { AlertTriangle, CheckCircle, Settings, Zap, Activity } from "lucide-react";

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

function parseDescription(desc) {
    if (!desc) return null;
    const triggered = desc.match(/Triggered:\s*([^|]+)/)?.[1]?.trim();
    const nearLimit = desc.match(/Near limit:\s*([^|]+)/)?.[1]?.trim();
    const sensors = desc.match(/(?:Gas|Smoke|Temp|Flame):\s*[\d.]+\/[\d.]+(?:C?)/g);
    return { triggered, nearLimit, sensors };
}

function getIcon(actionType) {
    if (actionType === "MANUAL_COMMAND") return Zap;
    if (actionType === "SYSTEM_UPDATE" || actionType === "MODE_SWITCH") return Settings;
    return Activity;
}

export default function ActivityLog({ entries: incomingEntries = [], onViewAll }) {
    const entries = incomingEntries.length ? incomingEntries : [];

    return (
        <div className="bg-surface2 border border-edge rounded-lg shadow-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
                <p className="text-[12px] font-medium text-ink2">
                    Event Log
                </p>
                <span
                    className="text-[11px] text-accent cursor-pointer hover:underline"
                    onClick={onViewAll}
                >
                    View All
                </span>
            </div>
            <div className="max-h-[300px] overflow-auto thin-scroll">
                {entries.length === 0 && (
                    <p className="text-[10px] text-ink3 py-4 text-center px-3">No recent events</p>
                )}
                {entries.slice(0, 5).map((entry) => {
                    const isDanger = entry.status === "BAHAYA";
                    const isSystem = entry.action_type === "SYSTEM_UPDATE" || entry.action_type === "MODE_SWITCH";
                    const Icon = isDanger ? AlertTriangle : isSystem ? Settings : CheckCircle;
                    const parsed = parseDescription(entry.description);

                    return (
                        <div
                            key={entry.id}
                            className={`flex items-start gap-2 px-3 py-2 border-b border-edge last:border-b-0 border-l-2 ${
                                isDanger
                                    ? "border-l-danger bg-danger/[0.03]"
                                    : "border-l-transparent"
                            }`}
                        >
                            <div className={`shrink-0 mt-0.5 ${isDanger ? "text-danger" : "text-ink3"}`}>
                                <Icon className="w-3 h-3" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-[10px] leading-snug ${isDanger ? "text-danger font-medium" : "text-ink2"}`}>
                                    {entry.message}
                                </p>
                                {parsed?.triggered && (
                                    <p className="text-[9px] text-danger/80 leading-snug mt-0.5">
                                        Triggered: {parsed.triggered}
                                    </p>
                                )}
                                {parsed?.nearLimit && (
                                    <p className="text-[9px] text-amber-500 leading-snug mt-0.5">
                                        Near limit: {parsed.nearLimit}
                                    </p>
                                )}
                                {!parsed?.triggered && !parsed?.nearLimit && entry.description && (
                                    <p className="text-[9px] text-ink3 leading-snug mt-0.5">
                                        {entry.description}
                                    </p>
                                )}
                            </div>
                            <span className="text-[9px] text-ink3 whitespace-nowrap shrink-0 mt-0.5">
                                {formatTime(entry.created_at || entry.time)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
