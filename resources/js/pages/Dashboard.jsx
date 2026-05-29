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
    const diffSec = Math.max(
        0,
        Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000),
    );
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

    const stats = [
        {
            title: "System Status",
            value: emergency,
            sub: workerOnline ? "Worker online" : "Worker offline",
            icon: ShieldCheck,
            badge: emergency === "BAHAYA" ? "Alert" : "Secure",
            accent: "lime",
        },
        {
            title: "Active Sensors",
            value: "4 / 4",
            sub: "Gas, api, kelembapan, suhu live",
            icon: Zap,
            accent: "lime",
        },
        {
            title: "Events Today",
            value: `${logs.length}`,
            sub: "Latest activity entries",
            icon: Bell,
            accent: "accent",
        },
        {
            title: "Fan Speed",
            value:
                actuator?.fan_status && actuator.fan_status !== "OFF"
                    ? actuator.fan_status
                    : "OFF",
            sub: actuator?.fan_speed ? `${actuator.fan_speed}% speed` : "Idle",
            icon: Fan,
            accent: "lime",
        },
    ];

    const sensors = [
        {
            name: "Gas",
            type: "MQ-2 Gas Sensor",
            value: `${Math.round(Number(latest?.gas_value || 0))} ppm`,
            status: Number(latest?.gas_value || 0) > 250 ? "Alert" : "Normal",
            icon: Wind,
        },
        {
            name: "Api",
            type: "KY-026 Flame Sensor",
            value: `${Math.round(Number(latest?.flame_value || 0))}`,
            status:
                Number(latest?.flame_value || 9999) < 500 ? "Alert" : "Normal",
            icon: Flame,
        },
        {
            name: "Kelembapan",
            type: "DHT22 Humidity",
            value: `${Math.round(Number(latest?.humidity || 0))}%`,
            status: Number(latest?.humidity || 0) > 70 ? "Alert" : "Normal",
            icon: Droplets,
        },
        {
            name: "Suhu",
            type: "DHT22 Temperature",
            value: `${Math.round(Number(latest?.temperature || 0))}°C`,
            status: Number(latest?.temperature || 0) > 40 ? "Alert" : "Normal",
            icon: Thermometer,
        },
    ];

    const fanOn = actuator?.fan_status && actuator.fan_status !== "OFF";
    const buzzerOn = actuator?.alarm_status === "ON";

    const actuators = [
        {
            name: "Exhaust Fan",
            subtitle: fanOn
                ? `${actuator.fan_status} (${actuator.fan_speed || 0}%)`
                : latestCommand?.target_device === "exhaust_fan"
                  ? `${latestCommand.action} (${latestCommand.status})`
                  : "Idle",
            value: fanOn ? actuator.fan_status : "",
            enabled: fanOn,
            icon: Fan,
        },
        {
            name: "Buzzer",
            subtitle: buzzerOn
                ? "ACTIVE"
                : emergency === "BAHAYA"
                  ? "Triggered by alert"
                  : "Silent",
            value: "",
            enabled: buzzerOn,
            icon: Bell,
        },
    ];

    const dashboardEntries = logs.slice(0, 6).map((log, index) => ({
        id: `${log.id || index}`,
        icon:
            (log.action_type || "").includes("SENSOR") ||
            (log.message || "").toLowerCase().includes("flame")
                ? "flame"
                : (log.message || "").toLowerCase().includes("temp")
                  ? "temp"
                  : "alert",
        text: log.message || log.description || "System activity",
        time: relativeTime(log.created_at),
        status: log.status === "BAHAYA" ? "TRIGGERED" : "INFO",
    }));

    const actuatorState = {
        exhaust_fan: fanOn ? actuator.fan_status : "OFF",
        buzzer: buzzerOn ? "START" : "STOP",
    };

    const [actuatorLoading, setActuatorLoading] = useState(null);
    const [actuatorFeedback, setActuatorFeedback] = useState(null);
    const [modeLoading, setModeLoading] = useState(false);

    const switchToAuto = async () => {
        setModeLoading(true);
        try {
            const res = await fetch("/api/mode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: JSON.stringify({ mode: "auto" }),
            });
            const data = await res.json();
            if (data.status === "success") {
                setActuatorFeedback({ type: "success", msg: "Switched to AUTO mode" });
            }
        } catch (_e) {
            setActuatorFeedback({ type: "error", msg: "Failed to switch mode" });
        } finally {
            setModeLoading(false);
            setTimeout(() => setActuatorFeedback(null), 2000);
        }
    };

    const sendActuator = async (payload) => {
        if (payload?.navigate === "activity") {
            setCurrentPage?.("logs");
            return;
        }
        setActuatorLoading(payload.target_device);
        try {
            const res = await fetch("/api/actuator", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: JSON.stringify({ ...payload, device_id: deviceId }),
            });
            const data = await res.json();
            if (data.status === "success") {
                setActuatorFeedback({ type: "success", msg: `${payload.action} → ${payload.target_device}` });
            } else {
                setActuatorFeedback({ type: "error", msg: data.message || "Command failed" });
            }
        } catch (e) {
            setActuatorFeedback({ type: "error", msg: "Connection failed" });
        } finally {
            setTimeout(() => {
                setActuatorLoading(null);
                setActuatorFeedback(null);
            }, 2000);
        }
    };

    const saveThresholds = async (payload) => {
        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                console.error("Failed to save thresholds:", res.status);
            }
        } catch (e) {
            console.error("Failed to save thresholds:", e);
        }
    };

    return (
        <div className="py-5 space-y-5">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                        Hello Admin
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Monitoring {activeRoom} in real-time.
                    </p>
                    {iot.error ? (
                        <p className="text-xs text-danger mt-1">
                            API disconnected: {iot.error}
                        </p>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${
                        systemMode === "manual"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-success/15 text-success border-success/30"
                    }`}>
                        {systemMode === "manual" ? "MANUAL" : "AUTO"}
                    </span>
                    {systemMode === "manual" && (
                        <button
                            type="button"
                            onClick={switchToAuto}
                            disabled={modeLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-lime text-lime-foreground shadow-lime disabled:opacity-60"
                        >
                            {modeLoading ? "Switching..." : "Switch to Auto"}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                    <RoomModel room={activeRoom} iot={iot} />
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="md:col-span-2">
                            <StatusCard
                                status={emergency}
                                systemActive={workerOnline}
                                deviceLabel={`Device-${deviceId}`}
                                updatedLabel={relativeTime(latest?.created_at)}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <QuickActions
                                actuatorState={actuatorState}
                                onAction={sendActuator}
                                loading={actuatorLoading}
                            />
                            {actuatorFeedback && (
                                <div className={`mt-2 px-3 py-2 rounded-xl text-xs font-medium border ${
                                    actuatorFeedback.type === "success"
                                        ? "bg-success/15 text-success border-success/30"
                                        : "bg-danger/15 text-danger border-danger/30"
                                }`}>
                                    {actuatorFeedback.msg}
                                </div>
                            )}
                        </div>
                    </div>
                    <SensorReadings readings={feed} />
                    <ThresholdSettings
                        settings={iot.data?.settings}
                        onSave={saveThresholds}
                    />
                </div>
                <div className="space-y-5">
                    <ActiveSensors items={sensors} />
                    <ActuatorControl items={actuators} onToggle={(name) => {
                        const target = name === "Exhaust Fan" ? "exhaust_fan" : "buzzer";
                        const isOn = actuators.find(a => a.name === name)?.enabled;
                        sendActuator({ target_device: target, action: isOn ? "STOP" : "START" });
                    }} />
                    <ActivityLog entries={dashboardEntries} />
                </div>
            </div>
        </div>
    );
}
