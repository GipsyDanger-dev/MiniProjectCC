import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import GlassSurface from "./GlassSurface";
import Slider from "./ui/Slider";

export default function ThresholdSettings({ settings, onSave }) {
    const [gas, setGas] = useState(600), [smoke, setSmoke] = useState(300), [temp, setTemp] = useState(50), [flame, setFlame] = useState("Medium"), [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false);
    useEffect(() => { if (!settings || dirty || saving) return; setGas(Number(settings.gas_threshold || 600)); setSmoke(Number(settings.smoke_threshold || 300)); setTemp(Number(settings.temp_threshold || 50)); }, [settings, dirty, saving]);

    const SliderRow = ({ label, value, min, max, unit, onChange }) => (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="text-white font-normal">{label}</span>
                <span className="text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{value} {unit}</span>
            </div>
            <Slider min={min} max={max} value={[value]} onValueChange={([v]) => { setDirty(true); onChange(v); }} />
        </div>
    );

    return (
        <GlassSurface className="p-3 sm:p-5">
            <h3 className="text-xs sm:text-sm font-normal text-white tracking-tight">Konfigurasi Threshold</h3>
            <p className="text-[11px] sm:text-xs mt-0.5 mb-3 sm:mb-4 text-[#7d8187]">Atur batas ambang peringatan</p>
            <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2">
                <SliderRow label="Gas threshold" value={gas} min={0} max={1000} unit="ppm" onChange={setGas} />
                <SliderRow label="Asap threshold" value={smoke} min={0} max={500} unit="ppm" onChange={setSmoke} />
                <SliderRow label="Suhu threshold" value={temp} min={0} max={80} unit="°C" onChange={setTemp} />
                <div>
                    <span className="text-sm text-white font-normal">Api sensitivity</span>
                    <div className="mt-2 inline-flex w-full rounded-lg bg-[#0a0a0a] border border-[#212327] p-0.5">
                        {["Low", "Medium", "High"].map(l => (
                            <button key={l} onClick={() => { setDirty(true); setFlame(l); }}
                                className={`flex-1 py-1.5 rounded-md text-xs transition-all duration-150 font-normal ${flame === l ? "bg-white text-[#0a0a0a]" : "text-[#7d8187] hover:text-white"}`}>
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-5 flex justify-end">
                <button onClick={async () => { setSaving(true); await onSave?.({ gas_threshold: gas, smoke_threshold: smoke, temperature_threshold: temp, flame_threshold: flame === "Low" ? 700 : flame === "Medium" ? 500 : 350 }); setSaving(false); setDirty(false); }}
                    className="inline-flex items-center gap-2 px-5 h-10 rounded-[9999px] bg-white text-[#0a0a0a] font-normal text-sm hover:bg-[#fafaf7] transition-all duration-150">
                    <Save className="w-4 h-4" strokeWidth={1.5} />{saving ? "Saving..." : "Simpan Perubahan"}
                </button>
            </div>
        </GlassSurface>
    );
}
