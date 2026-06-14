import React, { useState } from "react";
import { Cpu, KeyRound, MapPin, PlusCircle } from "lucide-react";
import GlassSurface from "../components/GlassSurface";

export default function NewDevice({ onCreated, onReload }) {
    const [dn, setDn] = useState(""), [loc, setLoc] = useState(""), [ak, setAk] = useState(""), [st, setSt] = useState("offline"), [sub, setSub] = useState(false), [err, setErr] = useState(""), [ok, setOk] = useState("");

    const submit = async e => {
        e.preventDefault(); setErr(""); setOk("");
        if (!dn.trim() || !loc.trim() || !ak.trim()) { setErr("Please complete all fields."); return; }
        setSub(true);
        try {
            const r = await fetch("/api/devices", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify({ device_name: dn.trim(), location: loc, api_key: ak.trim(), status: st }) });
            const p = await r.json();
            if (p.status !== "success") { setErr(p.message || "Failed."); return; }
            setOk("Device created."); setDn(""); setAk(""); setSt("offline"); onCreated?.(p.device); onReload?.();
        } catch { setErr("Failed to create."); } finally { setSub(false); }
    };

    return (
        <div className="pb-4 sm:pb-5 space-y-3 sm:space-y-5">
            <div><h1 className="text-xl sm:text-2xl font-normal text-white tracking-tight">New Device</h1><p className="text-xs sm:text-sm text-[#7d8187] mt-0.5">Add a new device for your rooms.</p></div>
            <GlassSurface className="p-3 sm:p-5 max-w-xl">
                <form onSubmit={submit} className="space-y-3">
                    <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5">
                        <p className="text-[11px] uppercase tracking-[1.4px] text-[#7d8187] font-normal flex items-center gap-1.5" style={{ fontFamily: "'Geist Mono', monospace" }}><Cpu className="w-3 h-3" />Device Name</p>
                        <input value={dn} onChange={e => setDn(e.target.value)} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-[#212327] text-white pb-1 focus:border-white/40 transition-all duration-150 font-normal" placeholder="Warehouse Gateway" />
                    </div>
                    <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5">
                        <p className="text-[11px] uppercase tracking-[1.4px] text-[#7d8187] font-normal flex items-center gap-1.5" style={{ fontFamily: "'Geist Mono', monospace" }}><MapPin className="w-3 h-3" />Location</p>
                        <input value={loc} onChange={e => setLoc(e.target.value)} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-[#212327] text-white pb-1 focus:border-white/40 transition-all duration-150 font-normal" placeholder="Warehouse" />
                    </div>
                    <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5">
                        <p className="text-[11px] uppercase tracking-[1.4px] text-[#7d8187] font-normal flex items-center gap-1.5" style={{ fontFamily: "'Geist Mono', monospace" }}><KeyRound className="w-3 h-3" />API Key</p>
                        <input value={ak} onChange={e => setAk(e.target.value)} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-[#212327] text-white pb-1 focus:border-white/40 transition-all duration-150 font-normal" placeholder="key-001" />
                    </div>
                    <div className="rounded-lg border border-[#212327] bg-[#0a0a0a] px-3 py-2.5">
                        <p className="text-[11px] uppercase tracking-[1.4px] text-[#7d8187] font-normal" style={{ fontFamily: "'Geist Mono', monospace" }}>Status</p>
                        <select value={st} onChange={e => setSt(e.target.value)} className="device-select text-sm mt-1.5 w-full bg-transparent outline-none border-b border-[#212327] text-white pb-1 focus:border-white/40 transition-all duration-150 font-normal">
                            <option value="offline">offline</option>
                            <option value="online">online</option>
                        </select>
                    </div>
                    {err && <p className="text-xs text-[#ef4444]">{err}</p>}
                    {ok && <p className="text-xs text-[#22c55e]">{ok}</p>}
                    <button type="submit" disabled={sub || !dn.trim() || !ak.trim() || !loc.trim()}
                        className="h-10 px-5 rounded-[9999px] bg-white text-[#0a0a0a] font-normal text-sm hover:bg-[#fafaf7] transition-all duration-150 disabled:opacity-50 inline-flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" strokeWidth={1.5} />{sub ? "Creating..." : "Create Device"}
                    </button>
                </form>
            </GlassSurface>
        </div>
    );
}
