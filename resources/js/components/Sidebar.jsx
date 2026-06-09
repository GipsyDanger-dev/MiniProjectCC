import React from "react";
import {
    Activity,
    Cpu,
    Database,
    LayoutGrid,
    LogOut,
    Plus,
    Settings,
    X,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutGrid },
    { id: "sensors", label: "Sensor Feed", icon: Database },
    { id: "devices", label: "Devices", icon: Cpu },
    { id: "logs", label: "Event Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
];

function SidebarContent({
    collapsed,
    setCollapsed,
    currentPage,
    setCurrentPage,
    onNavigate,
}) {
    const handleLogout = async () => {
        try {
            const response = await fetch("/api/logout", { method: "POST" });
            const data = await response.json();
            if (data.status === "success") {
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const handleClick = (id) => {
        setCurrentPage(id);
        onNavigate?.();
    };

    return (
        <>
            <div
                className={cn(
                    "flex items-center gap-3 py-6",
                    collapsed ? "justify-center" : "px-4",
                )}
            >
                <div className="w-8 h-8 border border-accent flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="w-4 h-4 text-accent">
                        <circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
                    </svg>
                </div>
                {!collapsed && (
                    <div>
                        <p className="font-medium text-xs text-surface tracking-[0.14em] uppercase">
                            Sentinel
                        </p>
                        <p className="text-[10px] text-sidebar-muted">
                            IoT — v2.4
                        </p>
                    </div>
                )}
            </div>

            <div className="pt-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-sidebar-muted px-4 pb-2">
                    Main
                </p>
                <nav className="flex flex-col">
                    {navItems.slice(0, 4).map(({ id, label, icon: Icon }) => {
                        const isActive = currentPage === id;
                        return (
                            <button
                                key={id}
                                onClick={() => handleClick(id)}
                                title={collapsed ? label : undefined}
                                className={cn(
                                    "group flex items-center gap-3 h-9 text-[12px] uppercase tracking-[0.08em] transition-smooth border-l-2",
                                    collapsed ? "justify-center px-0" : "px-4",
                                    isActive
                                        ? "text-surface bg-[#1c1c18] border-l-accent"
                                        : "text-sidebar-muted border-l-transparent hover:text-surface/60 hover:bg-white/[0.02]",
                                )}
                            >
                                <Icon
                                    className="w-3.5 h-3.5 shrink-0 opacity-60 group-[.active]:opacity-100"
                                    strokeWidth={1.5}
                                />
                                {!collapsed && <span>{label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="pt-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-sidebar-muted px-4 pb-2">
                    Config
                </p>
                <nav className="flex flex-col">
                    {navItems.slice(4).map(({ id, label, icon: Icon }) => {
                        const isActive = currentPage === id;
                        return (
                            <button
                                key={id}
                                onClick={() => handleClick(id)}
                                title={collapsed ? label : undefined}
                                className={cn(
                                    "group flex items-center gap-3 h-9 text-[12px] uppercase tracking-[0.08em] transition-smooth border-l-2",
                                    collapsed ? "justify-center px-0" : "px-4",
                                    isActive
                                        ? "text-surface bg-[#1c1c18] border-l-accent"
                                        : "text-sidebar-muted border-l-transparent hover:text-surface/60 hover:bg-white/[0.02]",
                                )}
                            >
                                <Icon
                                    className="w-3.5 h-3.5 shrink-0 opacity-60"
                                    strokeWidth={1.5}
                                />
                                {!collapsed && <span>{label}</span>}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="flex-1" />

            <div className="px-4 pb-6 space-y-2">
                {!collapsed && (
                    <button
                        type="button"
                        onClick={() => handleClick("new-device")}
                        className="w-full h-8 border border-[#333] text-sidebar-muted text-[10px] uppercase tracking-[0.1em] hover:border-accent hover:text-accent transition-smooth flex items-center justify-center gap-1.5"
                    >
                        <Plus className="w-3 h-3" />
                        Add Device
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleLogout}
                    className={cn(
                        "w-full flex items-center gap-3 h-9 text-[10px] uppercase tracking-[0.08em] transition-smooth text-[#444] hover:text-accent",
                        collapsed ? "justify-center px-0" : "px-4 justify-center",
                    )}
                >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
                <button
                    type="button"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn(
                        "w-full flex items-center gap-3 h-9 text-[10px] uppercase tracking-[0.08em] transition-smooth text-[#444] hover:text-accent",
                        collapsed ? "justify-center px-0" : "px-4 justify-center",
                    )}
                >
                    {collapsed ? (
                        <ChevronsRight className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                        <ChevronsLeft className="w-3.5 h-3.5 shrink-0" />
                    )}
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </>
    );
}

export default function Sidebar({
    collapsed,
    setCollapsed,
    currentPage,
    setCurrentPage,
    theme,
    toggleTheme,
    mobileOpen,
    setMobileOpen,
}) {
    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={cn(
                    "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 border-r-2 border-accent transition-all duration-200 glass-sidebar overflow-hidden",
                    collapsed ? "w-[60px] px-2" : "w-[176px]",
                )}
            >
                <div className="flex-1 overflow-y-auto thin-scroll">
                    <SidebarContent
                        collapsed={collapsed}
                        setCollapsed={setCollapsed}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-[176px] flex flex-col glass-sidebar border-r-2 border-accent transition-transform duration-200 ease-out lg:hidden overflow-y-auto thin-scroll",
                    mobileOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-surface"
                >
                    <X className="w-4 h-4" />
                </button>
                <SidebarContent
                    collapsed={false}
                    setCollapsed={setCollapsed}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    onNavigate={() => setMobileOpen(false)}
                />
            </aside>
        </>
    );
}
