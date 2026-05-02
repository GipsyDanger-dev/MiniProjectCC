import React from "react";
import { cn } from "../lib/utils";

export default function StatCard({
    title,
    value,
    sub,
    icon: Icon,
    badge,
    accent = "lime",
}) {
    return (
        <div className="card-surface p-5">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {title}
                </p>
                {Icon && (
                    <span
                        className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center",
                            accent === "lime"
                                ? "bg-lime/20 text-lime"
                                : "bg-accent/20 text-accent",
                        )}
                    >
                        <Icon className="w-4 h-4" />
                    </span>
                )}
            </div>
            <div className="mt-4">
                <p className="text-2xl font-semibold text-foreground">
                    {value}
                </p>
                {sub && (
                    <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                )}
            </div>
            {badge && (
                <span className="inline-flex items-center px-2 py-1 mt-4 rounded-full text-[10px] uppercase tracking-wider bg-success/20 text-success">
                    {badge}
                </span>
            )}
        </div>
    );
}
