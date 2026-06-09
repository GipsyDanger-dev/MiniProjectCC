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
        green: "text-success border-success bg-success/10",
        red: "text-danger border-danger bg-danger/10",
        orange: "text-accent border-accent bg-accent/10",
        muted: "text-ink3 border-edge2 bg-surface3",
    };

    return (
        <div className="bg-surface2 border border-edge p-3">
            <p className="text-[10px] uppercase tracking-[0.10em] text-ink3 mb-1.5">
                {title}
            </p>
            <p className={cn(
                "text-lg font-medium tracking-[0.02em] mb-1",
                badgeVariant === "red" && "text-danger",
                badgeVariant === "green" && "text-success",
                badgeVariant === "orange" && "text-accent",
                badgeVariant === "muted" && "text-ink",
            )}>
                {value}
            </p>
            {badge && (
                <span className={cn(
                    "inline-block text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border",
                    tagClass[badgeVariant] || tagClass.muted,
                )}>
                    {badge}
                </span>
            )}
        </div>
    );
}
