import React, { useState } from "react";
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

export default function MainApp() {
    const { theme, toggleTheme } = useTheme();
    const [collapsed, setCollapsed] = useState(false);
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [activeRoom, setActiveRoom] = useState("Warehouse");
    const rooms = ["Warehouse", "Ruang Server", "Ruang Genset", "Workshop"];
    const roomToDeviceId = {
        Warehouse: 1,
        "Ruang Server": 2,
        "Ruang Genset": 3,
        Workshop: 4,
    };
    const activeDeviceId = roomToDeviceId[activeRoom] || 1;
    const iot = useRealtimeIoT(activeDeviceId, 3000);

    const pages = {
        dashboard: (
            <Dashboard
                activeRoom={activeRoom}
                deviceId={activeDeviceId}
                iot={iot}
            />
        ),
        sensors: (
            <SensorData activeRoom={activeRoom} deviceId={activeDeviceId} iot={iot} />
        ),
        devices: (
            <DeviceStatus activeRoom={activeRoom} deviceId={activeDeviceId} iot={iot} />
        ),
        logs: (
            <ActivityLogs activeRoom={activeRoom} deviceId={activeDeviceId} iot={iot} />
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
        profile: (
            <PlaceholderPage
                title="Profile"
                subtitle="Manage your account details."
            />
        ),
    };
    const currentContent = pages[currentPage] || pages.dashboard;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <style>{`
                .main-gradient {
                    background: linear-gradient(
                        135deg,
                        rgba(72, 187, 120, 0.08) 0%,
                        rgba(99, 102, 241, 0.12) 50%,
                        rgba(139, 92, 246, 0.08) 100%
                    );
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                }
            `}</style>
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
                    <main className="flex-1 px-8 pb-10 relative">
                        <div className="main-gradient" />
                        <div className="relative z-10">
                            <RoomSelectionBanner
                                rooms={rooms}
                                activeRoom={activeRoom}
                                onChange={setActiveRoom}
                            />
                            {currentContent}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
