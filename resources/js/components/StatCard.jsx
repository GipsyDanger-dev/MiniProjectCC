import React from "react";
import { cn } from "../lib/utils";
import GlassSurface from "./GlassSurface";

export default function StatCard({ title, value, sub, icon: Icon, badge, accent = "violet" }) {
    return (
        <GlassSurface className="p-5 bento-card bento-card--border-glow">
            <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">{title}</p>
                {Icon && <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center", accent === "violet" ? "bg-violet/10 text-violet" : "bg-accent/20 text-accent")}><Icon className="w-4 h-4" /></span>}
            </div>
            <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            </div>
            {badge && <span className="inline-flex items-center px-2 py-0.5 mt-3 rounded-full text-[10px] uppercase tracking-wider bg-success/20 text-success font-semibold">{badge}</span>}
        </GlassSurface>
    );
}
