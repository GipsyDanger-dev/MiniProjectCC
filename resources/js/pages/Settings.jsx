import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Bell,
    Copy,
    Moon,
    Save,
    ShieldAlert,
    SlidersHorizontal,
} from "lucide-react";
import { cn } from "../lib/utils";

const fuzzyRules = [
    ["LOW", "LOW", "LOW", "LOW"],
    ["LOW", "LOW", "MED", "LOW"],
    ["LOW", "MED", "LOW", "LOW"],
    ["MED", "LOW", "LOW", "LOW"],
    ["MED", "MED", "LOW", "MEDIUM"],
    ["MED", "MED", "MED", "MEDIUM"],
    ["MED", "LOW", "HIGH", "MEDIUM"],
    ["HIGH", "LOW", "LOW", "HIGH"],
    ["HIGH", "MED", "MED", "HIGH"],
    ["MED", "HIGH", "MED", "HIGH"],
    ["HIGH", "HIGH", "MED", "MAXIMUM"],
    ["HIGH", "HIGH", "HIGH", "MAXIMUM"],
    ["LOW", "LOW", "HIGH", "HIGH"],
];

const fanOutputClass = (value) => {
    if (value === "LOW")
        return "bg-blue-500/20 text-blue-300 border-blue-400/40";
    if (value === "MEDIUM")
        return "bg-amber-500/20 text-amber-300 border-amber-400/40";
    if (value === "HIGH")
        return "bg-orange-500/20 text-orange-300 border-orange-400/40";
    return "bg-danger/20 text-danger border-danger/40";
};

const maskApiKey = (value) => {
    if (!value) return "-";
    if (value.length <= 8) return value;
    return `${value.slice(0, 6)}••••${value.slice(-4)}`;
};

export default function Settings({
    theme,
    toggleTheme,
    collapsed,
    setCollapsed,
    iot,
}) {
    const [gas, setGas] = useState(600);
    const [smoke, setSmoke] = useState(300);
    const [temp, setTemp] = useState(50);
    const [flame, setFlame] = useState("Medium");
    const [webNotif, setWebNotif] = useState(true);
    const [dangerOnly, setDangerOnly] = useState(false);
    const [polling, setPolling] = useState(3);
    const [saving, setSaving] = useState(false);
    const [devices, setDevices] = useState([]);
    const [devicesLoading, setDevicesLoading] = useState(true);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [deviceName, setDeviceName] = useState("");
    const [deviceLocation, setDeviceLocation] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [deviceSaving, setDeviceSaving] = useState(false);
    const [deviceResetting, setDeviceResetting] = useState(false);
    const initSelectionRef = useRef(false);

    useEffect(() => {
        const settings = iot.data?.settings;
        if (!settings) return;
        setGas(Number(settings.gas_threshold || 600));
        setSmoke(Number(settings.smoke_threshold || 300));
        setTemp(Number(settings.temp_threshold || 50));
    }, [iot.data?.settings]);

    useEffect(() => {
        let active = true;
        const loadDevices = async () => {
            setDevicesLoading(true);
            try {
                const res = await fetch("/api/devices", {
                    headers: { Accept: "application/json" },
                });
                const payload = await res.json();
                if (!active) return;
                if (payload.status === "success") {
                    setDevices(payload.devices || []);
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
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!devices.length) return;
        const hasSelected =
            selectedDeviceId &&
            devices.some((device) => device.id === selectedDeviceId);
        if (hasSelected) {
            initSelectionRef.current = true;
            return;
        }

        const preferredId = Number(iot?.data?.device_id);
        const matched = devices.find((device) => device.id === preferredId);
        const nextId = matched?.id || devices[0]?.id || null;
        if (nextId) {
            setSelectedDeviceId(nextId);
        }
        initSelectionRef.current = true;
    }, [devices, iot?.data?.device_id, selectedDeviceId]);

    const selectedDevice = useMemo(
        () => devices.find((device) => device.id === selectedDeviceId) || null,
        [devices, selectedDeviceId],
    );

    useEffect(() => {
        if (!selectedDevice) return;
        setDeviceName(selectedDevice.device_name || "");
        setDeviceLocation(selectedDevice.location || "");
        setApiKey(selectedDevice.api_key || "");
    }, [selectedDevice]);

    const previewStatus = useMemo(() => {
        if (gas > 700 || smoke > 350 || temp > 55 || flame === "High") {
            return {
                label: "BAHAYA",
                className: "bg-danger/20 text-danger border-danger/40",
            };
        }
        return {
            label: "AMAN",
            className: "bg-success/20 text-success border-success/40",
        };
    }, [gas, smoke, temp, flame]);

    const saveThresholds = async () => {
        setSaving(true);
        try {
            await fetch("/api/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: JSON.stringify({
                    gas_threshold: gas,
                    smoke_threshold: smoke,
                    temperature_threshold: temp,
                    flame_threshold:
                        flame === "Low" ? 700 : flame === "Medium" ? 500 : 350,
                }),
            });
        } finally {
            setSaving(false);
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
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: JSON.stringify({
                    device_name: deviceName.trim(),
                    location: deviceLocation.trim(),
                }),
            });
            const payload = await res.json();
            if (payload.status === "success") {
                setDevices((prev) =>
                    prev.map((device) =>
                        device.id === selectedDevice.id
                            ? payload.device
                            : device,
                    ),
                );
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
                headers: {
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
            });
            const payload = await res.json();
            if (payload.status === "success") {
                setDevices((prev) =>
                    prev.map((device) =>
                        device.id === selectedDevice.id
                            ? { ...device, status: payload.device.status }
                            : device,
                    ),
                );
            }
        } finally {
            setDeviceResetting(false);
        }
    };

    return (
        <div className="pb-6 space-y-5">
            <div>
                <h1 className="text-4xl font-semibold text-foreground">
                    Settings
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Thresholds, fuzzy rules, and device configuration
                </p>
            </div>

            <section className="relative isolate overflow-hidden rounded-[20px] border border-white/15 backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-xl">
                <h2 className="text-xl font-semibold">
                    Threshold Configuration
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Adjust when SentinelIoT triggers the BAHAYA alert state
                </p>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Gas threshold</span>
                            <span className="text-sm text-muted-foreground">
                                {gas} ppm
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            value={gas}
                            onChange={(e) => setGas(Number(e.target.value))}
                            className="mt-2 w-full accent-lime"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Smoke threshold</span>
                            <span className="text-sm text-muted-foreground">
                                {smoke} ppm
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="500"
                            value={smoke}
                            onChange={(e) => setSmoke(Number(e.target.value))}
                            className="mt-2 w-full accent-lime"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">
                                Temperature threshold
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {temp}°C
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="80"
                            value={temp}
                            onChange={(e) => setTemp(Number(e.target.value))}
                            className="mt-2 w-full accent-lime"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Flame sensitivity</span>
                            <span className="text-sm text-muted-foreground">
                                {flame}
                            </span>
                        </div>
                        <div className="mt-2 inline-flex w-full rounded-full bg-black/25 border border-white/10 p-1">
                            {["Low", "Medium", "High"].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setFlame(level)}
                                    className={cn(
                                        "flex-1 h-8 rounded-full text-xs transition-smooth",
                                        flame === level
                                            ? "bg-card text-foreground"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-5 rounded-xl border border-white/10 bg-[linear-gradient(90deg,rgba(12,56,46,0.55),rgba(12,45,39,0.3))] p-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                        Live preview at current readings: gas 486ppm, smoke
                        215ppm, temp 37°C
                    </p>
                    <span
                        className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-semibold ${previewStatus.className}`}
                    >
                        {previewStatus.label}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={saveThresholds}
                    className="mt-4 h-11 w-full rounded-full bg-lime text-lime-foreground font-semibold inline-flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(204,255,0,0.35)]"
                >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Thresholds"}
                </button>
            </section>

            <section className="relative isolate overflow-hidden rounded-[20px] border border-white/15 backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-xl">
                <h2 className="text-xl font-semibold">Fuzzy Logic Rules</h2>
                <p className="text-xs text-muted-foreground mt-1">
                    Read-only mapping of inputs to fan speed output (13 rules)
                </p>

                <div className="mt-4 overflow-auto thin-scroll">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground border-b border-white/10">
                                <th className="text-left py-3">#</th>
                                <th className="text-left py-3">Gas</th>
                                <th className="text-left py-3">Smoke</th>
                                <th className="text-left py-3">Temp</th>
                                <th className="text-right py-3">Fan Output</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fuzzyRules.map((rule, idx) => (
                                <tr
                                    key={`${rule.join("-")}-${idx}`}
                                    className="border-b border-white/5 hover:bg-white/5"
                                >
                                    <td className="py-3 text-muted-foreground">
                                        {idx + 1}
                                    </td>
                                    <td>{rule[0]}</td>
                                    <td>{rule[1]}</td>
                                    <td>{rule[2]}</td>
                                    <td className="text-right">
                                        <span
                                            className={`inline-flex px-2 py-1 rounded-full border text-[10px] ${fanOutputClass(
                                                rule[3],
                                            )}`}
                                        >
                                            {rule[3]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
                <div className="space-y-5">
                    <article className="rounded-[20px] border border-white/15 backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-xl">
                        <h2 className="text-xl font-semibold">
                            Notification Settings
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            Control when and how you get alerted
                        </p>

                        <div className="mt-4 space-y-3">
                            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm">
                                            Web notifications
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Browser push for critical events
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setWebNotif((v) => !v)}
                                    className={`w-12 h-6 rounded-full p-1 transition-all ${
                                        webNotif ? "bg-lime" : "bg-muted"
                                    }`}
                                >
                                    <span
                                        className={`block w-4 h-4 rounded-full bg-background transition-transform ${
                                            webNotif
                                                ? "translate-x-6"
                                                : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm">
                                            Alert on BAHAYA only
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Ignore INFO/WARN notifications
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDangerOnly((v) => !v)}
                                    className={`w-12 h-6 rounded-full p-1 transition-all ${
                                        dangerOnly ? "bg-lime" : "bg-muted"
                                    }`}
                                >
                                    <span
                                        className={`block w-4 h-4 rounded-full bg-background transition-transform ${
                                            dangerOnly
                                                ? "translate-x-6"
                                                : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                        Polling interval
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {polling}s
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={polling}
                                    onChange={(e) =>
                                        setPolling(Number(e.target.value))
                                    }
                                    className="mt-2 w-full accent-lime"
                                />
                            </div>
                        </div>
                    </article>

                    <article className="rounded-[20px] border border-white/15 backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-xl">
                        <h2 className="text-xl font-semibold">
                            Device Management
                        </h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            API key and hardware controls
                        </p>
                        <div className="mt-4 space-y-3">
                            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    Device
                                </p>
                                <select
                                    value={selectedDeviceId || ""}
                                    onChange={(e) =>
                                        setSelectedDeviceId(Number(e.target.value))
                                    }
                                    disabled={devicesLoading || !devices.length}
                                    className="device-select text-sm mt-2 w-full bg-transparent outline-none border-b border-white/10 text-foreground pb-1 focus:border-lime/50 transition-smooth"
                                >
                                    {!devices.length ? (
                                        <option value="">
                                            {devicesLoading
                                                ? "Loading devices..."
                                                : "No devices available"}
                                        </option>
                                    ) : null}
                                    {devices.map((device) => (
                                        <option key={device.id} value={device.id}>
                                            {device.location ||
                                                device.device_name ||
                                                `Device ${device.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                        Status
                                    </p>
                                    <p className="text-sm mt-1">
                                        {selectedDevice?.status || "unknown"}
                                    </p>
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    ID #{selectedDevice?.id || "-"}
                                </span>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                        API Key
                                    </p>
                                    <p className="text-sm mt-1">
                                        {maskApiKey(apiKey)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!apiKey) return;
                                        navigator.clipboard.writeText(apiKey);
                                        alert("API Key copied!");
                                    }}
                                    disabled={!apiKey}
                                    className="h-9 px-3 rounded-full border border-white/10 bg-black/20 inline-flex items-center gap-2 text-sm hover:border-lime/50 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </button>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    Device Name
                                </p>
                                <input
                                    type="text"
                                    value={deviceName}
                                    onChange={(e) =>
                                        setDeviceName(e.target.value)
                                    }
                                    disabled={!selectedDevice}
                                    className="text-sm mt-2 w-full bg-transparent outline-none border-b border-white/10 text-foreground pb-1 focus:border-lime/50 transition-smooth"
                                />
                            </div>
                            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    Location
                                </p>
                                <input
                                    type="text"
                                    value={deviceLocation}
                                    onChange={(e) =>
                                        setDeviceLocation(e.target.value)
                                    }
                                    disabled={!selectedDevice}
                                    className="text-sm mt-2 w-full bg-transparent outline-none border-b border-white/10 text-foreground pb-1 focus:border-lime/50 transition-smooth"
                                    placeholder="Warehouse"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSaveDevice}
                                disabled={
                                    !selectedDevice ||
                                    deviceSaving ||
                                    !deviceName.trim() ||
                                    !deviceLocation.trim()
                                }
                                className="h-10 px-4 rounded-full bg-lime/20 text-lime border border-lime/35 font-semibold hover:bg-lime/30 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {deviceSaving ? "Saving..." : "Save Device"}
                            </button>
                            <button
                                type="button"
                                onClick={handleResetDevice}
                                disabled={!selectedDevice || deviceResetting}
                                className="h-10 px-4 rounded-full bg-danger/20 text-danger border border-danger/35 font-semibold hover:bg-danger/30 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {deviceResetting ? "Resetting..." : "Reset Device"}
                            </button>
                        </div>
                    </article>
                </div>

                <article className="rounded-[20px] border border-white/15 backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-xl h-fit">
                    <h2 className="text-xl font-semibold">Appearance</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Theme and interface preferences
                    </p>

                    <div className="mt-4 space-y-3">
                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm">Accent color</p>
                                    <p className="text-xs text-muted-foreground">
                                        #CCFF00 - Sentinel Lime
                                    </p>
                                </div>
                            </div>
                            <span className="w-6 h-6 rounded-md bg-lime border border-lime/60" />
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm">Sidebar default</p>
                                <p className="text-xs text-muted-foreground">
                                    Startup navigation state
                                </p>
                            </div>
                            <div className="inline-flex p-1 rounded-full bg-black/25 border border-white/10">
                                <button
                                    type="button"
                                    className={cn(
                                        "h-7 px-3 text-xs rounded-full transition-smooth",
                                        !collapsed
                                            ? "bg-lime text-lime-foreground"
                                            : "text-muted-foreground",
                                    )}
                                    onClick={() => setCollapsed(false)}
                                >
                                    Expanded
                                </button>
                                <button
                                    type="button"
                                    className={cn(
                                        "h-7 px-3 text-xs rounded-full transition-smooth",
                                        collapsed
                                            ? "bg-card text-foreground"
                                            : "text-muted-foreground",
                                    )}
                                    onClick={() => setCollapsed(true)}
                                >
                                    Collapsed
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            </section>
        </div>
    );
}
