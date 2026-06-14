import React from "react";
import { Activity, Database, LayoutGrid, LogOut, Plus, Settings, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../lib/utils";
import GooeyNav from "./GooeyNav";

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "sensors", label: "Sensor Data", icon: Database },
    { id: "logs", label: "Activity Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed, currentPage, setCurrentPage }) {
    const activeIndex = navItems.findIndex(i => i.id === currentPage);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/logout", { method: "POST" });
            const data = await res.json();
            if (data.status === "success") window.location.href = "/login";
        } catch (e) { console.error("Logout error:", e); }
    };

    return (
        <aside className={cn("sidebar-glass hidden lg:flex flex-col transition-all duration-200", collapsed ? "w-[72px]" : "w-[280px]")}>
            {/* Logo */}
            <div className={cn("flex items-center gap-3 px-5 py-5 border-b border-[#212327]", collapsed && "justify-center px-0")}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-normal shrink-0 relative" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '1px', background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)', color: '#0a0a0a' }}>SI</div>
                {!collapsed && <div><p className="text-sm leading-tight text-white font-normal">SentinelIoT</p><p className="text-[11px] text-[#7d8187]">Smart Safety</p></div>}
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-4 min-h-0 overflow-hidden">
                {collapsed ? (
                    <div className="flex flex-col gap-1">
                        {navItems.map(({ id, icon: Icon, label }) => {
                            const isActive = currentPage === id;
                            return (
                                <button key={id} onClick={() => setCurrentPage(id)} title={label}
                                    className={cn(
                                        "flex items-center justify-center w-full h-10 rounded-lg transition-all duration-150",
                                        isActive
                                            ? "bg-[#1a1c20] text-white border border-[#212327]"
                                            : "text-[#7d8187] hover:bg-[#1a1c20] hover:text-white border border-transparent"
                                    )}>
                                    <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {navItems.map(({ id, label, icon: Icon }) => {
                            const isActive = currentPage === id;
                            return (
                                <button key={id} onClick={() => setCurrentPage(id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 h-10 rounded-lg text-sm font-normal transition-all duration-150 px-3 border",
                                        isActive
                                            ? "bg-[#1a1c20] text-white border-[#212327]"
                                            : "text-[#7d8187] hover:bg-[#1a1c20] hover:text-white border-transparent"
                                    )}>
                                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom actions */}
            <div className="px-3 pb-4 space-y-1 border-t border-[#212327] pt-3">
                {!collapsed ? (
                    <button onClick={() => setCurrentPage("new-device")}
                        className="w-full flex items-center justify-center gap-2 h-10 rounded-[9999px] bg-white text-[#0a0a0a] font-normal text-sm transition-all duration-150 hover:bg-[#fafaf7]">
                        <Plus className="w-4 h-4" /> New Device
                    </button>
                ) : (
                    <button onClick={() => setCurrentPage("new-device")} title="New Device"
                        className="w-full flex items-center justify-center h-10 rounded-[9999px] bg-white text-[#0a0a0a] transition-all duration-150 hover:bg-[#fafaf7]">
                        <Plus className="w-4 h-4" />
                    </button>
                )}
                <button onClick={handleLogout}
                    className={cn("w-full flex items-center gap-3 h-10 rounded-lg text-sm font-normal transition-all duration-150 hover:bg-[#1a1c20] text-[#7d8187]", collapsed ? "justify-center" : "px-3")}>
                    <LogOut className="w-[18px] h-[18px] shrink-0" />{!collapsed && <span>Sign Out</span>}
                </button>
                <button onClick={() => setCollapsed(!collapsed)}
                    className={cn("w-full flex items-center gap-3 h-10 rounded-lg text-sm transition-all duration-150 hover:bg-[#1a1c20] text-[#7d8187]", collapsed ? "justify-center" : "px-3")}>
                    {collapsed ? <ChevronsRight className="w-[18px] h-[18px]" /> : <ChevronsLeft className="w-[18px] h-[18px]" />}{!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
