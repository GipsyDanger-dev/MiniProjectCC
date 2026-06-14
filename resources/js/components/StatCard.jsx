import React from "react";
import { cn } from "../lib/utils";
import GlassSurface from "./GlassSurface";

export default function StatCard({ title, value, sub, icon: Icon, badge, danger = false }) {
    return (
        <GlassSurface className={cn("p-3 sm:p-4 bento-card bento-card--border-glow group", danger && "animate-danger-border border-[#ef4444]/50")}>
            <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle at 100% 0%, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

            <div className="flex items-center justify-between relative z-10">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-[1.2px] font-normal text-[#7d8187]" style={{ fontFamily: "'Geist Mono', monospace" }}>{title}</p>
                {Icon && (
                    <span className={cn(
                        "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                        danger ? "bg-[#ef4444]/15 text-[#ef4444] animate-danger-shake" : "bg-[rgba(26,28,32,0.6)] text-white border border-[rgba(33,35,39,0.8)] group-hover:border-[rgba(124,58,237,0.3)] group-hover:text-[#c4b5fd]"
                    )}>
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </span>
                )}
            </div>
            <div className="mt-2 sm:mt-3 relative z-10" role="status" aria-live="polite">
                <p className={cn("text-xl sm:text-2xl font-normal tracking-tight", danger ? "text-[#ef4444] animate-danger-text" : "text-white")}
                   style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '-0.5px' }}>
                    {value}
                </p>
                {sub && <p className="text-[10px] sm:text-xs mt-0.5 sm:mt-1 text-[#7d8187] truncate">{sub}</p>}
            </div>
            {badge && (
                <span className={cn(
                    "inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 mt-2 sm:mt-3 rounded-[9999px] text-[10px] sm:text-[11px] font-normal uppercase tracking-[1px] relative z-10",
                    danger ? "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30" : "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30"
                )} style={{ fontFamily: "'Geist Mono', monospace" }}>
                    {badge}
                </span>
            )}
        </GlassSurface>
    );
}
