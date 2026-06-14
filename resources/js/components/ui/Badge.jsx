import React from "react";
import { cn } from "../../lib/utils";

const variants = {
    success: "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30",
    danger: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30",
    warning: "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30",
    info: "bg-[#1a1c20] text-[#7d8187] border border-[#212327]",
};

export default function Badge({ children, variant = "info", className, ...props }) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-[9999px] text-[11px] font-normal uppercase",
                variants[variant],
                className
            )}
            style={{ fontFamily: "'Geist Mono', 'JetBrains Mono', monospace", letterSpacing: '1px' }}
            {...props}
        >
            {children}
        </span>
    );
}
