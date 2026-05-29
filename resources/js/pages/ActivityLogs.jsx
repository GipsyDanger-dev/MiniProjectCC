import React from "react";
import { Calendar, ChevronDown, Download, Flame, Siren, Waves } from "lucide-react";
import GlassSurface from "../components/GlassSurface";

const filters = ["All", "Danger", "Warning", "Info", "Resolved"];
const tc = { success: "bg-success/20 text-success border-success/30", danger: "bg-danger/20 text-danger border-danger/30", info: "bg-muted/60 text-muted-foreground border-white/[0.08]" };
const fmt = v => !v ? "just now" : new Date(v).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });

export default function ActivityLogs({ activeRoom, iot }) {
    const logs = iot.data?.activity_logs || [];
    const entries = logs.length ? logs.slice(0, 8).map(i => ({ id: i.id, title: i.status === "BAHAYA" ? "Danger Event" : "Normal Event", desc: i.message || i.description, time: fmt(i.created_at), status: i.status === "BAHAYA" ? "TRIGGERED" : "INFO", room: activeRoom, icon: i.status === "BAHAYA" ? Flame : Siren, tone: i.status === "BAHAYA" ? "danger" : "info" })) : [];
    const stats = [
        { label: "Total Events", value: `${logs.length}`, tone: "text-foreground" },
        { label: "Danger", value: `${logs.filter(l => l.status === "BAHAYA").length}`, tone: "text-danger" },
        { label: "Resolved", value: `${logs.filter(l => l.status === "AMAN").length}`, tone: "text-success" },
        { label: "Worker", value: iot.data?.worker_online ? "YES" : "NO", tone: "text-foreground" },
    ];

    return (
        <div className="pb-5 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h1 className="text-2xl font-bold">Activity Log</h1><p className="text-sm text-muted-foreground mt-0.5">Event timeline & alerts</p></div>
                <div className="flex items-center gap-2">
                    <button className="h-8 rounded-lg border border-white/[0.08] bg-white/[0.05] px-2.5 text-xs inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-muted-foreground" />Last 24h<ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button className="h-8 rounded-lg bg-violet text-white px-3 font-semibold text-xs inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Export</button>
                </div>
            </div>
            <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">{stats.map(s => <GlassSurface key={s.label} className="p-4"><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">{s.label}</p><p className={`mt-1.5 text-3xl leading-none font-bold ${s.tone}`}>{s.value}</p></GlassSurface>)}</div>
            <GlassSurface className="p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3 mb-4">
                    <div className="flex flex-wrap gap-1.5">{filters.map((f, i) => <button key={f} className={`h-7 px-2.5 rounded-lg text-xs transition-smooth ${i === 0 ? "bg-card text-foreground border border-white/[0.08]" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>)}<button className="h-7 px-2.5 rounded-lg text-xs bg-white/[0.05] border border-white/[0.08] inline-flex items-center gap-1">{activeRoom}<ChevronDown className="w-3 h-3 text-muted-foreground" /></button></div>
                    <span className="text-xs text-muted-foreground">{entries.length} of {logs.length}</span>
                </div>
                <div className="space-y-3">
                    {entries.map((e, i) => (
                        <div key={e.id} className="flex gap-3">
                            <div className="pt-3 flex flex-col items-center"><span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-success" : "bg-muted-foreground/60"}`} />{i < entries.length - 1 && <span className="w-px h-14 bg-white/[0.06] mt-1" />}</div>
                            <GlassSurface className="flex-1 !p-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <span className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${tc[e.tone]}`}><e.icon className="w-3.5 h-3.5" /></span>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-1.5"><h3 className="font-semibold text-sm">{e.title}</h3><span className={`px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider font-semibold ${tc[e.tone]}`}>{e.status}</span></div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{e.desc}</p>
                                            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground"><span>{e.time}</span><span className="inline-flex items-center gap-0.5"><Waves className="w-3 h-3" />auto</span></div>
                                        </div>
                                    </div>
                                    <button className="w-7 h-7 rounded-lg border border-white/[0.06] bg-white/[0.03] inline-flex items-center justify-center shrink-0"><ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /></button>
                                </div>
                            </GlassSurface>
                        </div>
                    ))}
                </div>
            </GlassSurface>
        </div>
    );
}
