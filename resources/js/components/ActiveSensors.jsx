import React from "react";

export default function ActiveSensors({ items }) {
    return (
        <div className="bg-surface2 border border-edge rounded-lg shadow-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
                <p className="text-[12px] font-medium text-ink2">
                    Sensor Units
                </p>
                <span className="text-[11px] text-success">
                    {items.length}/{items.length} Online
                </span>
            </div>
            <div className="px-4">
                {items.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center justify-between py-2.5 border-b border-edge last:border-b-0"
                    >
                        <div className="flex flex-col gap-0.5">
                            <p className="text-[13px] font-medium text-ink">
                                {item.name}
                            </p>
                            <p className="text-[10px] text-ink3">
                                {item.type}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[15px] font-semibold text-ink tabular-nums">
                                {item.value}
                            </span>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                                item.status === "Alert"
                                    ? "text-danger bg-danger/10"
                                    : "text-success bg-success/10"
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
