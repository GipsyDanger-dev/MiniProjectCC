import React, { useEffect, useMemo, useState } from "react";
import { Copy, Save, ShieldAlert } from "lucide-react";
import GlassSurface from "../components/GlassSurface";

const fuzzyRules = [
    ["LOW","LOW","LOW","SAFE"],["LOW","LOW","MED","LOW"],["LOW","LOW","HIGH","HIGH"],["LOW","MED","LOW","LOW"],["LOW","MED","MED","MEDIUM"],["LOW","MED","HIGH","HIGH"],["LOW","HIGH","LOW","HIGH"],["LOW","HIGH","MED","HIGH"],["LOW","HIGH","HIGH","HIGH"],["MED","LOW","LOW","LOW"],["MED","LOW","MED","MEDIUM"],["MED","LOW","HIGH","HIGH"],["MED","MED","LOW","MEDIUM"],["MED","MED","MED","MEDIUM"],["MED","MED","HIGH","HIGH"],["MED","HIGH","LOW","HIGH"],["MED","HIGH","MED","HIGH"],["MED","HIGH","HIGH","HIGH"],["HIGH","LOW","LOW","HIGH"],["HIGH","LOW","MED","HIGH"],["HIGH","LOW","HIGH","HIGH"],["HIGH","MED","LOW","HIGH"],["HIGH","MED","MED","HIGH"],["HIGH","MED","HIGH","HIGH"],["HIGH","HIGH","LOW","HIGH"],["HIGH","HIGH","MED","HIGH"],["HIGH","HIGH","HIGH","HIGH"],
];

const fanColor = v => {
    if (v === "SAFE") return "bg-[#22c55e]/10 text-[#22c55e]";
    if (v === "LOW") return "bg-[rgba(26,28,32,0.6)] text-[#7d8187]";
    if (v === "MEDIUM") return "bg-[#f59e0b]/10 text-[#f59e0b]";
    if (v === "HIGH") return "bg-[#ef4444]/10 text-[#ef4444]";
    return "bg-[#ef4444]/10 text-[#ef4444]";
};

const mask = v => !v ? "-" : v.length <= 8 ? v : `${v.slice(0,6)}••••${v.slice(-4)}`;

export default function Settings({ iot, pollingInterval, setPollingInterval }) {
    const [gas, setGas] = useState(2500), [smoke, setSmoke] = useState(800), [humidity, setHumidity] = useState(70), [temp, setTemp] = useState(45), [flame, setFlame] = useState(500);
    const [dangerOnly, setDangerOnly] = useState(false);
    const [saving, setSaving] = useState(false);
    const [devices, setDevices] = useState([]), [dl, setDl] = useState(true), [sid, setSid] = useState(null), [dn, setDn] = useState(""), [dloc, setDloc] = useState(""), [ak, setAk] = useState(""), [ds, setDs] = useState(false), [dr, setDr] = useState(false);
    const polling = Math.round((pollingInterval || 3000) / 1000);

    useEffect(() => { const s = iot.data?.settings; if (!s) return; setGas(Number(s.gas_threshold ?? 2500)); setSmoke(Number(s.smoke_threshold ?? 800)); setHumidity(Number(s.humidity_threshold ?? 70)); setTemp(Number(s.temperature_threshold ?? 45)); setFlame(Number(s.flame_threshold ?? 500)); }, [iot.data?.settings]);
    useEffect(() => { let a = true; (async () => { setDl(true); try { const r = await fetch("/api/devices", { headers: { Accept: "application/json" } }); const p = await r.json(); if (!a) return; setDevices(p.status === "success" ? p.devices || p.data || [] : []); } catch { if (a) setDevices([]); } finally { if (a) setDl(false); } })(); return () => { a = false; }; }, []);
    useEffect(() => { if (!devices.length) return; if (sid && devices.some(d => d.id === sid)) return; const pid = Number(iot?.data?.device_id); const m = devices.find(d => d.id === pid); setSid(m?.id || devices[0]?.id || null); }, [devices, iot?.data?.device_id, sid]);
    const sel = useMemo(() => devices.find(d => d.id === sid) || null, [devices, sid]);
    useEffect(() => { if (!sel) return; setDn(sel.device_name || ""); setDloc(sel.location || ""); setAk(sel.api_key || ""); }, [sel]);

    const saveThresholds = async () => { setSaving(true); try { await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify({ gas_threshold: gas, smoke_threshold: smoke, humidity_threshold: humidity, temperature_threshold: temp, flame_threshold: flame }) }); } finally { setSaving(false); } };
    const saveDevice = async () => { if (!sel) return; setDs(true); try { await fetch(`/api/devices/${sel.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify({ device_name: dn.trim(), location: dloc.trim() }) }); } finally { setDs(false); } };
    const resetDevice = async () => { if (!sel) return; setDr(true); try { await fetch(`/api/devices/${sel.id}/reset`, { method: "POST", headers: { Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" } }); } finally { setDr(false); } };

    const Slider = ({ label, value, min, max, unit, onChange }) => (
        <div className="py-2 sm:py-2.5 border-b border-[rgba(33,35,39,0.8)] last:border-b-0">
            <div className="flex justify-between items-center mb-1 sm:mb-1.5"><span className="text-[10px] sm:text-[11px] text-[#7d8187]">{label}</span><span className="text-sm sm:text-[15px] font-normal text-[#c4b5fd] tabular-nums" style={{ fontFamily: "'Geist Mono', monospace" }}>{value}{unit}</span></div>
            <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-[#7c3aed]" />
        </div>
    );

    return (
        <div className="pb-4 sm:pb-5 space-y-3 sm:space-y-4">
            <div><h1 className="text-xl sm:text-2xl font-normal tracking-tight">Settings</h1><p className="text-xs sm:text-sm text-[#7d8187] mt-0.5">Thresholds, fuzzy rules, device config</p></div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <GlassSurface className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-normal mb-2 sm:mb-3">Threshold Configuration</p>
                    <Slider label="Gas (Raw ADC)" value={gas} min={0} max={4095} unit="" onChange={setGas} />
                    <Slider label="Smoke (Raw ADC)" value={smoke} min={0} max={4095} unit="" onChange={setSmoke} />
                    <Slider label="Humidity (%)" value={humidity} min={0} max={100} unit="%" onChange={setHumidity} />
                    <Slider label="Temperature (°C)" value={temp} min={0} max={80} unit="°C" onChange={setTemp} />
                    <Slider label="Flame (Analog)" value={flame} min={100} max={4095} unit="" onChange={setFlame} />
                    <button onClick={saveThresholds} className="mt-3 w-full h-9 rounded-[9999px] bg-white text-[#0a0a0a] font-normal text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:bg-[#fafaf7] transition-all duration-150"><Save className="w-3.5 h-3.5" strokeWidth={1.5} />{saving ? "Saving..." : "Save Thresholds"}</button>
                </GlassSurface>

                <GlassSurface className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-normal mb-1">Fuzzy Logic Rules</p>
                    <p className="text-[10px] sm:text-[11px] text-[#7d8187] mb-2 sm:mb-3">27 rules — Sugeno</p>
                    <div className="overflow-auto thin-scroll"><table className="w-full min-w-[350px] sm:min-w-[400px] text-xs sm:text-sm"><thead><tr className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] text-[#7d8187] border-b border-[rgba(33,35,39,0.8)] font-normal"><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>#</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Gas</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Smoke</th><th className="text-left py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Temp</th><th className="text-right py-1.5 sm:py-2" style={{ fontFamily: "'Geist Mono', monospace" }}>Fan</th></tr></thead><tbody>{fuzzyRules.map((r, i) => <tr key={i} className="border-b border-[rgba(33,35,39,0.8)] hover:bg-[rgba(26,28,32,0.6)]"><td className="py-1 sm:py-1.5 text-[#7d8187]">{i+1}</td><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td className="text-right"><span className={`inline-flex px-1.5 py-0.5 rounded-[9999px] text-[9px] sm:text-[10px] font-normal ${fanColor(r[3])}`}>{r[3]}</span></td></tr>)}</tbody></table></div>
                </GlassSurface>
            </div>

            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <GlassSurface className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-normal mb-2 sm:mb-3">Notification Settings</p>
                    <div className="py-2 sm:py-2.5 border-b border-[rgba(33,35,39,0.8)] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5 text-[#7d8187]" strokeWidth={1.5} /><div><p className="text-xs sm:text-sm font-normal">Alert on BAHAYA only</p><p className="text-[10px] sm:text-[11px] text-[#7d8187]">Ignore INFO/WARN</p></div></div>
                        <button onClick={() => setDangerOnly(v => !v)} className={`w-9 sm:w-10 h-5 rounded-full relative transition-all duration-150 ${dangerOnly ? "bg-[#7c3aed]" : "bg-[rgba(54,58,63,0.8)]"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-150 ${dangerOnly ? "left-[18px]" : "left-0.5"}`} /></button>
                    </div>
                    <div className="py-2 sm:py-2.5"><div className="flex justify-between items-center mb-1 sm:mb-1.5"><span className="text-[10px] sm:text-[11px] text-[#7d8187]">Polling Interval</span><span className="text-sm sm:text-[15px] font-normal text-[#c4b5fd]" style={{ fontFamily: "'Geist Mono', monospace" }}>{polling}s</span></div><input type="range" min="1" max="10" value={polling} onChange={e => setPollingInterval(Number(e.target.value) * 1000)} className="w-full accent-[#7c3aed]" /></div>
                </GlassSurface>

                <GlassSurface className="p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-normal mb-2 sm:mb-3">Device Management</p>
                    <div className="space-y-2 sm:space-y-0">
                        <div className="py-2 sm:py-2.5 border-b border-[rgba(33,35,39,0.8)]"><p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] text-[#7d8187] mb-1" style={{ fontFamily: "'Geist Mono', monospace" }}>Device</p><select value={sid || ""} onChange={e => setSid(Number(e.target.value))} disabled={dl || !devices.length} className="text-xs sm:text-sm w-full bg-transparent outline-none border-b border-[rgba(33,35,39,0.8)] text-white pb-0.5 focus:border-[#7c3aed] transition-all duration-150 font-normal">{!devices.length ? <option value="">{dl ? "Loading..." : "No devices"}</option> : null}{devices.map(d => <option key={d.id} value={d.id}>{d.location || d.device_name || `Device ${d.id}`}</option>)}</select></div>
                        <div className="py-2 sm:py-2.5 border-b border-[rgba(33,35,39,0.8)] flex justify-between"><div><p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace" }}>Status</p><p className="text-xs sm:text-sm mt-0.5 font-normal">{sel?.status || "unknown"}</p></div><span className="text-[10px] text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace" }}>#{sel?.id || "-"}</span></div>
                        <div className="py-2 sm:py-2.5 border-b border-[rgba(33,35,39,0.8)] flex justify-between items-center gap-2"><div><p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace" }}>API Key</p><p className="text-xs sm:text-sm mt-0.5 font-normal" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{mask(ak)}</p></div><button onClick={() => { if (ak) navigator.clipboard.writeText(ak); }} disabled={!ak} className="h-7 px-2 rounded-[9999px] border border-[rgba(33,35,39,0.8)] bg-[rgba(10,10,10,0.6)] inline-flex items-center gap-1 text-[10px] text-[#7d8187] hover:border-[#7c3aed] transition-all duration-150 disabled:opacity-50"><Copy className="w-3 h-3" />Copy</button></div>
                        <div className="py-2 sm:py-2.5 border-b border-[rgba(33,35,39,0.8)]"><p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] text-[#7d8187] mb-1" style={{ fontFamily: "'Geist Mono', monospace" }}>Name</p><input value={dn} onChange={e => setDn(e.target.value)} disabled={!sel} className="text-xs sm:text-sm w-full bg-transparent outline-none border-b border-[rgba(33,35,39,0.8)] text-white pb-0.5 focus:border-[#7c3aed] transition-all duration-150 font-normal" /></div>
                        <div className="py-2 sm:py-2.5 border-b border-[rgba(33,35,39,0.8)]"><p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] text-[#7d8187] mb-1" style={{ fontFamily: "'Geist Mono', monospace" }}>Location</p><input value={dloc} onChange={e => setDloc(e.target.value)} disabled={!sel} className="text-xs sm:text-sm w-full bg-transparent outline-none border-b border-[rgba(33,35,39,0.8)] text-white pb-0.5 focus:border-[#7c3aed] transition-all duration-150 font-normal" placeholder="Warehouse" /></div>
                        <div className="py-2 sm:py-2.5 flex gap-2">
                            <button onClick={saveDevice} disabled={!sel || ds || !dn.trim() || !dloc.trim()} className="flex-1 h-8 sm:h-9 rounded-[9999px] bg-white text-[#0a0a0a] font-normal text-xs sm:text-sm hover:bg-[#fafaf7] transition-all duration-150 disabled:opacity-50">{ds ? "Saving..." : "Save Device"}</button>
                            <button onClick={resetDevice} disabled={!sel || dr} className="flex-1 h-8 sm:h-9 rounded-[9999px] bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 font-normal text-xs sm:text-sm hover:bg-[#ef4444]/20 transition-all duration-150 disabled:opacity-50">{dr ? "Resetting..." : "Reset"}</button>
                        </div>
                    </div>
                </GlassSurface>
            </div>
        </div>
    );
}
