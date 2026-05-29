import React from "react";
import { cn } from "../lib/utils";
import GlassSurface from "./GlassSurface";

export default function ActuatorControl({ items }) {
    return (
        <GlassSurface className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Actuator Control</h3>
            <div className="space-y-2">
                {items.map(item => (
                    <div key={item.name} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center"><item.icon className="w-4 h-4 text-foreground" /></div>
                            <div><p className="text-sm font-medium text-foreground">{item.name}</p><p className="text-[11px] text-muted-foreground">{item.subtitle}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                            {item.value && <span className="text-sm font-semibold text-foreground">{item.value}</span>}
                            <button className={cn("w-11 h-6 rounded-full p-0.5 transition-all border", item.enabled ? "bg-violet border-violet" : "bg-muted border-white/[0.08]")}>
                                <span className={cn("block w-5 h-5 rounded-full bg-background transition-transform", item.enabled ? "translate-x-5" : "translate-x-0")} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </GlassSurface>
    );
}
