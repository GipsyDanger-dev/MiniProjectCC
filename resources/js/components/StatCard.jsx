import React from "react";
import { cn } from "../lib/utils";

export default function StatCard({
    title,
    value,
    sub,
    icon: Icon,
    badge,
    accent = "lime",
    badgeVariant = "muted",
}) {
    const tagClass = {
        green: "text-success bg-success/10",
        red: "text-danger bg-danger/10",
        orange: "text-accent bg-accent/10",
        muted: "text-ink3 bg-surface3",
    };

    return (
        <div className="bg-surface2 border border-edge rounded-lg shadow-card p-4">
            <p className="text-[11px] text-ink3 mb-1.5">
                {title}
            </p>
            <p className={cn(
                "text-lg font-semibold tracking-[0.02em] mb-1 tabular-nums",
                badgeVariant === "red" && "text-danger",
                badgeVariant === "green" && "text-success",
                badgeVariant === "orange" && "text-accent",
                badgeVariant === "muted" && "text-ink",
            )}>
                {value}
            </p>
            {badge && (
                <span className={cn(
                    "inline-block text-[11px] font-medium px-2 py-0.5 rounded-md",
                    tagClass[badgeVariant] || tagClass.muted,
                )}>
                    {badge}
                </span>
            )}
        </div>
    );
}
