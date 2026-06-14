import React from "react";
import { Activity, Cpu, Database, LayoutGrid, LogOut, Plus, Settings, X, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutGrid },
    { id: "sensors", label: "Sensor Feed", icon: Database },
    { id: "devices", label: "Devices", icon: Cpu },
    { id: "logs", label: "Event Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
];

function SidebarContent({ collapsed, setCollapsed, currentPage, setCurrentPage, onNavigate }) {
    const handleLogout = async () => {
        try {
            const r = await fetch("/api/logout", { method: "POST" });
            const d = await r.json();
            if (d.status === "success") window.location.href = "/login";
        } catch (e) { console.error("Logout error:", e); }
    };

    const handleClick = (id) => { setCurrentPage(id); onNavigate?.(); };

    return (
        <>
            <div className={cn("flex items-center gap-3 py-5 border-b border-[rgba(33,35,39,0.8)]", collapsed ? "justify-center px-2" : "px-4")}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)', color: '#0a0a0a' }}>
                    <span className="text-[11px] font-normal" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '1px' }}>SI</span>
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-xs font-normal text-white truncate">SentinelIoT</p>
                        <p className="text-[10px] text-[#7d8187]">Smart Safety</p>
                    </div>
                )}
            </div>

            <div className="flex-1 py-4 overflow-y-auto thin-scroll">
                <p className={cn("text-[10px] uppercase tracking-[1.2px] text-[#7d8187] pb-2", collapsed ? "text-center px-2" : "px-4")} style={{ fontFamily: "'Geist Mono', monospace" }}>Main</p>
                <nav className="flex flex-col gap-0.5 px-2">
                    {navItems.slice(0, 4).map(({ id, label, icon: Icon }) => {
                        const isActive = currentPage === id;
                        return (
                            <button key={id} onClick={() => handleClick(id)} title={collapsed ? label : undefined}
                                className={cn(
                                    "group flex items-center gap-3 h-9 text-[13px] transition-all duration-150 rounded-lg",
                                    collapsed ? "justify-center px-0" : "px-3",
                                    isActive ? "text-white bg-[rgba(26,28,32,0.8)] border border-[rgba(33,35,39,0.8)]" : "text-[#7d8187] hover:text-white hover:bg-[rgba(26,28,32,0.5)] border border-transparent"
                                )}>
                                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                                {!collapsed && <span className="truncate">{label}</span>}
                            </button>
                        );
                    })}
                </nav>

                <p className={cn("text-[10px] uppercase tracking-[1.2px] text-[#7d8187] pt-4 pb-2", collapsed ? "text-center px-2" : "px-4")} style={{ fontFamily: "'Geist Mono', monospace" }}>Config</p>
                <nav className="flex flex-col gap-0.5 px-2">
                    {navItems.slice(4).map(({ id, label, icon: Icon }) => {
                        const isActive = currentPage === id;
                        return (
                            <button key={id} onClick={() => handleClick(id)} title={collapsed ? label : undefined}
                                className={cn(
                                    "group flex items-center gap-3 h-9 text-[13px] transition-all duration-150 rounded-lg",
                                    collapsed ? "justify-center px-0" : "px-3",
                                    isActive ? "text-white bg-[rgba(26,28,32,0.8)] border border-[rgba(33,35,39,0.8)]" : "text-[#7d8187] hover:text-white hover:bg-[rgba(26,28,32,0.5)] border border-transparent"
                                )}>
                                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                                {!collapsed && <span className="truncate">{label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="px-2 pb-4 space-y-1 border-t border-[rgba(33,35,39,0.8)] pt-3">
                {!collapsed ? (
                    <button onClick={() => handleClick("new-device")}
                        className="w-full h-9 rounded-[9999px] bg-white text-[#0a0a0a] font-normal text-xs transition-all duration-150 hover:bg-[#fafaf7] flex items-center justify-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" strokeWidth={1.5} /> Add Device
                    </button>
                ) : (
                    <button onClick={() => handleClick("new-device")} title="Add Device"
                        className="w-full h-9 rounded-[9999px] bg-white text-[#0a0a0a] transition-all duration-150 hover:bg-[#fafaf7] flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                )}
                <button onClick={handleLogout}
                    className={cn("w-full flex items-center gap-3 h-9 text-[11px] transition-all duration-150 text-[#7d8187] hover:text-white rounded-lg", collapsed ? "justify-center" : "px-3 justify-center")}>
                    <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />{!collapsed && <span>Sign Out</span>}
                </button>
                <button onClick={() => setCollapsed(!collapsed)}
                    className={cn("w-full flex items-center gap-3 h-9 text-[11px] transition-all duration-150 text-[#7d8187] hover:text-white rounded-lg", collapsed ? "justify-center" : "px-3 justify-center")}>
                    {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}{!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </>
    );
}

export default function Sidebar({ collapsed, setCollapsed, currentPage, setCurrentPage, theme, toggleTheme, mobileOpen, setMobileOpen }) {
    return (
        <>
            <aside className={cn(
                "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-[rgba(33,35,39,0.8)] transition-all duration-200 overflow-hidden",
                collapsed ? "w-[60px]" : "w-[200px]"
            )} style={{ background: "rgba(10,10,10,0.9)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-[200px] flex flex-col border-r border-[rgba(33,35,39,0.8)] transition-transform duration-200 ease-out lg:hidden overflow-y-auto thin-scroll",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )} style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-white z-10">
                    <X className="w-4 h-4" />
                </button>
                <SidebarContent collapsed={false} setCollapsed={setCollapsed} currentPage={currentPage} setCurrentPage={setCurrentPage} onNavigate={() => setMobileOpen(false)} />
            </aside>
        </>
    );
}
