import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import GlassSurface from "./GlassSurface";

export default function ThresholdSettings({ settings, onSave }) {
    const [gas, setGas] = useState(600), [smoke, setSmoke] = useState(300), [temp, setTemp] = useState(50), [flame, setFlame] = useState("Medium"), [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false);
    useEffect(() => { if (!settings || dirty || saving) return; setGas(Number(settings.gas_threshold || 600)); setSmoke(Number(settings.smoke_threshold || 300)); setTemp(Number(settings.temp_threshold || 50)); }, [settings, dirty, saving]);

    return (
        <GlassSurface className="p-5">
            <h3 className="text-lg font-semibold">Threshold Settings</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">Configure alert boundaries</p>
            <div className="grid gap-4 md:grid-cols-2">
                <div><div className="flex justify-between text-sm"><span>Gas threshold</span><span className="text-muted-foreground">{gas} ppm</span></div><input type="range" min="0" max="1000" value={gas} onChange={e => { setDirty(true); setGas(Number(e.target.value)); }} className="mt-2 w-full accent-violet" /></div>
                <div><div className="flex justify-between text-sm"><span>Smoke threshold</span><span className="text-muted-foreground">{smoke} ppm</span></div><input type="range" min="0" max="500" value={smoke} onChange={e => { setDirty(true); setSmoke(Number(e.target.value)); }} className="mt-2 w-full accent-violet" /></div>
                <div><div className="flex justify-between text-sm"><span>Temperature</span><span className="text-muted-foreground">{temp}°C</span></div><input type="range" min="0" max="80" value={temp} onChange={e => { setDirty(true); setTemp(Number(e.target.value)); }} className="mt-2 w-full accent-violet" /></div>
                <div><span className="text-sm">Flame sensitivity</span><div className="mt-2 inline-flex w-full rounded-lg bg-white/[0.05] border border-white/[0.08] p-0.5">{["Low", "Medium", "High"].map(l => <button key={l} onClick={() => { setDirty(true); setFlame(l); }} className={`flex-1 py-1.5 rounded-md text-xs transition-smooth ${flame === l ? "bg-card text-foreground" : "text-muted-foreground"}`}>{l}</button>)}</div></div>
            </div>
            <div className="mt-5 flex justify-end">
                <button onClick={async () => { setSaving(true); await onSave?.({ gas_threshold: gas, smoke_threshold: smoke, temperature_threshold: temp, flame_threshold: flame === "Low" ? 700 : flame === "Medium" ? 500 : 350 }); setSaving(false); setDirty(false); }} className="inline-flex items-center gap-2 px-5 h-10 rounded-lg bg-violet text-white font-semibold text-sm shadow-violet"><Save className="w-4 h-4" />{saving ? "Saving..." : "Save"}</button>
            </div>
        </GlassSurface>
    );
}
