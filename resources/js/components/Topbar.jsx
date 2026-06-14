import React, { useEffect, useState } from "react";
import { LogOut, Bell } from "lucide-react";

export default function Topbar() {
    const [now, setNow] = useState(new Date());
    const [showMenu, setShowMenu] = useState(false);
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

    const handleLogout = async () => {
        try { const r = await fetch("/api/logout", { method: "POST" }); const d = await r.json(); if (d.status === "success") window.location.href = "/login"; } catch {}
    };

    const fmt = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "short", year: "numeric" }).format(now);

    return (
        <header className="navbar-glass">
            <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3">
                {/* Left — live + time */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-[9999px] border border-[#212327] bg-[#0a0a0a]">
                        <span className="live-dot" />
                        <span className="text-[11px] font-normal uppercase tracking-[1.2px] text-[#22c55e]" style={{ fontFamily: "'Geist Mono', monospace" }}>Live</span>
                    </div>
                    <span className="hidden md:inline text-xs text-[#7d8187]">{fmt} WIB</span>
                </div>

                {/* Right — notifications + logout */}
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#212327] flex items-center justify-center text-[#7d8187] hover:text-white hover:border-[#363a3f] transition-all duration-150 relative">
                        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#c4b5fd]" />
                    </button>

                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#212327] flex items-center justify-center text-[#7d8187] hover:text-white hover:border-[#363a3f] transition-all duration-150">
                            <LogOut className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-[#212327] overflow-hidden z-50 bg-[#191919]">
                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-[#1a1c20] transition-all duration-150 font-normal">
                                    <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
