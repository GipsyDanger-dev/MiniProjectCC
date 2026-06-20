import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";

export default function ThresholdSettings({ settings, onSave }) {
    const [gas, setGas] = useState(2500);
    const [smoke, setSmoke] = useState(2000);
    const [humidity, setHumidity] = useState(70);
    const [temp, setTemp] = useState(45);
    const [flame, setFlame] = useState(500);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!settings || dirty || saving) return;
        setGas(Number(settings.gas_threshold ?? 2500));
        setSmoke(Number(settings.smoke_threshold ?? 2000));
        setHumidity(Number(settings.humidity_threshold ?? 70));
        setTemp(Number(settings.temperature_threshold ?? 45));
        setFlame(Number(settings.flame_threshold ?? 500));
    }, [settings, dirty, saving]);

    const SliderRow = ({ label, value, min, max, unit, onChange }) => (
        <div className="py-2.5 border-b border-edge last:border-b-0">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.08em] text-ink3">{label}</span>
                <span className="text-[15px] font-medium text-accent tabular-nums">{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => { setDirty(true); onChange(Number(e.target.value)); }}
                className="w-full h-1 bg-surface3 border border-edge appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:cursor-pointer"
            />
        </div>
    );

    return (
        <div className="bg-surface2 border border-edge">
            <div className="px-3 py-2 border-b border-edge">
                <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Threshold Quick-Set</p>
            </div>
            <div className="px-3">
                <SliderRow label="Gas (Raw ADC)" value={gas} min={0} max={4095} unit="" onChange={setGas} />
                <SliderRow label="Smoke (Raw ADC)" value={smoke} min={0} max={4095} unit="" onChange={setSmoke} />
                <SliderRow label="Humidity (%)" value={humidity} min={0} max={100} unit="%" onChange={setHumidity} />
                <SliderRow label="Temperature (°C)" value={temp} min={0} max={80} unit="°C" onChange={setTemp} />
                <SliderRow label="Flame (Analog)" value={flame} min={0} max={4095} unit="" onChange={setFlame} />
            </div>
            <div className="px-3 py-2">
                <button
                    type="button"
                    onClick={async () => {
                        setSaving(true);
                        try {
                            await onSave?.({
                                gas_threshold: gas,
                                smoke_threshold: smoke,
                                humidity_threshold: humidity,
                                temperature_threshold: temp,
                                flame_threshold: flame,
                            });
                            setDirty(false);
                        } catch (_e) {
                            // keep dirty state so user can retry
                        } finally {
                            setSaving(false);
                        }
                    }}
                    className="w-full h-8 bg-accent text-white text-[10px] uppercase tracking-[0.1em] font-medium flex items-center justify-center gap-1.5 hover:bg-accent/80 transition-smooth"
                >
                    <Save className="w-3 h-3" />
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </div>
    );
}
