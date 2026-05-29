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
        <aside className={cn("sidebar-glass hidden lg:flex flex-col transition-all duration-300", collapsed ? "w-[72px]" : "w-[260px]")}>
            {/* Logo */}
            <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-white/[0.06]", collapsed && "justify-center px-0")}>
                <div className="w-9 h-9 rounded-xl bg-violet flex items-center justify-center text-white text-xs font-bold shrink-0">SI</div>
                {!collapsed && <div><p className="font-semibold text-sm text-foreground leading-tight">SentinelIoT</p><p className="text-[11px] text-muted-foreground">Smart Safety</p></div>}
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 py-4 min-h-0 overflow-hidden">
                {collapsed ? (
                    <div className="flex flex-col gap-1">
                        {navItems.map(({ id, icon: Icon }) => (
                            <button key={id} onClick={() => setCurrentPage(id)}
                                className={cn("flex items-center justify-center w-full h-10 rounded-xl transition-smooth", currentPage === id ? "bg-violet/15 text-violet" : "text-white/50 hover:bg-white/[0.06] hover:text-white")}>
                                <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                        ))}
                    </div>
                ) : (
                    <GooeyNav items={navItems} initialActiveIndex={activeIndex >= 0 ? activeIndex : 0} onNavigate={(item) => setCurrentPage(item.id)} />
                )}
            </div>

            {/* Bottom actions */}
            <div className="px-3 pb-4 space-y-1 border-t border-white/[0.06] pt-3">
                {!collapsed ? (
                    <button onClick={() => setCurrentPage("new-device")} className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-violet text-white font-semibold text-sm transition-smooth hover:shadow-violet">
                        <Plus className="w-4 h-4" /> New Device
                    </button>
                ) : (
                    <button onClick={() => setCurrentPage("new-device")} className="w-full flex items-center justify-center h-10 rounded-xl bg-violet text-white transition-smooth hover:shadow-violet">
                        <Plus className="w-4 h-4" />
                    </button>
                )}
                <button onClick={handleLogout} className={cn("w-full flex items-center gap-3 h-10 rounded-xl text-sm font-medium transition-smooth hover:bg-white/[0.06] text-danger", collapsed ? "justify-center" : "px-3")}>
                    <LogOut className="w-[18px] h-[18px] shrink-0" />{!collapsed && <span>Sign Out</span>}
                </button>
                <button onClick={() => setCollapsed(!collapsed)} className={cn("w-full flex items-center gap-3 h-10 rounded-xl text-sm transition-smooth hover:bg-white/[0.06] text-white/40", collapsed ? "justify-center" : "px-3")}>
                    {collapsed ? <ChevronsRight className="w-[18px] h-[18px]" /> : <ChevronsLeft className="w-[18px] h-[18px]" />}{!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
