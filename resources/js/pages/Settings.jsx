import React, { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Save, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";
import GlassSurface from "../components/GlassSurface";

const fuzzy = [["LOW","LOW","LOW","LOW"],["LOW","LOW","MED","LOW"],["LOW","MED","LOW","LOW"],["MED","LOW","LOW","LOW"],["MED","MED","LOW","MEDIUM"],["MED","MED","MED","MEDIUM"],["MED","LOW","HIGH","MEDIUM"],["HIGH","LOW","LOW","HIGH"],["HIGH","MED","MED","HIGH"],["MED","HIGH","MED","HIGH"],["HIGH","HIGH","MED","MAXIMUM"],["HIGH","HIGH","HIGH","MAXIMUM"],["LOW","LOW","HIGH","HIGH"]];
const foc = v => v === "LOW" ? "bg-[#a0c3ec]/15 text-[#a0c3ec] border-[#a0c3ec]/30" : v === "MEDIUM" ? "bg-[#ff7a17]/15 text-[#ff7a17] border-[#ff7a17]/30" : v === "HIGH" ? "bg-[#ffc285]/15 text-[#ffc285] border-[#ffc285]/30" : "bg-white/10 text-white border border-white/30";
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
    const ps = useMemo(() => gas > 700 || smoke > 350 || temp > 55 || flame === "High" ? { l: "BAHAYA", c: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30" } : { l: "AMAN", c: "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30" }, [gas, smoke, temp, flame]);

    const saveT = async () => { setSaving(true); try { await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify({ gas_threshold: gas, smoke_threshold: smoke, temperature_threshold: temp, flame_threshold: flame === "Low" ? 700 : flame === "Medium" ? 500 : 350 }) }); } finally { setSaving(false); } };
    const saveD = async () => { if (!sel) return; setDs(true); try { const r = await fetch(`/api/devices/${sel.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify({ device_name: dn.trim(), location: dl2.trim() }) }); const p = await r.json(); if (p.status === "success") setDevices(prev => prev.map(d => d.id === sel.id ? p.device : d)); } finally { setDs(false); } };
    const resetD = async () => { if (!sel) return; setDr(true); try { const r = await fetch(`/api/devices/${sel.id}/reset`, { method: "POST", headers: { Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" } }); const p = await r.json(); if (p.status === "success") setDevices(prev => prev.map(d => d.id === sel.id ? { ...d, status: p.device.status } : d)); } finally { setDr(false); } };

    return (
        <div className="pb-4 sm:pb-5 space-y-3 sm:space-y-5">
            <div><h1 className="text-xl sm:text-2xl font-normal tracking-tight">Settings</h1><p className="text-xs sm:text-sm text-[#7d8187] mt-0.5">Thresholds, fuzzy rules, device config</p></div>

            <GlassSurface className="p-3 sm:p-5">
                <h2 className="text-xs sm:text-sm font-normal tracking-tight">Threshold Configuration</h2>
                <p className="text-[10px] sm:text-[11px] text-[#7d8187] mt-0.5 mb-3 sm:mb-4">Adjust BAHAYA trigger levels</p>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                    <div><div className="flex justify-between text-sm"><span className="font-normal">Gas</span><span className="text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{gas} ppm</span></div><input type="range" min="0" max="1000" value={gas} onChange={e => setGas(Number(e.target.value))} className="mt-2 w-full accent-white" /></div>
                    <div><div className="flex justify-between text-sm"><span className="font-normal">Smoke</span><span className="text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{smoke} ppm</span></div><input type="range" min="0" max="500" value={smoke} onChange={e => setSmoke(Number(e.target.value))} className="mt-2 w-full accent-white" /></div>
                    <div><div className="flex justify-between text-sm"><span className="font-normal">Temperature</span><span className="text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{temp}°C</span></div><input type="range" min="0" max="80" value={temp} onChange={e => setTemp(Number(e.target.value))} className="mt-2 w-full accent-white" /></div>
                    <div><div className="flex justify-between text-sm"><span className="font-normal">Flame</span><span className="text-[#7d8187]">{flame}</span></div><div className="mt-2 inline-flex w-full rounded-lg bg-[#0a0a0a] border border-[#212327] p-0.5">{["Low","Medium","High"].map(l => <button key={l} onClick={() => setFlame(l)} className={cn("flex-1 h-7 rounded-md text-xs transition-all duration-150 font-normal", flame === l ? "bg-white text-[#0a0a0a]" : "text-[#7d8187] hover:text-white")}>{l}</button>)}</div></div>
                </div>
                <div className="mt-4 rounded-lg border border-[#212327] bg-[#0a0a0a] p-2.5 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-[#7d8187]">Preview: gas 486ppm, smoke 215ppm, temp 37°C</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-[9999px] border text-[10px] font-normal uppercase tracking-[1px] ${ps.c}`} style={{ fontFamily: "'Geist Mono', monospace" }}>{ps.l}</span>
                </div>
                <button onClick={saveT} className="mt-4 h-10 w-full rounded-[9999px] bg-white text-[#0a0a0a] font-normal text-sm inline-flex items-center justify-center gap-2 hover:bg-[#fafaf7] transition-all duration-150"><Save className="w-4 h-4" strokeWidth={1.5} />{saving ? "Saving..." : "Save Thresholds"}</button>
            </GlassSurface>

            <GlassSurface className="p-3 sm:p-5">
                <h2 className="text-xs sm:text-sm font-normal tracking-tight">Fuzzy Logic Rules</h2>
                <p className="text-[10px] sm:text-[11px] text-[#7d8187] mt-0.5 mb-2 sm:mb-3">13 rules mapping inputs to fan output</p>
                <div className="overflow-auto thin-scroll"><table className="w-full min-w-[500px] sm:min-w-[650px] text-xs sm:text-sm"><thead><tr className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] sm:tracking-[1.4px] text-[#7d8187] border-b border-[#212327] font-normal"><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>#</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Gas</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Smoke</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Temp</th><th className="text-right py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Fan</th></tr></thead><tbody>{fuzzy.map((r, i) => <tr key={`${r.join("-")}-${i}`} className="border-b border-[#212327] hover:bg-[#1a1c20]"><td className="py-1.5 sm:py-2 text-[#7d8187]">{i+1}</td><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td className="text-right"><span className={`inline-flex px-1.5 py-0.5 rounded-[9999px] border text-[9px] sm:text-[10px] font-normal ${foc(r[3])}`}>{r[3]}</span></td></tr>)}</tbody></table></div>
            </GlassSurface>

            <div className="grid gap-3 sm:gap-5 grid-cols-1 xl:grid-cols-2">
                <GlassSurface className="p-3 sm:p-5">
                    <h2 className="text-xs sm:text-sm font-normal tracking-tight">Notifications</h2>
                    <p className="text-[10px] sm:text-[11px] text-[#7d8187] mt-0.5 mb-2 sm:mb-3">Alert preferences</p>
                    <div className="space-y-2">
                        <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-[#7d8187]" strokeWidth={1.5} /><div><p className="text-sm font-normal">Alert on BAHAYA only</p><p className="text-[11px] text-[#7d8187]">Ignore INFO/WARN</p></div></div><button onClick={() => setDangerOnly(v => !v)} className={`w-11 h-6 rounded-full p-0.5 transition-all ${dangerOnly ? "bg-white" : "bg-[#363a3f]"}`}><span className={`block w-5 h-5 rounded-full bg-[#0a0a0a] transition-transform ${dangerOnly ? "translate-x-5" : "translate-x-0"}`} /></button></div>
                        <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5"><div className="flex justify-between text-sm"><span className="font-normal">Polling interval</span><span className="text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{polling}s</span></div><input type="range" min="1" max="10" value={polling} onChange={e => setPolling(Number(e.target.value))} className="mt-2 w-full accent-white" /></div>
                    </div>
                </GlassSurface>

                <GlassSurface className="p-3 sm:p-5">
                    <h2 className="text-xs sm:text-sm font-normal tracking-tight">Device Management</h2>
                    <p className="text-[11px] text-[#7d8187] mt-0.5 mb-3">API key & hardware</p>
                    <div className="space-y-2">
                        <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5"><p className="text-[11px] uppercase tracking-[1.4px] text-[#7d8187] font-normal" style={{ fontFamily: "'Geist Mono', monospace" }}>Device</p><select value={sid || ""} onChange={e => setSid(Number(e.target.value))} disabled={dl || !devices.length} className="device-select text-sm mt-1.5 w-full bg-transparent outline-none border-b border-[#212327] text-white pb-1 focus:border-white/40 transition-all duration-150 font-normal">{!devices.length ? <option value="">{dl ? "Loading..." : "No devices"}</option> : null}{devices.map(d => <option key={d.id} value={d.id}>{d.location || d.device_name || `Device ${d.id}`}</option>)}</select></div>
                        <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5 flex justify-between"><div><p className="text-[11px] uppercase tracking-[1.4px] text-[#7d8187] font-normal" style={{ fontFamily: "'Geist Mono', monospace" }}>Status</p><p className="text-sm mt-0.5 font-normal">{sel?.status || "unknown"}</p></div><span className="text-[10px] text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace" }}>#{sel?.id || "-"}</span></div>
                        <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5 flex justify-between items-center gap-2"><div><p className="text-[11px] uppercase tracking-[1.4px] text-[#7d8187] font-normal" style={{ fontFamily: "'Geist Mono', monospace" }}>API Key</p><p className="text-sm mt-0.5 font-normal" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{mask(ak)}</p></div><button onClick={() => { if (!ak) return; navigator.clipboard.writeText(ak); alert("Copied!"); }} disabled={!ak} className="h-8 px-2.5 rounded-[9999px] border border-[#212327] bg-[#0a0a0a] inline-flex items-center gap-1.5 text-xs hover:border-white/40 transition-all duration-150 disabled:opacity-50 text-[#7d8187]"><Copy className="w-3.5 h-3.5" />Copy</button></div>
                        <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5"><p className="text-[11px] uppercase tracking-[1.4px] text-[#7d8187] font-normal" style={{ fontFamily: "'Geist Mono', monospace" }}>Name</p><input value={dn} onChange={e => setDn(e.target.value)} disabled={!sel} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-[#212327] text-white pb-1 focus:border-white/40 transition-all duration-150 font-normal" /></div>
                        <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5"><p className="text-[11px] uppercase tracking-[1.4px] text-[#7d8187] font-normal" style={{ fontFamily: "'Geist Mono', monospace" }}>Location</p><input value={dl2} onChange={e => setDl2(e.target.value)} disabled={!sel} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-[#212327] text-white pb-1 focus:border-white/40 transition-all duration-150 font-normal" placeholder="Warehouse" /></div>
                        <button onClick={saveD} disabled={!sel || ds || !dn.trim() || !dl2.trim()} className="h-9 px-4 rounded-[9999px] bg-white text-[#0a0a0a] font-normal text-sm hover:bg-[#fafaf7] transition-all duration-150 disabled:opacity-50">{ds ? "Saving..." : "Save Device"}</button>
                        <button onClick={resetD} disabled={!sel || dr} className="h-9 px-4 rounded-[9999px] bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 font-normal text-sm hover:bg-[#ef4444]/20 transition-all duration-150 disabled:opacity-50">{dr ? "Resetting..." : "Reset Device"}</button>
                    </div>
                </GlassSurface>
            </div>
        </div>
    );
}
