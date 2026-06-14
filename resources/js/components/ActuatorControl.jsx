import React from "react";
import { cn } from "../lib/utils";

export default function ActuatorControl({ items, onToggle }) {
    return (
        <div className="bg-surface2 border border-edge rounded-lg shadow-card">
            <div className="px-4 py-3 border-b border-edge">
                <p className="text-[12px] font-medium text-ink2">
                    Actuator Control
                </p>
            </div>
            <div className="px-4">
                {items.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between py-2.5 border-b border-edge last:border-b-0"
                    >
                        <div>
                            <p className="text-[11px] text-ink3">
                                {item.name}
                            </p>
                            <p className={cn(
                                "text-[11px] mt-0.5",
                                item.enabled ? "text-accent" : "text-ink3",
                            )}>
                                {item.subtitle}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onToggle?.(item.name)}
                            className={cn(
                                "w-10 h-5 rounded-full cursor-pointer relative transition-smooth",
                                item.enabled
                                    ? "bg-accent/20"
                                    : "bg-surface3",
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute top-0.5 w-4 h-4 rounded-full transition-all",
                                    item.enabled
                                        ? "left-[20px] bg-accent"
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
