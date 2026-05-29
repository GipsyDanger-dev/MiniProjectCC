import React, { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Save, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";
import GlassSurface from "../components/GlassSurface";

const fuzzy = [["LOW","LOW","LOW","LOW"],["LOW","LOW","MED","LOW"],["LOW","MED","LOW","LOW"],["MED","LOW","LOW","LOW"],["MED","MED","LOW","MEDIUM"],["MED","MED","MED","MEDIUM"],["MED","LOW","HIGH","MEDIUM"],["HIGH","LOW","LOW","HIGH"],["HIGH","MED","MED","HIGH"],["MED","HIGH","MED","HIGH"],["HIGH","HIGH","MED","MAXIMUM"],["HIGH","HIGH","HIGH","MAXIMUM"],["LOW","LOW","HIGH","HIGH"]];
const foc = v => v === "LOW" ? "bg-blue-500/20 text-blue-300 border-blue-400/30" : v === "MEDIUM" ? "bg-amber-500/20 text-amber-300 border-amber-400/30" : v === "HIGH" ? "bg-orange-500/20 text-orange-300 border-orange-400/30" : "bg-danger/20 text-danger border-danger/30";
const mask = v => !v ? "-" : v.length <= 8 ? v : `${v.slice(0,6)}••••${v.slice(-4)}`;

export default function Settings({ iot }) {
    const [gas, setGas] = useState(600), [smoke, setSmoke] = useState(300), [temp, setTemp] = useState(50), [flame, setFlame] = useState("Medium"), [dangerOnly, setDangerOnly] = useState(false), [polling, setPolling] = useState(3), [saving, setSaving] = useState(false);
    const [devices, setDevices] = useState([]), [dl, setDl] = useState(true), [sid, setSid] = useState(null), [dn, setDn] = useState(""), [dl2, setDl2] = useState(""), [ak, setAk] = useState(""), [ds, setDs] = useState(false), [dr, setDr] = useState(false);
    const ir = useRef(false);
    useEffect(() => { const s = iot.data?.settings; if (!s) return; setGas(Number(s.gas_threshold || 600)); setSmoke(Number(s.smoke_threshold || 300)); setTemp(Number(s.temp_threshold || 50)); }, [iot.data?.settings]);
    useEffect(() => { let a = true; (async () => { setDl(true); try { const r = await fetch("/api/devices", { headers: { Accept: "application/json" } }); const p = await r.json(); if (!a) return; setDevices(p.status === "success" ? p.devices || [] : []); } catch { if (a) setDevices([]); } finally { if (a) setDl(false); } })(); return () => { a = false; }; }, []);
    useEffect(() => { if (!devices.length) return; const has = sid && devices.some(d => d.id === sid); if (has) { ir.current = true; return; } const pid = Number(iot?.data?.device_id); const m = devices.find(d => d.id === pid); const n = m?.id || devices[0]?.id || null; if (n) setSid(n); ir.current = true; }, [devices, iot?.data?.device_id, sid]);
    const sel = useMemo(() => devices.find(d => d.id === sid) || null, [devices, sid]);
    useEffect(() => { if (!sel) return; setDn(sel.device_name || ""); setDl2(sel.location || ""); setAk(sel.api_key || ""); }, [sel]);
    const ps = useMemo(() => gas > 700 || smoke > 350 || temp > 55 || flame === "High" ? { l: "BAHAYA", c: "bg-danger/20 text-danger border-danger/30" } : { l: "AMAN", c: "bg-success/20 text-success border-success/30" }, [gas, smoke, temp, flame]);

    const saveT = async () => { setSaving(true); try { await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify({ gas_threshold: gas, smoke_threshold: smoke, temperature_threshold: temp, flame_threshold: flame === "Low" ? 700 : flame === "Medium" ? 500 : 350 }) }); } finally { setSaving(false); } };
    const saveD = async () => { if (!sel) return; setDs(true); try { const r = await fetch(`/api/devices/${sel.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify({ device_name: dn.trim(), location: dl2.trim() }) }); const p = await r.json(); if (p.status === "success") setDevices(prev => prev.map(d => d.id === sel.id ? p.device : d)); } finally { setDs(false); } };
    const resetD = async () => { if (!sel) return; setDr(true); try { const r = await fetch(`/api/devices/${sel.id}/reset`, { method: "POST", headers: { Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" } }); const p = await r.json(); if (p.status === "success") setDevices(prev => prev.map(d => d.id === sel.id ? { ...d, status: p.device.status } : d)); } finally { setDr(false); } };

    return (
        <div className="pb-5 space-y-5">
            <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-muted-foreground mt-0.5">Thresholds, fuzzy rules, device config</p></div>

            <GlassSurface className="p-5">
                <h2 className="text-lg font-semibold">Threshold Configuration</h2>
                <p className="text-xs text-muted-foreground mt-0.5 mb-4">Adjust BAHAYA trigger levels</p>
                <div className="grid gap-4 md:grid-cols-2">
                    <div><div className="flex justify-between text-sm"><span>Gas</span><span className="text-muted-foreground">{gas} ppm</span></div><input type="range" min="0" max="1000" value={gas} onChange={e => setGas(Number(e.target.value))} className="mt-2 w-full accent-violet" /></div>
                    <div><div className="flex justify-between text-sm"><span>Smoke</span><span className="text-muted-foreground">{smoke} ppm</span></div><input type="range" min="0" max="500" value={smoke} onChange={e => setSmoke(Number(e.target.value))} className="mt-2 w-full accent-violet" /></div>
                    <div><div className="flex justify-between text-sm"><span>Temperature</span><span className="text-muted-foreground">{temp}°C</span></div><input type="range" min="0" max="80" value={temp} onChange={e => setTemp(Number(e.target.value))} className="mt-2 w-full accent-violet" /></div>
                    <div><div className="flex justify-between text-sm"><span>Flame</span><span className="text-muted-foreground">{flame}</span></div><div className="mt-2 inline-flex w-full rounded-lg bg-white/[0.05] border border-white/[0.08] p-0.5">{["Low","Medium","High"].map(l => <button key={l} onClick={() => setFlame(l)} className={cn("flex-1 h-7 rounded-md text-xs transition-smooth", flame === l ? "bg-card text-foreground" : "text-muted-foreground")}>{l}</button>)}</div></div>
                </div>
                <div className="mt-4 rounded-lg border border-white/[0.06] bg-violet/[0.05] p-2.5 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-muted-foreground">Preview: gas 486ppm, smoke 215ppm, temp 37°C</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-semibold ${ps.c}`}>{ps.l}</span>
                </div>
                <button onClick={saveT} className="mt-4 h-10 w-full rounded-lg bg-violet text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-violet"><Save className="w-4 h-4" />{saving ? "Saving..." : "Save Thresholds"}</button>
            </GlassSurface>

            <GlassSurface className="p-5">
                <h2 className="text-lg font-semibold">Fuzzy Logic Rules</h2>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">13 rules mapping inputs to fan output</p>
                <div className="overflow-auto thin-scroll"><table className="w-full min-w-[650px] text-sm"><thead><tr className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground border-b border-white/[0.06] font-semibold"><th className="text-left py-2">#</th><th className="text-left py-2">Gas</th><th className="text-left py-2">Smoke</th><th className="text-left py-2">Temp</th><th className="text-right py-2">Fan</th></tr></thead><tbody>{fuzzy.map((r, i) => <tr key={`${r.join("-")}-${i}`} className="border-b border-white/[0.04] hover:bg-white/[0.02]"><td className="py-2 text-muted-foreground">{i+1}</td><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td className="text-right"><span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-semibold ${foc(r[3])}`}>{r[3]}</span></td></tr>)}</tbody></table></div>
            </GlassSurface>

            <div className="grid gap-5 xl:grid-cols-2">
                <GlassSurface className="p-5">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">Alert preferences</p>
                    <div className="space-y-2">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-muted-foreground" /><div><p className="text-sm">Alert on BAHAYA only</p><p className="text-[11px] text-muted-foreground">Ignore INFO/WARN</p></div></div><button onClick={() => setDangerOnly(v => !v)} className={`w-11 h-6 rounded-full p-0.5 transition-all ${dangerOnly ? "bg-violet" : "bg-muted"}`}><span className={`block w-5 h-5 rounded-full bg-background transition-transform ${dangerOnly ? "translate-x-5" : "translate-x-0"}`} /></button></div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"><div className="flex justify-between text-sm"><span>Polling interval</span><span className="text-muted-foreground">{polling}s</span></div><input type="range" min="1" max="10" value={polling} onChange={e => setPolling(Number(e.target.value))} className="mt-2 w-full accent-violet" /></div>
                    </div>
                </GlassSurface>

                <GlassSurface className="p-5">
                    <h2 className="text-lg font-semibold">Device Management</h2>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">API key & hardware</p>
                    <div className="space-y-2">
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Device</p><select value={sid || ""} onChange={e => setSid(Number(e.target.value))} disabled={dl || !devices.length} className="device-select text-sm mt-1.5 w-full bg-transparent outline-none border-b border-white/[0.06] text-foreground pb-1 focus:border-violet/40 transition-smooth">{!devices.length ? <option value="">{dl ? "Loading..." : "No devices"}</option> : null}{devices.map(d => <option key={d.id} value={d.id}>{d.location || d.device_name || `Device ${d.id}`}</option>)}</select></div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 flex justify-between"><div><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Status</p><p className="text-sm mt-0.5">{sel?.status || "unknown"}</p></div><span className="text-[10px] text-muted-foreground">#{sel?.id || "-"}</span></div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 flex justify-between items-center gap-2"><div><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">API Key</p><p className="text-sm mt-0.5">{mask(ak)}</p></div><button onClick={() => { if (!ak) return; navigator.clipboard.writeText(ak); alert("Copied!"); }} disabled={!ak} className="h-8 px-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] inline-flex items-center gap-1.5 text-xs hover:border-violet/40 transition-smooth disabled:opacity-50"><Copy className="w-3.5 h-3.5" />Copy</button></div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Name</p><input value={dn} onChange={e => setDn(e.target.value)} disabled={!sel} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-white/[0.06] text-foreground pb-1 focus:border-violet/40 transition-smooth" /></div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Location</p><input value={dl2} onChange={e => setDl2(e.target.value)} disabled={!sel} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-white/[0.06] text-foreground pb-1 focus:border-violet/40 transition-smooth" placeholder="Warehouse" /></div>
                        <button onClick={saveD} disabled={!sel || ds || !dn.trim() || !dl2.trim()} className="h-9 px-4 rounded-lg bg-violet/15 text-violet border border-violet/25 font-semibold text-sm hover:bg-violet/25 transition-smooth disabled:opacity-50">{ds ? "Saving..." : "Save Device"}</button>
                        <button onClick={resetD} disabled={!sel || dr} className="h-9 px-4 rounded-lg bg-danger/15 text-danger border border-danger/25 font-semibold text-sm hover:bg-danger/25 transition-smooth disabled:opacity-50">{dr ? "Resetting..." : "Reset Device"}</button>
                    </div>
                </GlassSurface>
            </div>
        </div>
    );
}
