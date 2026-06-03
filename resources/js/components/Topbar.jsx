import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";

export default function Topbar({
    mobileOpen,
    setMobileOpen,
}) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatted = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(time);

    const initials = "OP";

    return (
        <header className="glass-header h-9 flex items-center px-4 gap-3 shrink-0">
            <button
                type="button"
                className="lg:hidden w-7 h-7 flex items-center justify-center text-[#7a7a6e]"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <Menu className="w-4 h-4" />
            </button>

            <div className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-[0.08em] text-[#7a7a6e]">
                <span>Node:</span>
                <span className="text-[#b0b0a0] font-medium">ESP32-A1</span>
            </div>
            <div className="hidden md:block w-px h-3.5 bg-[#2a2a26]" />
            <div className="hidden md:flex items-center gap-2 text-[9px] uppercase tracking-[0.08em] text-[#7a7a6e]">
                <span>Fuzzy:</span>
                <span className="text-[#b0b0a0] font-medium">13 rules</span>
            </div>

            <div className="flex-1" />

            <div className="hidden sm:flex items-center border border-accent px-2.5 py-1 text-[9px] uppercase tracking-[0.08em] text-accent cursor-pointer hover:bg-accent/5 transition-smooth h-6">
                <span className="w-1.5 h-1.5 bg-accent mr-1.5" />
                <span>AUTO MODE</span>
            </div>

            <span className="text-[10px] font-medium text-[#a0a090] tracking-[0.04em] tabular-nums">
                {formatted} WIB
            </span>

            <div className="w-6 h-6 bg-[#222] border border-[#333] flex items-center justify-center text-[9px] font-medium text-[#888] uppercase">
                {initials}
            </div>
        </header>
    );
}
