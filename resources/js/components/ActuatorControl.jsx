import React from "react";
import { cn } from "../lib/utils";

export default function ActuatorControl({ items, onToggle }) {
    return (
        <div className="bg-surface2 border border-edge">
            <div className="px-3 py-2 border-b border-edge">
                <p className="text-[9px] font-medium uppercase tracking-[0.10em] text-ink2">
                    Actuator Control
                </p>
            </div>
            <div className="px-3">
                {items.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between py-2.5 border-b border-edge last:border-b-0"
                    >
                        <div>
                            <p className="text-[9px] uppercase tracking-[0.08em] text-ink3">
                                {item.name}
                            </p>
                            <p className={cn(
                                "text-[9px] uppercase tracking-[0.06em] mt-0.5",
                                item.enabled ? "text-accent" : "text-ink3",
                            )}>
                                {item.subtitle}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onToggle?.(item.name)}
                            className={cn(
                                "w-9 h-[18px] border cursor-pointer relative transition-smooth",
                                item.enabled
                                    ? "bg-accent/10 border-accent"
                                    : "bg-surface3 border-edge2",
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute top-0.5 w-3 h-3 transition-all",
                                    item.enabled
                                        ? "left-[18px] bg-accent"
                                        : "left-0.5 bg-edge2",
                                )}
                            />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
