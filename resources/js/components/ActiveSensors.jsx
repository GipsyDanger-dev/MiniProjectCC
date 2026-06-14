import React from "react";
import GlassSurface from "./GlassSurface";

function cn(...classes) { return classes.filter(Boolean).join(' '); }

export default function ActiveSensors({ items }) {
    return (
        <GlassSurface className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs sm:text-sm font-normal text-white tracking-tight">Sensor Units</p>
                <span className="text-[10px] sm:text-[11px] bg-[rgba(34,197,94,0.1)] text-[#22c55e] px-2 sm:px-3 py-0.5 sm:py-1 rounded-[9999px] font-normal border border-[rgba(34,197,94,0.3)]"
                      style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '1px' }}>
                    {items.length}/{items.length}
                </span>
            </div>
            <div className="space-y-1.5 sm:space-y-2">
                {items.map(item => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg border border-[rgba(33,35,39,0.8)] bg-[rgba(10,10,10,0.6)] px-2.5 sm:px-3 py-2 sm:py-2.5">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(196,181,253,0.05) 100%)', border: '1px solid rgba(124,58,237,0.2)' }}>
                                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c4b5fd]" strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-normal text-white truncate">{item.name}</p>
                                <p className="text-[10px] sm:text-[12px] text-[#7d8187]">{item.type}</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs sm:text-sm font-normal text-white" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '1px' }}>{item.value}</p>
                            <span className={cn(
                                "inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-[9999px] text-[9px] sm:text-[10px] font-normal uppercase tracking-[1px]",
                                item.status === "Normal" ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30" : "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30"
                            )} style={{ fontFamily: "'Geist Mono', monospace" }}>{item.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </GlassSurface>
    );
}
