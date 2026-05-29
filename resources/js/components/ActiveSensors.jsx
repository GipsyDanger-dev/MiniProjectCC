import React from "react";
import GlassSurface from "./GlassSurface";

export default function ActiveSensors({ items }) {
    return (
        <GlassSurface className="p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Active Sensors</h3>
                <span className="text-[10px] text-muted-foreground bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-full font-semibold">{items.length} online</span>
            </div>
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet/10 border border-violet/20 flex items-center justify-center"><item.icon className="w-4 h-4 text-violet" /></div>
                            <div><p className="text-sm font-medium text-foreground">{item.name}</p><p className="text-[11px] text-muted-foreground">{item.type}</p></div>
                        </div>
                        <div className="text-right"><p className="text-sm font-semibold text-foreground">{item.value}</p><span className="text-[10px] uppercase tracking-wider text-success font-semibold">{item.status}</span></div>
                    </div>
                ))}
            </div>
        </GlassSurface>
    );
}
