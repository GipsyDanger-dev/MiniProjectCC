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
        <header className="glass-header h-9 flex items-center px-4 gap-3 shrink-0">
            <button
                type="button"
                className="lg:hidden w-7 h-7 flex items-center justify-center text-[#7a7a6e]"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <Menu className="w-4 h-4" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.08em] text-[#7a7a6e]">
                <span>Node:</span>
                <span className="text-[#b0b0a0] font-medium">ESP32-A1</span>
            </div>
            <div className="hidden md:block w-px h-3.5 bg-[#2a2a26]" />
            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.08em] text-[#7a7a6e]">
                <span>Fuzzy:</span>
                <span className="text-[#b0b0a0] font-medium">27 rules</span>
            </div>

            <div className="flex-1" />

            <div className={`hidden sm:flex items-center border px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] cursor-pointer transition-smooth h-6 ${
                systemMode === "auto"
                    ? "border-accent text-accent hover:bg-accent/5"
                    : "border-orange-400 text-orange-400 hover:bg-orange-500/5"
            }`}>
                <span className={`w-1.5 h-1.5 mr-1.5 ${systemMode === "auto" ? "bg-accent" : "bg-orange-400"}`} />
                <span>{systemMode.toUpperCase()} MODE</span>
            </div>

            <span className="text-[12px] font-medium text-[#a0a090] tracking-[0.04em] tabular-nums">
                {formatted} WIB
            </span>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-6 h-6 bg-[#222] border border-[#333] flex items-center justify-center text-[10px] font-medium text-[#888] uppercase hover:border-red-500/40 transition-colors cursor-pointer"
                >
                    {initials}
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#111118] border border-[#1e1e2a] rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-[#1e1e2a]">
                            <p className="text-[11px] text-gray-400">Logged in as</p>
                            <p className="text-[13px] text-white font-medium truncate">{user?.name || "Admin"}</p>
                            <p className="text-[11px] text-gray-500 truncate">{user?.email || ""}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setMenuOpen(false); onLogout?.(); }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
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
