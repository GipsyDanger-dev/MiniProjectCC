import React from "react";
import GlassSurface from "./GlassSurface";

export default function RoomModel({ room, iot }) {
    const latest = iot?.latestReading;
    const emergency = iot?.data?.emergency_status || "AMAN";
    const settings = iot?.data?.settings || {};

    const gas = Math.round(Number(latest?.gas_value || 0));
    const temp = Math.round(Number(latest?.temperature || 0));
    const humidity = Math.round(Number(latest?.humidity || 0));
    const flameValue = Number(latest?.flame_value || 9999);
    const gasTh = Number(settings.gas_threshold) || 2500;
    const flameTh = Number(settings.flame_threshold) || 500;
    const humidityTh = Number(settings.humidity_threshold) || 70;
    const tempTh = Number(settings.temperature_threshold) || 45;
    const flameDetected = flameValue < flameTh;

    const isDanger = emergency === "BAHAYA";

    const sensors = [
        { label: "MQ-2 Gas", value: `${gas} ppm`, x: "15%", y: "30%", alert: gas > gasTh, color: "#c4b5fd" },
        { label: "DHT22 Temp", value: `${temp}°C`, x: "75%", y: "25%", alert: temp > tempTh, color: "#ff7a17" },
        { label: "DHT22 Humid", value: `${humidity}%`, x: "80%", y: "55%", alert: humidity > humidityTh, color: "#a0c3ec" },
        { label: "KY-026 Flame", value: flameDetected ? "DETECTED" : "CLEAR", x: "60%", y: "70%", alert: flameDetected, color: "#ef4444" },
    ];

    return (
        <GlassSurface className="p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[rgba(33,35,39,0.8)]">
                <div>
                    <p className="text-[10px] sm:text-[11px] uppercase font-normal text-[#7d8187]"
                       style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: "1.2px" }}>
                        3D Room Monitor
                    </p>
                    <p className="text-[10px] sm:text-xs text-[#dadbdf] mt-0.5">{room}</p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[9px] sm:text-[10px] uppercase px-1.5 sm:px-2 py-0.5 rounded-md font-normal"
                        style={{
                            fontFamily: "'Geist Mono', monospace", letterSpacing: "0.8px",
                            background: isDanger ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                            border: `1px solid ${isDanger ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
                            color: isDanger ? "#ef4444" : "#22c55e",
                        }}>
                        {emergency}
                    </span>
                </div>
            </div>

            {/* 3D Room visualization — pure CSS */}
            <div className="relative h-[260px] sm:h-[320px] overflow-hidden" style={{ background: "rgba(15,15,13,0.95)" }}>
                {/* Indigo ambient glow */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: `
                        radial-gradient(circle at 15% 25%, rgba(124,58,237,0.1) 0%, transparent 45%),
                        radial-gradient(circle at 85% 75%, rgba(196,181,253,0.06) 0%, transparent 45%),
                        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 50%)
                    `
                }} />

                {/* CSS 3D Room */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "800px" }}>
                    <div className="relative" style={{ width: "280px", height: "200px", transformStyle: "preserve-3d", transform: "rotateX(15deg) rotateY(-20deg)" }}>
                        {/* Floor */}
                        <div className="absolute inset-x-0 bottom-0" style={{
                            width: "280px", height: "180px",
                            background: "linear-gradient(135deg, #3a3a35 0%, #2a2a28 100%)",
                            transform: "rotateX(70deg) translateZ(-10px)",
                            border: "1px solid rgba(124,58,237,0.15)",
                            boxShadow: "inset 0 0 40px rgba(124,58,237,0.05)"
                        }}>
                            <div className="absolute inset-0 opacity-30" style={{
                                backgroundImage: 'linear-gradient(rgba(124,58,237,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.15) 1px, transparent 1px)',
                                backgroundSize: '30px 30px'
                            }} />
                        </div>

                        {/* Back wall */}
                        <div className="absolute left-0 bottom-0" style={{
                            width: "280px", height: "120px",
                            background: "linear-gradient(to bottom, #4a4a45 0%, #3a3a38 100%)",
                            transform: "translateZ(80px)",
                            border: "1px solid rgba(124,58,237,0.1)"
                        }}>
                            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(124,58,237,0.4)" }} />
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-16 rounded-sm" style={{ background: "#e8e8e0", border: "2px solid #888" }} />
                        </div>

                        {/* Left wall */}
                        <div className="absolute left-0 bottom-0" style={{
                            width: "160px", height: "120px",
                            background: "linear-gradient(to right, #454540 0%, #3a3a38 100%)",
                            transform: "rotateY(70deg) translateZ(-1px)",
                            border: "1px solid rgba(124,58,237,0.1)"
                        }}>
                            <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(124,58,237,0.4)" }} />
                        </div>

                        {/* Desk */}
                        <div className="absolute" style={{
                            left: "20px", bottom: "20px", width: "80px", height: "40px",
                            background: "#5a5a55", transform: "translateZ(40px)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                        }}>
                            <div className="absolute top-1 left-3 w-6 h-3 rounded-sm" style={{ background: "#2a9b45" }} />
                            <div className="absolute top-1 right-3 w-5 h-4 rounded-sm" style={{ background: "#003322", border: "1px solid #00ff88" }} />
                        </div>

                        {/* Exhaust fan */}
                        <div className="absolute" style={{
                            right: "30px", top: "10px", width: "40px", height: "40px",
                            background: "#1e1e1c", border: "2px solid #7c3aed",
                            borderRadius: "4px", transform: "translateZ(79px)"
                        }}>
                            <div className="absolute inset-1 rounded-full border border-gray-500" style={{
                                background: "conic-gradient(from 0deg, #555, #888, #555, #888, #555)"
                            }} />
                        </div>

                        {/* Buzzer */}
                        <div className="absolute" style={{
                            left: "10px", top: "15px", width: "12px", height: "12px",
                            background: "#666", borderRadius: "50%", transform: "translateZ(79px)",
                            boxShadow: isDanger ? "0 0 8px #ef4444" : "none"
                        }} />
                    </div>
                </div>

                {/* Sensor labels */}
                {sensors.map((s, i) => (
                    <div key={i} className="absolute flex flex-col items-center gap-0.5 pointer-events-none" style={{ left: s.x, top: s.y }}>
                        <span className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] uppercase font-normal whitespace-nowrap"
                            style={{
                                fontFamily: "'Geist Mono', monospace", letterSpacing: "0.8px",
                                background: s.alert ? "rgba(239,68,68,0.15)" : "rgba(10,10,10,0.85)",
                                border: `1px solid ${s.alert ? "rgba(239,68,68,0.4)" : "rgba(33,35,39,0.8)"}`,
                                color: s.alert ? "#ef4444" : s.color,
                            }}>
                            {s.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-normal"
                            style={{
                                fontFamily: "'Geist Mono', monospace", letterSpacing: "0.5px",
                                background: "rgba(10,10,10,0.85)", color: "#dadbdf",
                                border: "1px solid rgba(33,35,39,0.8)",
                            }}>
                            {s.value}
                        </span>
                    </div>
                ))}

                {/* Bottom info */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isDanger ? "bg-[#ef4444] animate-pulse" : "bg-[#22c55e]"}`} />
                        <span className="text-[9px] sm:text-[10px] text-[#7d8187] uppercase"
                              style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: "0.5px" }}>
                            {isDanger ? "Emergency Active" : "All Clear"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sensor summary bar */}
            <div className="grid grid-cols-4 border-t border-[rgba(33,35,39,0.8)]">
                {[
                    { label: "Gas", value: `${gas} ppm`, alert: gas > gasTh },
                    { label: "Suhu", value: `${temp}°C`, alert: temp > tempTh },
                    { label: "Humidity", value: `${humidity}%`, alert: humidity > humidityTh },
                    { label: "Flame", value: flameDetected ? "DETECTED" : "CLEAR", alert: flameDetected },
                ].map((s) => (
                    <div key={s.label} className={`px-2 py-2 text-center border-r border-[rgba(33,35,39,0.8)] last:border-r-0 ${s.alert ? "bg-[rgba(239,68,68,0.08)]" : ""}`}>
                        <p className="text-[8px] sm:text-[9px] uppercase text-[#7d8187]"
                           style={{ fontFamily: "'Geist Mono', monospace", letterSpacing: "0.8px" }}>
                            {s.label}
                        </p>
                        <p className={`text-[11px] sm:text-[13px] font-normal mt-0.5 ${s.alert ? "text-[#ef4444]" : "text-white"}`}
                           style={{ fontFamily: "'Geist Mono', monospace" }}>
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>
        </GlassSurface>
    );
}
