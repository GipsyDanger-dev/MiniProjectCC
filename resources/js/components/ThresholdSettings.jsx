import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";

export default function ThresholdSettings({ settings, onSave }) {
    const [gas, setGas] = useState(600);
    const [smoke, setSmoke] = useState(300);
    const [temp, setTemp] = useState(50);
    const [flame, setFlame] = useState("Medium");
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!settings || dirty || saving) return;
        setGas(Number(settings.gas_threshold || 600));
        setSmoke(Number(settings.smoke_threshold || 300));
        setTemp(Number(settings.temp_threshold || 50));
    }, [settings, dirty, saving]);

    return (
        <div className="card-surface p-6">
            <h3 className="text-3xl font-semibold">Threshold Settings</h3>
            <p className="text-muted-foreground mt-1">
                Configure alert boundaries for each sensor
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                    <div className="flex items-center justify-between text-foreground">
                        <span className="text-lg font-semibold">
                            Gas threshold
                        </span>
                        <span className="text-lg">{gas} ppm</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={gas}
                        onChange={(e) => {
                            setDirty(true);
                            setGas(Number(e.target.value));
                        }}
                        className="mt-3 w-full accent-lime"
                    />
                    <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                        <span>0ppm</span>
                        <span>1000ppm</span>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-foreground">
                        <span className="text-lg font-semibold">
                            Smoke threshold
                        </span>
                        <span className="text-lg">{smoke} ppm</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="500"
                        value={smoke}
                        onChange={(e) => {
                            setDirty(true);
                            setSmoke(Number(e.target.value));
                        }}
                        className="mt-3 w-full accent-lime"
                    />
                    <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                        <span>0ppm</span>
                        <span>500ppm</span>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between text-foreground">
                        <span className="text-lg font-semibold">
                            Temperature threshold
                        </span>
                        <span className="text-lg">{temp} °C</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="80"
                        value={temp}
                        onChange={(e) => {
                            setDirty(true);
                            setTemp(Number(e.target.value));
                        }}
                        className="mt-3 w-full accent-lime"
                    />
                    <div className="mt-1 flex justify-between text-sm text-muted-foreground">
                        <span>0°C</span>
                        <span>80°C</span>
                    </div>
                </div>

                <div>
                    <span className="text-lg font-semibold">
                        Flame sensitivity
                    </span>
                    <div className="mt-4 inline-flex w-full rounded-full bg-muted/40 p-1">
                        {["Low", "Medium", "High"].map((level) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => {
                                    setDirty(true);
                                    setFlame(level);
                                }}
                                className={`flex-1 py-2 rounded-full transition-smooth ${flame === level ? "bg-card text-foreground" : "text-muted-foreground"}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    type="button"
                    onClick={async () => {
                        setSaving(true);
                        await onSave?.({
                            gas_threshold: gas,
                            smoke_threshold: smoke,
                            temperature_threshold: temp,
                            flame_threshold:
                                flame === "Low" ? 700 : flame === "Medium" ? 500 : 350,
                        });
                        setSaving(false);
                        setDirty(false);
                    }}
                    className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-lime text-lime-foreground font-semibold shadow-lime"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Settings"}
                </button>
            </div>
        </div>
    );
}
