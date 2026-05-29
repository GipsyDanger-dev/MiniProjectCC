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
        <div className="pb-5 space-y-5">
            <div><h1 className="text-2xl font-bold">New Device</h1><p className="text-sm text-muted-foreground mt-0.5">Add a new device for your rooms.</p></div>
            <GlassSurface className="p-5 max-w-xl">
                <form onSubmit={submit} className="space-y-3">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold flex items-center gap-1.5"><Cpu className="w-3 h-3" />Device Name</p><input value={dn} onChange={e => setDn(e.target.value)} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-white/[0.06] text-foreground pb-1 focus:border-violet/40 transition-smooth" placeholder="Warehouse Gateway" /></div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold flex items-center gap-1.5"><MapPin className="w-3 h-3" />Location</p><input value={loc} onChange={e => setLoc(e.target.value)} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-white/[0.06] text-foreground pb-1 focus:border-violet/40 transition-smooth" placeholder="Warehouse" /></div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold flex items-center gap-1.5"><KeyRound className="w-3 h-3" />API Key</p><input value={ak} onChange={e => setAk(e.target.value)} className="text-sm mt-1.5 w-full bg-transparent outline-none border-b border-white/[0.06] text-foreground pb-1 focus:border-violet/40 transition-smooth" placeholder="key-001" /></div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Status</p><select value={st} onChange={e => setSt(e.target.value)} className="device-select text-sm mt-1.5 w-full bg-transparent outline-none border-b border-white/[0.06] text-foreground pb-1 focus:border-violet/40 transition-smooth"><option value="offline">offline</option><option value="online">online</option></select></div>
                    {err && <p className="text-xs text-danger">{err}</p>}
                    {ok && <p className="text-xs text-success">{ok}</p>}
                    <button type="submit" disabled={sub || !dn.trim() || !ak.trim() || !loc.trim()} className="h-10 px-5 rounded-lg bg-violet/15 text-violet border border-violet/25 font-semibold text-sm hover:bg-violet/25 transition-smooth disabled:opacity-50 inline-flex items-center gap-2"><PlusCircle className="w-4 h-4" />{sub ? "Creating..." : "Create Device"}</button>
                </form>
            </GlassSurface>
        </div>
    );
}
