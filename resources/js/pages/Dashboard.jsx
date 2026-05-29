import React from "react";
import { Bell, Fan, ShieldCheck, Zap, Flame, Wind, Thermometer } from "lucide-react";
import StatCard from "../components/StatCard";
import ActiveSensors from "../components/ActiveSensors";
import ActuatorControl from "../components/ActuatorControl";
import RoomModel from "../components/RoomModel";
import ActivityLog from "../components/ActivityLog";
import SensorReadings from "../components/SensorReadings";
import ThresholdSettings from "../components/ThresholdSettings";
import { QuickActions, StatusCard } from "../components/StatusAndActions";
import MagicBentoGrid from "../components/MagicBentoGrid";

function rt(d) { if (!d) return "Updated just now"; const s = Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 1000)); if (s < 60) return `Updated ${s}s ago`; if (s < 3600) return `Updated ${Math.floor(s / 60)}m ago`; return `Updated ${Math.floor(s / 3600)}h ago`; }

export default function Dashboard({ activeRoom, deviceId, iot }) {
    const latest = iot.latestReading, feed = iot.data?.sensor_data || [], logs = iot.data?.activity_logs || [], workerOnline = Boolean(iot.data?.worker_online), latestCmd = iot.data?.latest_command, emergency = iot.data?.emergency_status || "AMAN";

    const stats = [
        { title: "System Status", value: emergency, sub: workerOnline ? "Worker online" : "Worker offline", icon: ShieldCheck, badge: emergency === "BAHAYA" ? "Alert" : "Secure" },
        { title: "Active Sensors", value: "3 / 3", sub: "Gas, smoke, flame live", icon: Zap },
        { title: "Events Today", value: `${logs.length}`, sub: "Latest activity", icon: Bell },
        { title: "Fan Speed", value: latestCmd?.target_device === "exhaust_fan" && latestCmd?.action === "START" ? "ON" : "OFF", sub: "Worker command", icon: Fan },
    ];
    const sensors = [
        { name: "MQ-2", type: "Gas / Smoke", value: `${Math.round(Number(latest?.gas_value || 0))} ppm`, status: emergency === "BAHAYA" ? "Alert" : "Normal", icon: Wind },
        { name: "KY-026", type: "Flame detector", value: `${Math.round(Number(latest?.flame_value || 0))}`, status: Number(latest?.flame_value || 9999) < 500 ? "Alert" : "Normal", icon: Flame },
        { name: "DHT22", type: "Temperature", value: `${Math.round(Number(latest?.temperature || 0))}°C`, status: Number(latest?.temperature || 0) > 40 ? "Alert" : "Normal", icon: Thermometer },
    ];
    const actuators = [
        { name: "Exhaust Fan", subtitle: latestCmd?.target_device === "exhaust_fan" ? `${latestCmd.action} (${latestCmd.status})` : "No recent command", value: latestCmd?.target_device === "exhaust_fan" && latestCmd.action === "START" ? "ON" : "", enabled: latestCmd?.target_device === "exhaust_fan" && latestCmd.action === "START", icon: Fan },
        { name: "Buzzer", subtitle: latestCmd?.target_device === "buzzer" ? `${latestCmd.action} (${latestCmd.status})` : emergency === "BAHAYA" ? "Triggered" : "Silent", value: "", enabled: latestCmd?.target_device === "buzzer" && latestCmd.action === "START", icon: Bell },
    ];
    const dashboardEntries = logs.slice(0, 6).map((l, i) => ({ id: `${l.id || i}`, icon: (l.message || "").toLowerCase().includes("flame") ? "flame" : (l.message || "").toLowerCase().includes("temp") ? "temp" : "alert", text: l.message || l.description || "System activity", time: rt(l.created_at), status: l.status === "BAHAYA" ? "TRIGGERED" : "INFO" }));
    const actuatorState = { exhaust_fan: latestCmd?.target_device === "exhaust_fan" ? latestCmd.action : "STOP", buzzer: latestCmd?.target_device === "buzzer" ? latestCmd.action : "STOP" };

    const sendActuator = async (p) => { try { await fetch("/api/actuator", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify({ ...p, device_id: deviceId }) }); } catch {} };
    const saveThresholds = async (p) => { try { await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify(p) }); } catch {} };

    return (
        <div className="py-5 space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Hello Admin</h1>
                <p className="text-sm text-muted-foreground">Monitoring {activeRoom} in real-time.</p>
                {iot.error && <p className="text-xs text-danger mt-1">API disconnected: {iot.error}</p>}
            </div>

            <MagicBentoGrid enableSpotlight enableBorderGlow enableTilt enableMagnetism clickEffect glowColor="124, 58, 237" spotlightRadius={300} className="grid gap-4 grid-cols-2 xl:grid-cols-4">
                {stats.map(s => <StatCard key={s.title} {...s} />)}
            </MagicBentoGrid>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                    <RoomModel room={activeRoom} />
                    <div className="grid gap-4 md:grid-cols-5">
                        <div className="md:col-span-2"><StatusCard status={emergency} systemActive={workerOnline} deviceLabel={`Device-${deviceId}`} updatedLabel={rt(latest?.created_at)} /></div>
                        <div className="md:col-span-3"><QuickActions actuatorState={actuatorState} onAction={sendActuator} /></div>
                    </div>
                    <SensorReadings readings={feed} />
                    <ThresholdSettings settings={iot.data?.settings} onSave={saveThresholds} />
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
