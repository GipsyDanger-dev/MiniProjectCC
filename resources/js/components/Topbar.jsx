import React, { useEffect, useState } from "react";
import { Menu, Search, LogOut } from "lucide-react";

export default function Topbar({ setCurrentPage, onSearch, onMenuClick }) {
    const [now, setNow] = useState(new Date());
    const [userName, setUserName] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("/api/user");
                const data = await response.json();
                setUserName(data.name || data.user?.name || "Admin");
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
            <div className="flex items-center gap-3 px-4 py-3 md:px-8 md:py-4">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="lg:hidden w-10 h-10 rounded-full glass-pill flex items-center justify-center shrink-0"
                >
                    <Menu className="w-5 h-5 text-foreground" />
                </button>

                <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && searchValue.trim()) {
                                onSearch?.(searchValue.trim());
                                setCurrentPage?.("sensors");
                            }
                        }}
                        className="w-full h-10 md:h-11 rounded-full glass-pill pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime/60"
                    />
                </div>

                <span className="hidden lg:inline-flex items-center px-3 py-2 rounded-full glass-pill text-xs text-muted-foreground whitespace-nowrap">
                    {formatted} WIB
                </span>

                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setShowUserMenu((v) => !v)}
                        className="w-10 h-10 rounded-full glass-pill flex items-center justify-center"
                    >
                        <span className="text-sm font-semibold text-foreground">
                            {(userName || "A").charAt(0).toUpperCase()}
                        </span>
                    </button>
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-lg glass-panel border border-white/15 shadow-lg overflow-hidden z-50">
                            <div className="px-4 py-2 border-b border-white/10">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {userName || "Admin"}
                                </p>
                            </div>
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
