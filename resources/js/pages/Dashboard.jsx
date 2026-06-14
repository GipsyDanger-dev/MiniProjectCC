import React from "react";
import { Bell, Fan, ShieldCheck, Zap, Flame, Wind, Thermometer, AlertTriangle, Activity } from "lucide-react";
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
    const isDanger = emergency === "BAHAYA";
    const dangerCount = logs.filter(l => l.status === "BAHAYA").length;

    const stats = [
        { title: "System Status", value: emergency, sub: workerOnline ? "Worker online" : "Worker offline", icon: isDanger ? AlertTriangle : ShieldCheck, badge: isDanger ? "Alert" : "Secure", danger: isDanger },
        { title: "Active Sensors", value: "3 / 3", sub: "All sensors online", icon: Zap },
        { title: "Events Today", value: `${logs.length}`, sub: `${dangerCount} danger events`, icon: Bell },
        { title: "Fan Speed", value: latestCmd?.target_device === "exhaust_fan" && latestCmd?.action === "START" ? "ON" : "OFF", sub: "Exhaust Fan Status", icon: Fan },
    ];
    const sensors = [
        { name: "MQ-2 Gas Sensor", type: "Gas / Smoke", value: `${Math.round(Number(latest?.gas_value || 0))} ppm`, status: emergency === "BAHAYA" ? "Alert" : "Normal", icon: Wind },
        { name: "KY-026 Flame Sensor", type: "Flame detector", value: `${Math.round(Number(latest?.flame_value || 0))}`, status: Number(latest?.flame_value || 9999) < 500 ? "Alert" : "Normal", icon: Flame },
        { name: "DHT22 Temp & Humidity", type: "Temperature", value: `${Math.round(Number(latest?.temperature || 0))}°C`, status: Number(latest?.temperature || 0) > 40 ? "Alert" : "Normal", icon: Thermometer },
    ];
    const actuators = [
        { name: "Exhaust Fan", subtitle: latestCmd?.target_device === "exhaust_fan" ? `${latestCmd.action} (${latestCmd.status})` : "No recent command", value: latestCmd?.target_device === "exhaust_fan" && latestCmd.action === "START" ? "ON" : "", enabled: latestCmd?.target_device === "exhaust_fan" && latestCmd.action === "START", icon: Fan },
        { name: "Buzzer", subtitle: latestCmd?.target_device === "buzzer" ? `${latestCmd.action} (${latestCmd.status})` : emergency === "BAHAYA" ? "Triggered" : "Silent", value: "", enabled: latestCmd?.target_device === "buzzer" && latestCmd.action === "START", icon: Bell },
    ];
    const dashboardEntries = logs.slice(0, 6).map((l, i) => ({ id: `${l.id || i}`, icon: (l.message || "").toLowerCase().includes("flame") ? "flame" : (l.message || "").toLowerCase().includes("temp") ? "temp" : "alert", message: l.message || l.description || "System activity", description: l.description, time: rt(l.created_at), status: l.status === "BAHAYA" ? "TRIGGERED" : "INFO" }));
    const actuatorState = { exhaust_fan: latestCmd?.target_device === "exhaust_fan" ? latestCmd.action : "STOP", buzzer: latestCmd?.target_device === "buzzer" ? latestCmd.action : "STOP" };

    const sendActuator = async (p) => { try { await fetch("/api/actuator", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify({ ...p, device_id: deviceId }) }); } catch {} };
    const saveThresholds = async (p) => { try { await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "" }, body: JSON.stringify(p) }); } catch {} };

    return (
        <div className="py-3 sm:py-5 space-y-3 sm:space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-normal text-white tracking-tight">Halo, Admin</h1>
                    <p className="text-xs sm:text-sm text-[#7d8187] truncate">Monitoring {activeRoom} secara real-time</p>
                    {iot.error && <p className="text-xs text-[#ef4444] mt-1">API disconnected: {iot.error}</p>}
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-[9999px] border border-[#212327] bg-[#0a0a0a]">
                        <span className="live-dot" />
                        <span className="text-[11px] font-normal uppercase tracking-[1.2px] text-[#22c55e]" style={{ fontFamily: "'Geist Mono', monospace" }}>Live</span>
                    </div>
                    <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-[9999px] border border-[#212327] bg-[#1a1c20]">
                        <Activity className="w-3 h-3 text-[#c4b5fd]" strokeWidth={1.5} />
                        <span className="text-[11px] font-normal text-[#c4b5fd]" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{logs.length} events</span>
                    </div>
                </div>
            </div>

            <MagicBentoGrid enableSpotlight enableBorderGlow enableTilt enableMagnetism clickEffect glowColor="255, 255, 255" spotlightRadius={350} className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
                {stats.map(s => <StatCard key={s.title} {...s} />)}
            </MagicBentoGrid>

            <RoomModel room={activeRoom} iot={iot} />

            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-[1fr_1.5fr]">
                <StatusCard status={emergency} systemActive={workerOnline} deviceLabel={`Device-${deviceId}`} updatedLabel={rt(latest?.created_at)} />
                <QuickActions actuatorState={actuatorState} onAction={sendActuator} />
            </div>

            <SensorReadings readings={feed} />

            <div className="grid gap-3 sm:gap-4 grid-cols-1 xl:grid-cols-[1fr_340px]">
                <div className="space-y-3 sm:space-y-4">
                    <ThresholdSettings settings={iot.data?.settings} onSave={saveThresholds} />
                </div>
                <div className="space-y-3 sm:space-y-4">
                    <ActiveSensors items={sensors} />
                    <ActuatorControl items={actuators} />
                    <ActivityLog entries={dashboardEntries} />
                </div>
            </div>
        </div>
    );
}
