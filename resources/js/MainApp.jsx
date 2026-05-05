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
    const rooms = useMemo(
        () =>
            devices.map((device) => ({
                id: device.id,
                label: device.location || device.device_name,
            })),
        [devices],
    );
    const activeDevice = useMemo(
        () => devices.find((device) => device.id === activeDeviceId) || null,
        [devices, activeDeviceId],
    );
    const activeRoom =
        activeDevice?.location || activeDevice?.device_name || "Unknown";
    const iot = useRealtimeIoT(activeDeviceId, 3000);

    const loadDevices = useCallback(async () => {
        setDevicesLoading(true);
        try {
            const res = await fetch("/api/devices", {
                headers: { Accept: "application/json" },
            });
            const payload = await res.json();
            if (payload.status === "success") {
                setDevices(payload.devices || []);
            } else {
                setDevices([]);
            }
        } catch (_error) {
            setDevices([]);
        } finally {
            setDevicesLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDevices();
    }, [loadDevices]);

    useEffect(() => {
        if (!devices.length) return;
        const hasActive = devices.some((device) => device.id === activeDeviceId);
        if (!hasActive) {
            setActiveDeviceId(devices[0].id);
        }
    }, [devices, activeDeviceId]);

    const pages = {
        dashboard: (
            <Dashboard
                activeRoom={activeRoom}
                deviceId={activeDeviceId}
                iot={iot}
            />
        ),
        sensors: (
            <SensorData
                activeRoom={activeRoom}
                deviceId={activeDeviceId}
                iot={iot}
            />
        ),
        devices: (
            <DeviceStatus
                activeRoom={activeRoom}
                deviceId={activeDeviceId}
                iot={iot}
            />
        ),
        logs: (
            <ActivityLogs
                activeRoom={activeRoom}
                deviceId={activeDeviceId}
                iot={iot}
            />
        ),
        settings: (
            <Settings
                theme={theme}
                toggleTheme={toggleTheme}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                iot={iot}
            />
        ),
        "new-device": (
            <NewDevice
                onCreated={(device) => {
                    setDevices((prev) => {
                        const exists = prev.some((item) => item.id === device.id);
                        if (exists) {
                            return prev.map((item) =>
                                item.id === device.id ? device : item,
                            );
                        }
                        return [...prev, device];
                    });
                    setActiveDeviceId(device.id);
                    setCurrentPage("dashboard");
                }}
                onReload={loadDevices}
            />
        ),
        profile: (
            <PlaceholderPage
                title="Profile"
                subtitle="Manage your account details."
            />
        ),
    };
    const currentContent = pages[currentPage] || pages.dashboard;

    return (
        <div className="min-h-screen bg-transparent text-foreground">
            <div className="flex min-h-screen">
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    theme={theme}
                    toggleTheme={toggleTheme}
                />
                <div className="flex-1 flex flex-col min-h-screen">
                    <Topbar />
                    <main className="flex-1 px-8 pb-10">
                        <div className="relative z-10">
                            <RoomSelectionBanner
                                rooms={rooms}
                                activeRoomId={activeDeviceId}
                                loading={devicesLoading}
                                onChange={setActiveDeviceId}
                            />
                            {currentContent}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
