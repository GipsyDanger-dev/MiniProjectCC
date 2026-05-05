import React, { useEffect, useState } from "react";
import { Bell, Search, LogOut, User } from "lucide-react";

export default function Topbar() {
    const [now, setNow] = useState(new Date());
    const [userName, setUserName] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/user");
                const data = await response.json();
                if (data.status === "success") {
                    setUserName(data.user.name);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        fetchUser();
    }, []);

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

    const formatted = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(now);

    return (
        <header className="sticky top-0 z-20 border-b border-white/15 glass-header">
            <div className="flex items-center gap-4 px-8 py-4">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search devices, logs, sensors..."
                        className="w-full h-11 rounded-full glass-pill pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime/60"
                    />
                </div>
                <button
                    type="button"
                    className="w-11 h-11 rounded-full glass-pill flex items-center justify-center hover:border-lime/50 transition-smooth"
                >
                    <Bell className="w-5 h-5 text-foreground" />
                </button>
                <span className="hidden md:inline-flex items-center px-3 py-2 rounded-full glass-pill text-xs text-muted-foreground">
                    {formatted} WIB
                </span>

                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full glass-pill hover:border-lime/50 transition-smooth"
                    >
                        <User className="w-4 h-4 text-foreground" />
                        <span className="text-sm text-foreground">
                            {userName || "User"}
                        </span>
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg glass-panel border border-white/15 shadow-lg overflow-hidden z-50">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-foreground hover:bg-white/10 transition-smooth"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
