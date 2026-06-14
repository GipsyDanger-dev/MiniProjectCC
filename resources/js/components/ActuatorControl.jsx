import React from "react";
import GlassSurface from "./GlassSurface";

export default function ActuatorControl({ items }) {
    return (
        <GlassSurface className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-normal mb-3 text-white tracking-tight">Actuator Control</p>
            <div className="space-y-1.5 sm:space-y-2">
                {items.map(item => (
                    <div key={item.name} className="flex items-center justify-between rounded-lg border border-[rgba(33,35,39,0.8)] bg-[rgba(10,10,10,0.6)] px-2.5 sm:px-3 py-2 sm:py-2.5">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(196,181,253,0.05) 100%)', border: '1px solid rgba(124,58,237,0.2)' }}>
                                <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c4b5fd]" strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-normal text-white truncate">{item.name}</p>
                                <p className="text-[10px] sm:text-[12px] text-[#7d8187] truncate">{item.subtitle}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            {item.value && <span className="text-xs sm:text-sm font-normal text-white" style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: '1px' }}>{item.value}</span>}
                            <div className={`w-9 h-5 rounded-full relative transition-all duration-150 ${item.enabled ? "bg-[#7c3aed]" : "bg-[rgba(54,58,63,0.8)]"}`}>
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-150 ${item.enabled ? "left-[18px]" : "left-0.5"}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </GlassSurface>
    );
}
