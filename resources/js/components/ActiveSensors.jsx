import React from "react";

export default function ActiveSensors({ items }) {
    return (
        <div className="bg-surface2 border border-edge">
            <div className="flex items-center justify-between px-3 py-2 border-b border-edge">
                <p className="text-[10px] font-medium uppercase tracking-[0.10em] text-ink2">
                    Sensor Units
                </p>
                <span className="text-[10px] uppercase tracking-[0.08em] text-success">
                    {items.length}/{items.length} Online
                </span>
            </div>
            <div className="px-3">
                {items.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between py-2 border-b border-edge last:border-b-0"
                    >
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[12px] font-medium text-ink2">
                                {item.name}
                            </p>
                            <p className="text-[9px] uppercase tracking-[0.08em] text-ink3">
                                {item.type}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[15px] font-medium text-ink2 tabular-nums">
                                {item.value}
                            </span>
                            <span className={`text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border ${
                                item.status === "Alert"
                                    ? "text-danger border-danger bg-danger/10"
                                    : "text-success border-success bg-success/10"
                            }`}>
                                {item.status === "Alert" ? "ALERT" : "NORMAL"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
