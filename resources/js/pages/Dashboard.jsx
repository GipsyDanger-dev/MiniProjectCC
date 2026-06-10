import React, { useState } from "react";
import {
    Bell,
    Fan,
    ShieldCheck,
    Zap,
    Flame,
    Wind,
    Thermometer,
    Droplets,
} from "lucide-react";
import StatCard from "../components/StatCard";
import ActiveSensors from "../components/ActiveSensors";
import ActuatorControl from "../components/ActuatorControl";
import RoomModel from "../components/RoomModel";
import ActivityLog from "../components/ActivityLog";
import SensorReadings from "../components/SensorReadings";
import ThresholdSettings from "../components/ThresholdSettings";
import { QuickActions, StatusCard } from "../components/StatusAndActions";

function relativeTime(dateValue) {
    if (!dateValue) return "Updated just now";
    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000));
    if (diffSec < 60) return `Updated ${diffSec}s ago`;
    if (diffSec < 3600) return `Updated ${Math.floor(diffSec / 60)}m ago`;
    return `Updated ${Math.floor(diffSec / 3600)}h ago`;
}

export default function Dashboard({ activeRoom, deviceId, iot, setCurrentPage }) {
    const latest = iot.latestReading;
    const feed = iot.data?.sensor_data || [];
    const logs = iot.data?.activity_logs || [];
    const workerOnline = Boolean(iot.data?.worker_online);
    const latestCommand = iot.data?.latest_command;
    const actuator = iot.data?.device_actuator;
    const emergency = iot.data?.emergency_status || "AMAN";
    const systemMode = iot.data?.system_mode || "auto";

    const fanOn = actuator?.fan_status && actuator.fan_status !== "OFF";
    const buzzerOn = actuator?.alarm_status === "ON";
    const fanSpeed = actuator?.fan_speed || 0;
    const fanLevel = fanSpeed > 70 ? "MAXIMUM" : fanSpeed > 40 ? "HIGH" : fanSpeed > 10 ? "MEDIUM" : "LOW";

    const stats = [
        {
            title: "System Status",
            value: emergency,
            badge: emergency === "BAHAYA" ? "KRITIS" : "OPERASIONAL",
            badgeVariant: emergency === "BAHAYA" ? "red" : "green",
        },
        {
            title: "Active Sensors",
            value: "4 / 4",
            badge: "ONLINE",
            badgeVariant: "green",
        },
        {
            title: "Events Today",
            value: `${logs.length}`,
            badge: logs.length > 0 ? `${logs.length} WARNING` : "ALL CLEAR",
            badgeVariant: logs.length > 0 ? "orange" : "muted",
        },
        {
            title: "Fan Output",
            value: fanOn ? `${fanSpeed}%` : "0%",
            badge: fanOn ? `${fanLevel} · RUNNING` : "IDLE",
            badgeVariant: fanOn ? "orange" : "muted",
        },
    ];

    const settings = iot.data?.settings || {};
    const gasTh = Number(settings.gas_threshold) || 2500;
    const flameTh = Number(settings.flame_threshold) || 500;
    const humidityTh = Number(settings.humidity_threshold) || 70;
    const tempTh = Number(settings.temperature_threshold) || 45;

    const sensors = [
        { name: "MQ-2 Gas", type: "GAS SENSOR", value: `${Math.round(Number(latest?.gas_value || 0))} PPM`, status: Number(latest?.gas_value || 0) > gasTh ? "Alert" : "Normal", icon: Wind },
        { name: "KY-026", type: "FLAME INTENSITY", value: `${Math.round(Number(latest?.flame_value || 0))} Analog`, status: latest?.flame_value !== undefined && Number(latest.flame_value) < flameTh ? "Alert" : "Normal", icon: Flame },
        { name: "DHT22-H", type: "HUMIDITY", value: `${Math.round(Number(latest?.humidity || 0))}%`, status: Number(latest?.humidity || 0) > humidityTh ? "Alert" : "Normal", icon: Droplets },
        { name: "DHT22-T", type: "TEMPERATURE", value: `${Math.round(Number(latest?.temperature || 0))}°C`, status: Number(latest?.temperature || 0) > tempTh ? "Alert" : "Normal", icon: Thermometer },
    ];

    const actuators = [
        { name: "Exhaust Fan", subtitle: fanOn ? `${actuator.fan_status} (${fanSpeed}%)` : "IDLE", value: fanOn ? actuator.fan_status : "", enabled: fanOn, icon: Fan },
        { name: "Buzzer", subtitle: buzzerOn ? "ACTIVE" : "SILENT", value: "", enabled: buzzerOn, icon: Bell },
    ];

    const dashboardEntries = logs.slice(0, 5);

    const actuatorState = {
        exhaust_fan: fanOn ? actuator.fan_status : "OFF",
        buzzer: buzzerOn ? "START" : "STOP",
    };

    const [actuatorLoading, setActuatorLoading] = useState(null);
    const [actuatorFeedback, setActuatorFeedback] = useState(null);
    const [modeLoading, setModeLoading] = useState(false);
    const emergencyActive = fanOn && buzzerOn && systemMode === "manual";

    const toggleMode = async () => {
        setModeLoading(true);
        const newMode = systemMode === "auto" ? "manual" : "auto";
        try {
            const res = await fetch("/api/mode", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" },
                body: JSON.stringify({ mode: newMode }),
            });
            const data = await res.json();
            if (data.status === "success") setActuatorFeedback({ type: "success", msg: `Switched to ${newMode.toUpperCase()} mode` });
        } catch (_e) {
            setActuatorFeedback({ type: "error", msg: "Failed to switch mode" });
        } finally {
            setModeLoading(false);
            setTimeout(() => setActuatorFeedback(null), 2000);
        }
    };

    const sendActuator = async (payload) => {
        if (payload?.navigate === "activity") { setCurrentPage?.("logs"); return; }
        if (payload?.emergency) {
            setActuatorLoading("emergency");
            try {
                const res = await fetch("/api/emergency", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" },
                    body: JSON.stringify({ device_id: deviceId }),
                });
                const data = await res.json();
                if (data.status === "success") setActuatorFeedback({ type: data.active ? "error" : "success", msg: data.active ? "EMERGENCY AKTIF — Semua aktuator MAX" : "Emergency dimatikan" });
                else setActuatorFeedback({ type: "error", msg: data.message || "Emergency failed" });
            } catch (e) {
                setActuatorFeedback({ type: "error", msg: "Connection failed" });
            } finally {
                setTimeout(() => { setActuatorLoading(null); setActuatorFeedback(null); }, 3000);
            }
            return;
        }
        setActuatorLoading(payload.target_device);
        try {
            const res = await fetch("/api/actuator", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" },
                body: JSON.stringify({ ...payload, device_id: deviceId }),
            });
            const data = await res.json();
            if (data.status === "success") setActuatorFeedback({ type: "success", msg: `${payload.action} → ${payload.target_device}` });
            else setActuatorFeedback({ type: "error", msg: data.message || "Command failed" });
        } catch (e) {
            setActuatorFeedback({ type: "error", msg: "Connection failed" });
        } finally {
            setTimeout(() => { setActuatorLoading(null); setActuatorFeedback(null); }, 2000);
        }
    };

    const saveThresholds = async (payload) => {
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) console.error("Failed to save thresholds:", res.status);
        } catch (e) {
            console.error("Failed to save thresholds:", e);
        }
    };

    return (
        <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
                <RoomModel room={activeRoom} iot={iot} />

                <div className="flex flex-col gap-2.5">
                    <SensorReadings readings={feed} />

                    <div className="bg-surface2 border border-edge">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-edge">
                            <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Kontrol Sistem</p>
                            <div
                                className={`w-9 h-[18px] border cursor-pointer relative transition-smooth ${systemMode === "auto" ? "bg-accent/10 border-accent" : "bg-surface3 border-edge2"}`}
                                onClick={toggleMode}
                            >
                                <span className={`absolute top-0.5 w-3 h-3 transition-all ${systemMode === "auto" ? "left-[18px] bg-accent" : "left-0.5 bg-edge2"}`} />
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="text-center py-3">
                                <p className="text-[10px] uppercase tracking-[0.10em] text-ink3 mb-1.5">Status Indikasi</p>
                                <p className={`text-2xl font-medium tracking-[0.02em] ${emergency === "BAHAYA" ? "text-danger animate-pulse" : "text-success"}`}>{emergency}</p>
                                <p className="text-[10px] text-ink3 mt-1.5 tracking-[0.04em]">
                                    ESP32-{deviceId} · {activeRoom} — Updated {relativeTime(latest?.created_at)}
                                </p>
                            </div>
                            {actuatorFeedback && (
                                <div className={`mb-2 px-2 py-1.5 text-[10px] border ${actuatorFeedback.type === "success" ? "bg-success/10 text-success border-success" : "bg-danger/10 text-danger border-danger"}`}>
                                    {actuatorFeedback.msg}
                                </div>
                            )}
                            <QuickActions actuatorState={actuatorState} onAction={sendActuator} loading={actuatorLoading} emergencyActive={emergencyActive} />
                        </div>
                    </div>
                </div>

                <ActiveSensors items={sensors} />

                <ActivityLog entries={dashboardEntries} onViewAll={() => setCurrentPage?.("logs")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                <ActuatorControl items={actuators} onToggle={(name) => {
                    const target = name === "Exhaust Fan" ? "exhaust_fan" : "buzzer";
                    const isOn = actuators.find(a => a.name === name)?.enabled;
                    sendActuator({ target_device: target, action: isOn ? "STOP" : "START" });
                }} />
                <ThresholdSettings settings={iot.data?.settings} onSave={saveThresholds} />
                <div className="bg-surface2 border border-edge">
                    <div className="px-3 py-2 border-b border-edge">
                        <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">Node Health</p>
                    </div>
                    <div className="px-3">
                        <div className="flex items-center justify-between py-2.5 border-b border-edge">
                            <span className="text-[10px] uppercase tracking-[0.08em] text-ink3">Worker Status</span>
                            <span className={`text-[15px] font-medium tabular-nums ${workerOnline ? "text-success" : "text-danger"}`}>
                                {workerOnline ? "ONLINE" : "OFFLINE"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2.5 border-b border-edge">
                            <span className="text-[10px] uppercase tracking-[0.08em] text-ink3">Last Command</span>
                            <span className="text-[10px] uppercase tracking-[0.06em] text-ink2">
                                {latestCommand ? `${latestCommand.target_device} · ${latestCommand.action}` : "—"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2.5 border-b border-edge">
                            <span className="text-[10px] uppercase tracking-[0.08em] text-ink3">Mode</span>
                            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.06em]">
                                <span className="w-1.5 h-1.5 bg-accent" /> {systemMode.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <span className="text-[10px] uppercase tracking-[0.08em] text-ink3">Device</span>
                            <span className="text-[10px] text-ink2">ESP32-{deviceId}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
