import React from "react";
import {
    Bell,
    Fan,
    ShieldCheck,
    Zap,
    Flame,
    Wind,
    Thermometer,
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

export default function Dashboard({ activeRoom, deviceId, iot }) {
    const latest = iot.latestReading;
    const feed = iot.data?.sensor_data || [];
    const logs = iot.data?.activity_logs || [];
    const workerOnline = Boolean(iot.data?.worker_online);
    const latestCommand = iot.data?.latest_command;
    const emergency = iot.data?.emergency_status || "AMAN";

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
            value: "3 / 3",
            sub: "Gas, smoke, flame live",
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
                latestCommand?.target_device === "exhaust_fan" &&
                latestCommand?.action === "START"
                    ? "ON"
                    : "OFF",
            sub: "Worker command result",
            icon: Fan,
            accent: "lime",
        },
    ];

    const sensors = [
        {
            name: "MQ-2",
            type: "Gas / Smoke sensor",
            value: `${Math.round(Number(latest?.gas_value || 0))} ppm`,
            status: emergency === "BAHAYA" ? "Alert" : "Normal",
            icon: Wind,
        },
        {
            name: "KY-026",
            type: "Flame detector",
            value: `${Math.round(Number(latest?.flame_value || 0))}`,
            status: Number(latest?.flame_value || 9999) < 500 ? "Alert" : "Normal",
            icon: Flame,
        },
        {
            name: "DHT22",
            type: "Temperature & Humidity",
            value: `${Math.round(Number(latest?.temperature || 0))}°C`,
            status: Number(latest?.temperature || 0) > 40 ? "Alert" : "Normal",
            icon: Thermometer,
        },
    ];

    const actuators = [
        {
            name: "Exhaust Fan",
            subtitle:
                latestCommand?.target_device === "exhaust_fan"
                    ? `${latestCommand.action} (${latestCommand.status})`
                    : "No recent command",
            value:
                latestCommand?.target_device === "exhaust_fan" &&
                latestCommand.action === "START"
                    ? "ON"
                    : "",
            enabled:
                latestCommand?.target_device === "exhaust_fan" &&
                latestCommand.action === "START",
            icon: Fan,
        },
        {
            name: "Buzzer",
            subtitle:
                latestCommand?.target_device === "buzzer"
                    ? `${latestCommand.action} (${latestCommand.status})`
                    : emergency === "BAHAYA"
                      ? "Triggered by alert"
                      : "Silent",
            value: "",
            enabled:
                latestCommand?.target_device === "buzzer" &&
                latestCommand.action === "START",
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
        exhaust_fan:
            latestCommand?.target_device === "exhaust_fan"
                ? latestCommand.action
                : "STOP",
        buzzer:
            latestCommand?.target_device === "buzzer" ? latestCommand.action : "STOP",
    };

    const sendActuator = async (payload) => {
        try {
            await fetch("/api/actuator", {
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
        } catch (_e) {
            // Keep UI resilient while simulator continues.
        }
    };

    const saveThresholds = async (payload) => {
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
                body: JSON.stringify(payload),
            });
        } catch (_e) {
            // No-op.
        }
    };

    return (
        <div className="py-5 space-y-5">
            <div>
                <h1 className="text-3xl font-semibold text-foreground">
                    Hello Steward
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                    <StatCard key={stat.title} {...stat} />
                ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                    <RoomModel room={activeRoom} />
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
                            />
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
                    <ActuatorControl items={actuators} />
                    <ActivityLog entries={dashboardEntries} />
                </div>
            </div>
        </div>
    );
}
