import React, { useState, useEffect, useRef } from "react";
import { LogOut, Menu, User } from "lucide-react";

export default function Topbar({
    mobileOpen,
    setMobileOpen,
    systemMode = "auto",
    user,
    onLogout,
}) {
    const [time, setTime] = useState(new Date());
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const formatted = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(time);

    const initials = user?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "AD";

    return (
        <header className="glass-header h-11 flex items-center px-4 gap-3 shrink-0">
            <button
                type="button"
                className="lg:hidden w-7 h-7 flex items-center justify-center text-ink3"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <Menu className="w-4 h-4" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-[11px] text-ink3">
                <span>Node:</span>
                <span className="text-ink2 font-medium">ESP32-A1</span>
            </div>
            <div className="hidden md:block w-px h-3.5 bg-edge" />
            <div className="hidden md:flex items-center gap-2 text-[11px] text-ink3">
                <span>Fuzzy:</span>
                <span className="text-ink2 font-medium">27 rules</span>
            </div>

            <div className="flex-1" />

            <div className={`hidden sm:flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-smooth ${
                systemMode === "auto"
                    ? "bg-accent/10 text-accent"
                    : "bg-warning/10 text-warning"
            }`}>
                <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${systemMode === "auto" ? "bg-accent" : "bg-warning"}`} />
                <span>{systemMode.toUpperCase()} MODE</span>
            </div>

            <span className="text-[12px] font-medium text-ink3 tabular-nums">
                {formatted} WIB
            </span>

            <div className="relative" ref={menuRef}>
                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-7 h-7 rounded-lg bg-surface3 border border-edge flex items-center justify-center text-[11px] font-medium text-ink2 uppercase hover:border-accent/40 transition-colors cursor-pointer"
                >
                    {initials}
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-surface2 border border-edge rounded-lg shadow-elevated z-50 overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-edge">
                            <p className="text-[11px] text-ink3">Logged in as</p>
                            <p className="text-[13px] text-ink font-medium truncate">{user?.name || "Admin"}</p>
                            <p className="text-[11px] text-ink3 truncate">{user?.email || ""}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setMenuOpen(false); onLogout?.(); }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-[12px] text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
