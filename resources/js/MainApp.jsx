import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Database, Activity, Settings } from "lucide-react";
import { useTheme } from "./hooks/useTheme";
import { useRealtimeIoT } from "./hooks/useRealtimeIoT";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import RoomSelectionBanner from "./components/RoomSelectionBanner";
import Dashboard from "./pages/Dashboard";
import SensorData from "./pages/SensorData";
import ActivityLogs from "./pages/ActivityLogs";
import DeviceStatus from "./pages/DeviceStatus";
import SettingsPage from "./pages/Settings";
import PlaceholderPage from "./pages/PlaceholderPage";
import NewDevice from "./pages/NewDevice";

const pageVariants = {
    initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
    exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.2 } },
};

const mobileNavItems = [
    { id: "dashboard", label: "Home", icon: LayoutGrid },
    { id: "sensors", label: "Sensors", icon: Database },
    { id: "logs", label: "Logs", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
];

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
        settings: <SettingsPage iot={iot} />,
        "new-device": <NewDevice onCreated={(d) => { setDevices((p) => { const e = p.some((i) => i.id === d.id); return e ? p.map((i) => (i.id === d.id ? d : i)) : [...p, d]; }); setActiveDeviceId(d.id); setCurrentPage("dashboard"); }} onReload={loadDevices} />,
        profile: <PlaceholderPage title="Profile" subtitle="Manage your account." />,
    };

    return (
        <div className="min-h-screen relative" style={{color:'#ffffff'}}>
            {/* Ambient indigo glow background */}
            <div className="ambient-grid" />

            <div className="flex min-h-screen relative z-10">
                {/* Desktop sidebar */}
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentPage={currentPage} setCurrentPage={setCurrentPage} />

                <div className="flex-1 flex flex-col min-h-screen">
                    <Topbar />
                    <main className="flex-1 px-3 sm:px-4 md:px-6 pb-20 lg:pb-8">
                        <div className="relative z-10 max-w-[1400px] mx-auto">
                            <RoomSelectionBanner rooms={rooms} activeRoomId={activeDeviceId} loading={devicesLoading} onChange={setActiveDeviceId} />
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentPage}
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {pages[currentPage] || pages.dashboard}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile bottom navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-[#212327]">
                <div className="flex items-center justify-around px-2 py-1.5">
                    {mobileNavItems.map(({ id, label, icon: Icon }) => {
                        const isActive = currentPage === id;
                        return (
                            <button key={id} onClick={() => setCurrentPage(id)}
                                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                                    isActive ? "text-white" : "text-[#7d8187]"
                                }`}>
                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                                <span className="text-[9px] font-normal" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{label}</span>
                                {isActive && <span className="w-1 h-1 rounded-full bg-[#c4b5fd] mt-0.5" />}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
