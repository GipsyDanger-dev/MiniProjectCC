import React from "react";
import {
    Activity,
    Cpu,
    Database,
    LayoutGrid,
    LifeBuoy,
    LogOut,
    Moon,
    Plus,
    Settings,
    Sun,
    UserCircle2,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "sensors", label: "Sensor Data", icon: Database },
    { id: "devices", label: "Device Status", icon: Cpu },
    { id: "logs", label: "Activity Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
    collapsed,
    setCollapsed,
    currentPage,
    setCurrentPage,
    theme,
    toggleTheme,
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
    return (
        <aside
            className={cn(
                "hidden lg:flex flex-col h-screen sticky top-0 border-r transition-all duration-300 ease-out glass-sidebar",
                collapsed ? "w-[84px] px-3" : "w-[270px] px-5",
            )}
        >
            <div
                className={cn(
                    "flex items-center gap-3 py-6",
                    collapsed ? "justify-center" : "px-2",
                )}
            >
                <div className="w-9 h-9 rounded-full bg-lime flex items-center justify-center text-foreground text-xs font-bold">
                    SI
                </div>
                {!collapsed && (
                    <div>
                        <p className="font-semibold text-sm text-foreground">
                            Smart Safety
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Security Monitor
                        </p>
                    </div>
                )}
            </div>

            <nav className="flex flex-col gap-2">
                {navItems.map(({ id, label, icon: Icon }) => {
                    const isActive = currentPage === id;
                    return (
                        <button
                            key={id}
                            onClick={() => setCurrentPage(id)}
                            title={collapsed ? label : undefined}
                            className={cn(
                                "group flex items-center gap-3 h-11 rounded-full text-sm font-medium transition-smooth",
                                collapsed ? "justify-center px-0" : "px-4",
                                isActive
                                    ? "bg-lime text-lime-foreground shadow-lime"
                                    : "text-sidebar-foreground hover:bg-muted",
                            )}
                        >
                            <Icon
                                className="w-[18px] h-[18px] shrink-0"
                                strokeWidth={2}
                            />
                            {!collapsed && <span>{label}</span>}
                        </button>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 space-y-5">
                {!collapsed && (
                    <button
                        type="button"
                        onClick={() => setCurrentPage("new-device")}
                        className="w-full flex items-center justify-center gap-2 h-11 rounded-full bg-deep-green text-deep-green-foreground font-semibold hover:shadow-lime transition-smooth"
                    >
                        <Plus className="w-4 h-4" />
                        New Device
                    </button>
                )}

                <div className="space-y-2">
                    <button
                        type="button"
                        className={cn(
                            "w-full flex items-center gap-3 h-11 rounded-full text-sm font-medium transition-smooth hover:bg-muted",
                            collapsed ? "justify-center px-0" : "px-4",
                        )}
                    >
                        <LifeBuoy className="w-[18px] h-[18px] shrink-0" />
                        {!collapsed && <span>Support</span>}
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 h-11 rounded-full text-sm font-medium transition-smooth hover:bg-muted text-danger",
                            collapsed ? "justify-center px-0" : "px-4",
                        )}
                    >
                        <LogOut className="w-[18px] h-[18px] shrink-0" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                    <button
                        type="button"
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn(
                            "w-full flex items-center gap-3 h-11 rounded-full text-sm font-medium transition-smooth hover:bg-muted",
                            collapsed ? "justify-center px-0" : "px-4",
                        )}
                    >
                        {collapsed ? (
                            <ChevronsRight className="w-[18px] h-[18px] shrink-0" />
                        ) : (
                            <ChevronsLeft className="w-[18px] h-[18px] shrink-0" />
                        )}
                        {!collapsed && <span>Collapse</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
