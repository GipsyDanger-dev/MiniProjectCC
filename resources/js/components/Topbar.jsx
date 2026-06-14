import React, { useState, useEffect, useRef } from "react";
import { LogOut, Menu, User } from "lucide-react";

export default function Topbar({ mobileOpen, setMobileOpen, systemMode = "auto", user, onLogout }) {
    const [time, setTime] = useState(new Date());
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => { const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);

    const fmt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(time);
    const initials = user?.name?.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "AD";

    return (
        <header className="sticky top-0 z-20 h-11 flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shrink-0 border-b border-[rgba(33,35,39,0.6)]" style={{ background: "rgba(10,10,10,0.8)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-7 h-7 flex items-center justify-center text-[#7d8187] hover:text-white transition-colors">
                <Menu className="w-4 h-4" strokeWidth={1.5} />
            </button>

            <div className="hidden md:flex items-center gap-2 text-[11px] text-[#7d8187]">
                <span>Node:</span><span className="text-white font-normal">ESP32-A1</span>
            </div>
            <div className="hidden md:block w-px h-3.5 bg-[rgba(33,35,39,0.8)]" />
            <div className="hidden md:flex items-center gap-2 text-[11px] text-[#7d8187]">
                <span>Fuzzy:</span><span className="text-white font-normal">27 rules</span>
            </div>

            <div className="flex-1" />

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-[9999px] border border-[rgba(33,35,39,0.8)] text-[10px] sm:text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[#22c55e] font-normal uppercase" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.8px' }}>Live</span>
            </div>

            <span className="text-[11px] sm:text-[12px] font-normal text-[#7d8187] tabular-nums" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '0.5px' }}>{fmt}</span>

            <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[rgba(26,28,32,0.6)] border border-[rgba(33,35,39,0.8)] flex items-center justify-center text-[10px] sm:text-[11px] font-normal text-white uppercase hover:border-[rgba(124,58,237,0.3)] transition-colors cursor-pointer"
                    style={{ fontFamily: "'Geist Mono', monospace" }}>
                    {initials}
                </button>

                {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-[rgba(33,35,39,0.8)] z-50 overflow-hidden" style={{ background: "rgba(25,25,25,0.95)", backdropFilter: "blur(12px)" }}>
                        <div className="px-3 py-2.5 border-b border-[rgba(33,35,39,0.8)]">
                            <p className="text-[11px] text-[#7d8187]">Logged in as</p>
                            <p className="text-[13px] text-white font-normal truncate">{user?.name || "Admin"}</p>
                            <p className="text-[11px] text-[#7d8187] truncate">{user?.email || ""}</p>
                        </div>
                        <button onClick={() => { setMenuOpen(false); onLogout?.(); }}
                            className="w-full px-3 py-2 flex items-center gap-2 text-[12px] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors cursor-pointer font-normal">
                            <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} /> Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
