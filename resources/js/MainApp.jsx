import React, { useCallback, useEffect, useMemo, useState, Component } from "react";
import { useTheme } from "./hooks/useTheme";
import { useRealtimeIoT } from "./hooks/useRealtimeIoT";
import { cn } from "./lib/utils";
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
import LoginPage from "./pages/LoginPage";

class ErrorBoundary extends Component {
    state = { error: null };
    static getDerivedStateFromError(error) { return { error }; }
    render() {
        if (this.state.error) {
            return (
                <div style={{ background: "#0a0a0a", color: "#ef4444", padding: 32, minHeight: "100vh", fontFamily: "monospace" }}>
                    <h1 style={{ fontSize: 20, marginBottom: 16 }}>⚠️ React Error</h1>
                    <pre style={{ whiteSpace: "pre-wrap", color: "#fff", fontSize: 13, lineHeight: 1.6 }}>
                        {this.state.error.message}
                        {"\n\n"}
                        {this.state.error.componentStack}
                    </pre>
                    <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: "8px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function MainApp() {
    const { theme, toggleTheme } = useTheme();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState("dashboard");
    const [devices, setDevices] = useState([]);
    const [devicesLoading, setDevicesLoading] = useState(true);
    const [activeDeviceId, setActiveDeviceId] = useState(1);
    const [pollingInterval, setPollingInterval] = useState(3000);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const rooms = useMemo(
        () => devices.map((device) => ({ id: device.id, label: device.location || device.device_name })),
        [devices],
    );
    const activeDevice = useMemo(
        () => devices.find((device) => device.id === activeDeviceId) || null,
        [devices, activeDeviceId],
    );
    const activeRoom = activeDevice?.location || activeDevice?.device_name || "Unknown";
    const iot = useRealtimeIoT(activeDeviceId, pollingInterval);

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
        } catch (_error) {
            setDevices([]);
        } finally {
            setDevicesLoading(false);
        }
    }, []);

    useEffect(() => {
        fetch("/api/user", { credentials: "same-origin", headers: { Accept: "application/json" } })
            .then((res) => res.json())
            .then((data) => { if (data.status === "success") setUser(data.user); })
            .catch(() => {})
            .finally(() => setAuthLoading(false));
    }, []);

    useEffect(() => { if (user) loadDevices(); }, [loadDevices, user]);

    useEffect(() => {
        if (!devices.length) return;
        if (!devices.some((device) => device.id === activeDeviceId)) setActiveDeviceId(devices[0].id);
    }, [devices, activeDeviceId]);

    const handleLogout = async () => {
        await fetch("/api/logout", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
            },
        });
        setUser(null);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
                {/* Ambient indigo glow */}
                <div className="ambient-grid" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[rgba(124,58,237,0.3)] border-t-[#c4b5fd] rounded-full animate-spin" />
                    <span className="text-xs text-[#7d8187]" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: "1px" }}>LOADING</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage onLogin={setUser} />;
    }

    const pages = {
        dashboard: <Dashboard activeRoom={activeRoom} deviceId={activeDeviceId} iot={iot} setCurrentPage={setCurrentPage} />,
        sensors: <SensorData activeRoom={activeRoom} iot={iot} />,
        devices: <DeviceStatus activeRoom={activeRoom} iot={iot} />,
        logs: <ActivityLogs activeRoom={activeRoom} iot={iot} />,
        settings: <Settings iot={iot} pollingInterval={pollingInterval} setPollingInterval={setPollingInterval} />,
        "new-device": (
            <NewDevice
                onCreated={(device) => {
                    setDevices((prev) => {
                        const exists = prev.some((item) => item.id === device.id);
                        if (exists) return prev.map((item) => (item.id === device.id ? device : item));
                        return [...prev, device];
                    });
                    setActiveDeviceId(device.id);
                    setCurrentPage("dashboard");
                }}
                onReload={loadDevices}
            />
        ),
    };
    const currentContent = pages[currentPage] || pages.dashboard;

    return (
        <ErrorBoundary>
        <div className="min-h-screen relative" style={{ color: "#ffffff" }}>
            {/* Ambient indigo glow background */}
            <div className="ambient-grid" />

            <div className="flex min-h-screen relative z-10">
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    mobileOpen={mobileOpen}
                    setMobileOpen={setMobileOpen}
                />
                <div className={cn(
                    "flex-1 flex flex-col min-h-screen transition-all duration-200",
                    collapsed ? "lg:ml-[56px]" : "lg:ml-[176px]"
                )}>
                    <Topbar
                        mobileOpen={mobileOpen}
                        setMobileOpen={setMobileOpen}
                        systemMode={iot.data?.system_mode || "auto"}
                        user={user}
                        onLogout={handleLogout}
                    />
                    <main className="flex-1 px-3 pb-4 md:px-5 md:pb-6">
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
        </ErrorBoundary>
    );
}
