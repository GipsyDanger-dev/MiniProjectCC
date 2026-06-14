import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { useRealtimeIoT } from "./hooks/useRealtimeIoT";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import RoomSelectionBanner from "./components/RoomSelectionBanner";
import Dashboard from "./pages/Dashboard";
import SensorData from "./pages/SensorData";
import ActivityLogs from "./pages/ActivityLogs";
import DeviceStatus from "./pages/DeviceStatus";
import Settings from "./pages/Settings";
import PlaceholderPage from "./pages/PlaceholderPage";
import NewDevice from "./pages/NewDevice";

export default function MainApp() {
    const { theme, toggleTheme } = useTheme();
    const [collapsed, setCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [devices, setDevices] = useState([]);
    const [devicesLoading, setDevicesLoading] = useState(true);
    const [activeDeviceId, setActiveDeviceId] = useState(1);

    const rooms = useMemo(() => devices.map((d) => ({ id: d.id, label: d.location || d.device_name })), [devices]);
    const activeDevice = useMemo(() => devices.find((d) => d.id === activeDeviceId) || null, [devices, activeDeviceId]);
    const activeRoom = activeDevice?.location || activeDevice?.device_name || "Unknown";
    const iot = useRealtimeIoT(activeDeviceId, 3000);

    const loadDevices = useCallback(async () => {
        setDevicesLoading(true);
        try {
            const res = await fetch("/api/devices", { headers: { Accept: "application/json" } });
            const payload = await res.json();
            if (payload.status === "success") {
                setDevices(payload.data || payload.devices || []);
            } else {
                setDevices([]);
            }
        } catch { setDevices([]); } finally { setDevicesLoading(false); }
    }, []);

    useEffect(() => { loadDevices(); }, [loadDevices]);

    useEffect(() => {
        if (!devices.length) return;
        if (!devices.some((d) => d.id === activeDeviceId)) setActiveDeviceId(devices[0].id);
    }, [devices, activeDeviceId]);

    const pages = {
        dashboard: <Dashboard activeRoom={activeRoom} deviceId={activeDeviceId} iot={iot} />,
        sensors: <SensorData activeRoom={activeRoom} iot={iot} />,
        devices: <DeviceStatus activeRoom={activeRoom} iot={iot} />,
        logs: <ActivityLogs activeRoom={activeRoom} iot={iot} />,
        settings: <Settings iot={iot} />,
        "new-device": <NewDevice onCreated={(d) => { setDevices((p) => { const e = p.some((i) => i.id === d.id); return e ? p.map((i) => (i.id === d.id ? d : i)) : [...p, d]; }); setActiveDeviceId(d.id); setCurrentPage("dashboard"); }} onReload={loadDevices} />,
        profile: <PlaceholderPage title="Profile" subtitle="Manage your account." />,
    };
    const currentContent = pages[currentPage] || pages.dashboard;

    return (
        <div className="min-h-screen text-foreground">
            <div className="flex min-h-screen">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                <div className="flex-1 flex flex-col min-h-screen">
                    <Topbar />
                    <main className="flex-1 px-4 md:px-6 pb-8">
                        <div className="relative z-10 max-w-[1400px] mx-auto">
                            <RoomSelectionBanner rooms={rooms} activeRoomId={activeDeviceId} loading={devicesLoading} onChange={setActiveDeviceId} />
                            {currentContent}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
