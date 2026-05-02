import React from "react";
import { cn } from "../lib/utils";

export default function ActuatorControl({ items }) {
    return (
        <div className="relative isolate overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03)_62%,rgba(168,85,247,0.10))] backdrop-blur-xl p-6">
            <span className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_110%_at_100%_0%,rgba(204,255,0,0.08),transparent_66%)]" />
            <h3 className="text-sm font-semibold text-foreground relative">
                Actuator Control
            </h3>
            <div className="mt-4 space-y-3 relative">
                {items.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-3 py-2"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-black/30 border border-white/10 flex items-center justify-center">
                                <item.icon className="w-4 h-4 text-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {item.subtitle}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {item.value && (
                                <span className="text-sm font-semibold text-foreground">
                                    {item.value}
                                </span>
                            )}
                            <button
                                type="button"
                                className={cn(
                                    "w-12 h-6 rounded-full p-1 transition-all border",
                                    item.enabled
                                        ? "bg-lime border-lime shadow-[0_0_18px_rgba(204,255,0,0.36)]"
                                        : "bg-muted border-white/10",
                                )}
                            >
                                <span
                                    className={cn(
                                        "block w-4 h-4 rounded-full bg-background transition-transform",
                                        item.enabled
                                            ? "translate-x-6"
                                            : "translate-x-0",
                                    )}
                                />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
