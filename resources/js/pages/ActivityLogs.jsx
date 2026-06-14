import React from "react";
import { Calendar, ChevronDown, Download, Flame, Siren, Waves } from "lucide-react";
import GlassSurface from "../components/GlassSurface";

const filters = ["All", "Danger", "Warning", "Info", "Resolved"];
const tc = { success: "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30", danger: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30", info: "bg-[#1a1c20] text-[#7d8187] border border-[#212327]" };
const fmt = v => !v ? "just now" : new Date(v).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });

export default function ActivityLogs({ activeRoom, iot }) {
    const logs = iot.data?.activity_logs || [];
    const entries = logs.length ? logs.slice(0, 8).map(i => ({ id: i.id, title: i.status === "BAHAYA" ? "Danger Event" : "Normal Event", desc: i.message || i.description, time: fmt(i.created_at), status: i.status === "BAHAYA" ? "TRIGGERED" : "INFO", room: activeRoom, icon: i.status === "BAHAYA" ? Flame : Siren, tone: i.status === "BAHAYA" ? "danger" : "info" })) : [];
    const stats = [
        { label: "Total Events", value: `${logs.length}`, tone: "text-white" },
        { label: "Danger", value: `${logs.filter(l => l.status === "BAHAYA").length}`, tone: "text-[#ef4444]" },
        { label: "Resolved", value: `${logs.filter(l => l.status === "AMAN").length}`, tone: "text-[#22c55e]" },
        { label: "Worker", value: iot.data?.worker_online ? "YES" : "NO", tone: "text-white" },
    ];

    return (
        <div className="pb-4 sm:pb-5 space-y-3 sm:space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                <div><h1 className="text-xl sm:text-2xl font-normal tracking-tight">Activity Log</h1><p className="text-xs sm:text-sm text-[#7d8187] mt-0.5">Event timeline & alerts</p></div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button className="h-7 sm:h-8 rounded-[9999px] border border-[#212327] bg-[#0a0a0a] px-2 sm:px-2.5 text-[10px] sm:text-xs inline-flex items-center gap-1 sm:gap-1.5 text-[#7d8187]"><Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />Last 24h<ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></button>
                    <button className="h-7 sm:h-8 rounded-[9999px] bg-white text-[#0a0a0a] px-2 sm:px-3 font-normal text-[10px] sm:text-xs inline-flex items-center gap-1 sm:gap-1.5"><Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />Export</button>
                </div>
            </div>
            <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">{stats.map(s => <GlassSurface key={s.label} className="p-3 sm:p-4"><p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] sm:tracking-[1.4px] text-[#7d8187] font-normal" style={{ fontFamily: "'Geist Mono', monospace" }}>{s.label}</p><p className={`mt-1 sm:mt-1.5 text-2xl sm:text-3xl leading-none font-normal tracking-tight ${s.tone}`} style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '-0.5px' }}>{s.value}</p></GlassSurface>)}</div>
            <GlassSurface className="p-3 sm:p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#212327] pb-3 mb-4">
                    <div className="flex flex-wrap gap-1.5">{filters.map((f, i) => <button key={f} className={`h-7 px-2.5 rounded-[9999px] text-xs transition-all duration-150 font-normal ${i === 0 ? "bg-white text-[#0a0a0a] border border-white" : "text-[#7d8187] hover:text-white"}`}>{f}</button>)}<button className="h-7 px-2.5 rounded-[9999px] text-xs bg-[#0a0a0a] border border-[#212327] inline-flex items-center gap-1 text-[#7d8187]">{activeRoom}<ChevronDown className="w-3 h-3" /></button></div>
                    <span className="text-xs text-[#7d8187]">{entries.length} of {logs.length}</span>
                </div>
                <div className="space-y-3" role="log" aria-label="Activity timeline">
                    {entries.length === 0 ? (
                        <p className="text-sm text-center py-8 text-[#7d8187]">Tidak ada log untuk filter ini</p>
                    ) : entries.map((e, i) => (
                        <div key={e.id} className="flex gap-3">
                            <div className="pt-3 flex flex-col items-center"><span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[#22c55e]" : "bg-[#363a3f]"}`} />{i < entries.length - 1 && <span className="w-px h-14 bg-[#212327] mt-1" />}</div>
                            <GlassSurface className="flex-1 !p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <span className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${tc[e.tone]}`}><e.icon className="w-3.5 h-3.5" strokeWidth={1.5} /></span>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-1.5"><h3 className="font-normal text-sm">{e.title}</h3><span className={`px-1.5 py-0.5 rounded-[9999px] border text-[9px] uppercase tracking-[1px] font-normal ${tc[e.tone]}`} style={{ fontFamily: "'Geist Mono', monospace" }}>{e.status}</span></div>
                                            <p className="text-xs text-[#7d8187] mt-0.5">{e.desc}</p>
                                            <div className="mt-1 flex items-center gap-2 text-[11px] text-[#7d8187]"><span>{e.time}</span><span className="inline-flex items-center gap-0.5"><Waves className="w-3 h-3" />auto</span></div>
                                        </div>
                                    </div>
                                    <button className="w-7 h-7 rounded-lg border border-[#212327] bg-[#0a0a0a] inline-flex items-center justify-center shrink-0"><ChevronDown className="w-3.5 h-3.5 text-[#7d8187]" /></button>
                                </div>
                            </GlassSurface>
                        </div>
                    ))}
                </div>
            </GlassSurface>
        </div>
    );
}
