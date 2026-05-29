import React, { useEffect, useState } from "react";
import { Search, LogOut } from "lucide-react";

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
            <div className="flex items-center gap-4 px-6 py-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Search..." className="w-full h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-violet/40 transition-smooth" />
                </div>
                <span className="hidden md:inline text-xs text-muted-foreground">{fmt} WIB</span>
                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-smooth">
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-40 rounded-lg bg-card border border-white/[0.08] shadow-lg overflow-hidden z-50">
                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-white/[0.06] transition-smooth">
                                <LogOut className="w-3.5 h-3.5" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
