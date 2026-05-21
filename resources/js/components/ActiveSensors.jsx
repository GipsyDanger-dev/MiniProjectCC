import React from "react";

export default function ActiveSensors({ items }) {
    return (
        <div className="relative isolate overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.03)_62%,rgba(102,126,234,0.10))] backdrop-blur-xl p-6">
            <span className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_110%_at_100%_0%,rgba(204,255,0,0.10),transparent_66%)]" />
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground relative">
                    Active Sensors
                </h3>
                <span className="relative text-xs text-muted-foreground bg-black/20 border border-white/10 px-2 py-1 rounded-full">
                    {items.length} online
                </span>
            </div>
            <div className="mt-5 space-y-3 relative">
                {items.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-3 py-2"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-black/30 border border-white/10 flex items-center justify-center">
                                <item.icon className="w-4 h-4 text-lime" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {item.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {item.type}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-foreground">
                                {item.value}
                            </p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] uppercase tracking-wider bg-success/20 text-success">
                                {item.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
