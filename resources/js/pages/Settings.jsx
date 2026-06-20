import React, { useEffect, useMemo, useState } from "react";
import { Copy, Save, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";

const fuzzyRules = [
    ["LOW", "LOW", "LOW", "SAFE"],
    ["LOW", "LOW", "MED", "LOW"],
    ["LOW", "LOW", "HIGH", "HIGH"],
    ["LOW", "MED", "LOW", "LOW"],
    ["LOW", "MED", "MED", "MEDIUM"],
    ["LOW", "MED", "HIGH", "HIGH"],
    ["LOW", "HIGH", "LOW", "HIGH"],
    ["LOW", "HIGH", "MED", "HIGH"],
    ["LOW", "HIGH", "HIGH", "HIGH"],
    ["MED", "LOW", "LOW", "LOW"],
    ["MED", "LOW", "MED", "MEDIUM"],
    ["MED", "LOW", "HIGH", "HIGH"],
    ["MED", "MED", "LOW", "MEDIUM"],
    ["MED", "MED", "MED", "MEDIUM"],
    ["MED", "MED", "HIGH", "HIGH"],
    ["MED", "HIGH", "LOW", "HIGH"],
    ["MED", "HIGH", "MED", "HIGH"],
    ["MED", "HIGH", "HIGH", "HIGH"],
    ["HIGH", "LOW", "LOW", "HIGH"],
    ["HIGH", "LOW", "MED", "HIGH"],
    ["HIGH", "LOW", "HIGH", "HIGH"],
    ["HIGH", "MED", "LOW", "HIGH"],
    ["HIGH", "MED", "MED", "HIGH"],
    ["HIGH", "MED", "HIGH", "HIGH"],
    ["HIGH", "HIGH", "LOW", "HIGH"],
    ["HIGH", "HIGH", "MED", "HIGH"],
    ["HIGH", "HIGH", "HIGH", "HIGH"],
];

const fanOutputClass = (value) => {
    if (value === "SAFE") return "text-success border-success bg-success/10";
    if (value === "LOW") return "text-ink3 border-edge2 bg-surface3";
    if (value === "MEDIUM") return "text-accent border-accent bg-accent/10";
    if (value === "HIGH") return "text-orange-700 border-orange-400 bg-orange-50";
    return "text-danger border-danger bg-danger/10";
};

const maskApiKey = (value) => {
    if (!value) return "-";
    if (value.length <= 8) return value;
    return `${value.slice(0, 6)}••••${value.slice(-4)}`;
};

export default function Settings({ iot, pollingInterval, setPollingInterval }) {
    const [gas, setGas] = useState(2500);
    const [smoke, setSmoke] = useState(2000);
    const [humidity, setHumidity] = useState(70);
    const [temp, setTemp] = useState(45);
    const [flame, setFlame] = useState(500);
    const [dangerOnly, setDangerOnly] = useState(() => {
        try { return localStorage.getItem("dangerOnly") === "true"; } catch { return false; }
    });
    const polling = Math.round((pollingInterval || 3000) / 1000);
    const [saving, setSaving] = useState(false);
    const [saveFeedback, setSaveFeedback] = useState(null);
    const [devices, setDevices] = useState([]);
    const [devicesLoading, setDevicesLoading] = useState(true);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [deviceName, setDeviceName] = useState("");
    const [deviceLocation, setDeviceLocation] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [deviceSaving, setDeviceSaving] = useState(false);
    const [deviceResetting, setDeviceResetting] = useState(false);

    useEffect(() => {
        const settings = iot.data?.settings;
        if (!settings) return;
        setGas(Number(settings.gas_threshold ?? 2500));
        setSmoke(Number(settings.smoke_threshold ?? 2000));
        setHumidity(Number(settings.humidity_threshold ?? 70));
        setTemp(Number(settings.temperature_threshold ?? 45));
        setFlame(Number(settings.flame_threshold ?? 500));
    }, [iot.data?.settings]);

    useEffect(() => {
        let active = true;
        const loadDevices = async () => {
            setDevicesLoading(true);
            try {
                const res = await fetch("/api/devices", { headers: { Accept: "application/json" } });
                const payload = await res.json();
                if (!active) return;
                if (payload.status === "success") {
                    setDevices(payload.data || payload.devices || []);
                } else {
                    setDevices([]);
                }
            } catch (_error) {
                if (active) setDevices([]);
            } finally {
                if (active) setDevicesLoading(false);
            }
        };
        loadDevices();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!devices.length) return;
        const hasSelected = selectedDeviceId && devices.some((device) => device.id === selectedDeviceId);
        if (hasSelected) return;
        const preferredId = Number(iot?.data?.device_id);
        const matched = devices.find((device) => device.id === preferredId);
        const nextId = matched?.id || devices[0]?.id || null;
        if (nextId) setSelectedDeviceId(nextId);
    }, [devices, iot?.data?.device_id, selectedDeviceId]);

    const selectedDevice = useMemo(() => devices.find((device) => device.id === selectedDeviceId) || null, [devices, selectedDeviceId]);

    useEffect(() => {
        if (!selectedDevice) return;
        setDeviceName(selectedDevice.device_name || "");
        setDeviceLocation(selectedDevice.location || "");
        setApiKey(selectedDevice.api_key || "");
    }, [selectedDevice]);

    useEffect(() => {
        try { localStorage.setItem("dangerOnly", String(dangerOnly)); } catch {}
    }, [dangerOnly]);

    const previewStatus = useMemo(() => {
        const latest = iot?.latestReading;
        if (!latest) return { label: "AMAN", className: "text-success border-success bg-success/10" };
        const g = Number(latest.gas_value || 0);
        const s = Number(latest.smoke_value || 0);
        const h = Number(latest.humidity || 0);
        const t = Number(latest.temperature || 0);
        const f = Number(latest.flame_value || 9999);
        if (f < flame || g > gas || s > smoke || h > humidity || t > temp) {
            return { label: "BAHAYA", className: "text-danger border-danger bg-danger/10" };
        }
        return { label: "AMAN", className: "text-success border-success bg-success/10" };
    }, [iot?.latestReading, gas, smoke, humidity, temp, flame]);

    const saveThresholds = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify({
                    gas_threshold: gas,
                    smoke_threshold: smoke,
                    humidity_threshold: humidity,
                    temperature_threshold: temp,
                    flame_threshold: flame,
                }),
            });
            const data = await res.json();
            if (data.status === "success") {
                setSaveFeedback({ type: "success", msg: "Thresholds saved!" });
            } else {
                setSaveFeedback({ type: "error", msg: data.message || "Failed to save" });
            }
        } catch (e) {
            setSaveFeedback({ type: "error", msg: "Failed to save thresholds" });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveFeedback(null), 3000);
        }
    };

    const handleSaveDevice = async () => {
        if (!selectedDevice) return;
        setDeviceSaving(true);
        try {
            const res = await fetch(`/api/devices/${selectedDevice.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify({ device_name: deviceName.trim(), location: deviceLocation.trim() }),
            });
            const payload = await res.json();
            if (payload.status === "success") {
                setDevices((prev) => prev.map((device) => device.id === selectedDevice.id ? payload.data : device));
            }
        } finally {
            setDeviceSaving(false);
        }
    };

    const handleResetDevice = async () => {
        if (!selectedDevice) return;
        setDeviceResetting(true);
        try {
            const res = await fetch(`/api/devices/${selectedDevice.id}/reset`, {
                method: "POST",
                headers: { Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" },
            });
            const payload = await res.json();
            if (payload.status === "success") {
                setDevices((prev) => prev.map((device) => device.id === selectedDevice.id ? { ...device, status: "offline" } : device));
            }
        } finally {
            setDeviceResetting(false);
        }
    };

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
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1 bg-surface3 border border-edge appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:cursor-pointer"
            />
        </div>
    );

    const latest = iot?.latestReading;

    return (
        <div className="flex flex-col gap-2.5">
            <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Settings</p>
                <p className="text-[10px] text-ink3 mt-0.5">Thresholds, fuzzy rules, and device configuration</p>
            </div>

            <div className="grid gap-2.5 md:grid-cols-2">
                <div className="bg-surface2 border border-edge">
                    <div className="px-3 py-2 border-b border-edge">
                        <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Threshold Configuration</p>
                    </div>
                    <div className="px-3">
                        <SliderRow label="Gas (Raw ADC)" value={gas} min={0} max={4095} unit="" onChange={setGas} />
                        <SliderRow label="Smoke (Raw ADC)" value={smoke} min={0} max={4095} unit="" onChange={setSmoke} />
                        <SliderRow label="Humidity (%)" value={humidity} min={0} max={100} unit="%" onChange={setHumidity} />
                        <SliderRow label="Temperature (°C)" value={temp} min={0} max={80} unit="°C" onChange={setTemp} />
                        <SliderRow label="Flame (Analog)" value={flame} min={100} max={4095} unit="" onChange={setFlame} />
                    </div>
                    <div className="px-3 py-2 border-t border-edge">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] text-ink3">
                                Live preview: gas {Math.round(Number(latest?.gas_value || 0))}ppm,
                                smoke {Math.round(Number(latest?.smoke_value || 0))},
                                api {Math.round(Number(latest?.flame_value || 0))},
                                kelembapan {Math.round(Number(latest?.humidity || 0))}%,
                                suhu {Math.round(Number(latest?.temperature || 0))}°C
                            </p>
                            <span className={`text-[10px] uppercase tracking-[0.06em] px-1.5 py-0.5 border ${previewStatus.className}`}>{previewStatus.label}</span>
                        </div>
                        <button
                            type="button"
                            onClick={saveThresholds}
                            className="w-full h-8 bg-accent text-white text-[10px] uppercase tracking-[0.1em] font-medium flex items-center justify-center gap-1.5 hover:bg-accent/80 transition-smooth"
                        >
                            <Save className="w-3 h-3" />
                            {saving ? "Saving..." : "Save Thresholds"}
                        </button>
                        {saveFeedback && (
                            <div className={`mt-2 px-2 py-1.5 text-[10px] border ${
                                saveFeedback.type === "success" ? "bg-success/10 text-success border-success" : "bg-danger/10 text-danger border-danger"
                            }`}>
                                {saveFeedback.msg}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-surface2 border border-edge">
                    <div className="px-3 py-2 border-b border-edge">
                        <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Fuzzy Logic Rules</p>
                        <p className="text-[9px] text-ink3">Read-only mapping of inputs to fan speed (27 rules — Sugeno)</p>
                    </div>
                    <div className="overflow-auto thin-scroll">
                        <table className="w-full min-w-[380px]">
                            <thead>
                                <tr className="text-[10px] uppercase tracking-[0.08em] text-ink3 border-b border-edge">
                                    <th className="text-left px-3 py-2">#</th>
                                    <th className="text-left px-3 py-2">Gas</th>
                                    <th className="text-left px-3 py-2">Smoke</th>
                                    <th className="text-left px-3 py-2">Suhu</th>
                                    <th className="text-right px-3 py-2">Fan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fuzzyRules.map((rule, idx) => (
                                    <tr key={`${rule.join("-")}-${idx}`} className="border-b border-edge hover:bg-surface3 transition-smooth">
                                        <td className="px-3 py-1.5 text-[10px] text-ink3">{idx + 1}</td>
                                        <td className="px-3 py-1.5 text-[10px] text-ink">{rule[0]}</td>
                                        <td className="px-3 py-1.5 text-[10px] text-ink">{rule[1]}</td>
                                        <td className="px-3 py-1.5 text-[10px] text-ink">{rule[2]}</td>
                                        <td className="px-3 py-1.5 text-right">
                                            <span className={`inline-flex px-1.5 py-0.5 text-[9px] uppercase tracking-[0.06em] border ${fanOutputClass(rule[3])}`}>
                                                {rule[3]}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid gap-2.5 md:grid-cols-2">
                <div className="bg-surface2 border border-edge">
                    <div className="px-3 py-2 border-b border-edge">
                        <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Notification Settings</p>
                    </div>
                    <div className="px-3">
                        <div className="py-2.5 border-b border-edge flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-3 h-3 text-ink3" />
                                <div>
                                    <p className="text-[10px] text-ink">Alert on BAHAYA only</p>
                                    <p className="text-[9px] text-ink3">Ignore INFO/WARN notifications</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDangerOnly((v) => !v)}
                                className={`w-9 h-[18px] border cursor-pointer relative transition-smooth ${dangerOnly ? "bg-accent/10 border-accent" : "bg-surface3 border-edge2"}`}
                            >
                                <span className={`absolute top-0.5 w-3 h-3 transition-all ${dangerOnly ? "left-[18px] bg-accent" : "left-0.5 bg-edge2"}`} />
                            </button>
                        </div>
                        <div className="py-2.5">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-[10px] uppercase tracking-[0.08em] text-ink3">Polling Interval</span>
                                <span className="text-[15px] font-medium text-accent tabular-nums">{polling}s</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={polling}
                                onChange={(e) => setPollingInterval(Number(e.target.value) * 1000)}
                                className="w-full h-1 bg-surface3 border border-edge appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:border-none [&::-webkit-slider-thumb]:cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-surface2 border border-edge">
                    <div className="px-3 py-2 border-b border-edge">
                        <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Device Management</p>
                    </div>
                    <div className="px-3">
                        <div className="py-2.5 border-b border-edge">
                            <p className="text-[9px] uppercase tracking-[0.08em] text-ink3 mb-1">Device</p>
                            <select
                                value={selectedDeviceId || ""}
                                onChange={(e) => setSelectedDeviceId(Number(e.target.value))}
                                disabled={devicesLoading || !devices.length}
                                className="text-[10px] w-full bg-transparent outline-none border-b border-edge text-ink pb-0.5 focus:border-accent transition-smooth"
                            >
                                {!devices.length ? (
                                    <option value="">{devicesLoading ? "Loading devices..." : "No devices available"}</option>
                                ) : null}
                                {devices.map((device) => (
                                    <option key={device.id} value={device.id}>
                                        {device.location || device.device_name || `Device ${device.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="py-2.5 border-b border-edge flex items-center justify-between">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.08em] text-ink3">Status</p>
                                <p className="text-[10px] text-ink mt-0.5">{selectedDevice?.status || "unknown"}</p>
                            </div>
                            <span className="text-[9px] uppercase tracking-[0.06em] text-ink3">ID #{selectedDevice?.id || "-"}</span>
                        </div>
                        <div className="py-2.5 border-b border-edge flex items-center justify-between gap-2">
                            <div>
                                <p className="text-[9px] uppercase tracking-[0.08em] text-ink3">API Key</p>
                                <p className="text-[10px] text-ink mt-0.5">{maskApiKey(apiKey)}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { if (!apiKey) return; navigator.clipboard.writeText(apiKey); alert("API Key copied!"); }}
                                disabled={!apiKey}
                                className="h-6 px-2 border border-edge bg-surface3 inline-flex items-center gap-1 text-[10px] text-ink3 hover:border-accent transition-smooth disabled:opacity-50"
                            >
                                <Copy className="w-3 h-3" /> Copy
                            </button>
                        </div>
                        <div className="py-2.5 border-b border-edge">
                            <p className="text-[9px] uppercase tracking-[0.08em] text-ink3 mb-1">Device Name</p>
                            <input
                                type="text"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
                                disabled={!selectedDevice}
                                className="text-[10px] w-full bg-transparent outline-none border-b border-edge text-ink pb-0.5 focus:border-accent transition-smooth"
                            />
                        </div>
                        <div className="py-2.5 border-b border-edge">
                            <p className="text-[9px] uppercase tracking-[0.08em] text-ink3 mb-1">Location</p>
                            <input
                                type="text"
                                value={deviceLocation}
                                onChange={(e) => setDeviceLocation(e.target.value)}
                                disabled={!selectedDevice}
                                className="text-[10px] w-full bg-transparent outline-none border-b border-edge text-ink pb-0.5 focus:border-accent transition-smooth"
                                placeholder="Warehouse"
                            />
                        </div>
                        <div className="py-2.5 flex gap-2">
                            <button
                                type="button"
                                onClick={handleSaveDevice}
                                disabled={!selectedDevice || deviceSaving || !deviceName.trim() || !deviceLocation.trim()}
                                className="flex-1 h-7 bg-accent text-white text-[10px] uppercase tracking-[0.1em] font-medium hover:bg-accent/80 transition-smooth disabled:opacity-50"
                            >
                                {deviceSaving ? "Saving..." : "Save Device"}
                            </button>
                            <button
                                type="button"
                                onClick={handleResetDevice}
                                disabled={!selectedDevice || deviceResetting}
                                className="flex-1 h-7 bg-danger/10 text-danger border border-danger text-[10px] uppercase tracking-[0.1em] font-medium hover:bg-danger/20 transition-smooth disabled:opacity-50"
                            >
                                {deviceResetting ? "Resetting..." : "Reset Device"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
