import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

// ─── SensorLabel (Html overlay) ───────────────────────────────────────────────

function SensorLabel({ position, label, value, unit, status }) {
    const color = status === "Alert" ? "#dc2626" : "#c45a0a";
    return (
        <Html position={position} center distanceFactor={8} style={{ pointerEvents: "none" }}>
            <div className="flex flex-col items-center gap-0.5">
                <div
                    className="px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] whitespace-nowrap border"
                    style={{
                        backgroundColor: status === "Alert" ? "rgba(220,38,38,0.12)" : "rgba(196,90,10,0.12)",
                        borderColor: status === "Alert" ? "rgba(220,38,38,0.4)" : "rgba(196,90,10,0.4)",
                        color,
                    }}
                >
                    {label}
                </div>
                <div className="px-1.5 py-0.5 text-[10px] font-medium bg-[#1a1a18] text-[#f4f2ec] whitespace-nowrap">
                    {value}
                    {unit}
                </div>
            </div>
        </Html>
    );
}

// ─── FanBlades ────────────────────────────────────────────────────────────────

function FanBlades({ fanSpeed, fanStatus, position = [0, 0, 0] }) {
    const groupRef = useRef();
    const currentSpeed = useRef(0);
    const bladeMatRef = useRef();

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        // Map fan status to rotation speed (rad/s)
        const speedMap = { LOW: 5, MEDIUM: 12, HIGH: 22 };
        const target = fanStatus !== "OFF" ? (speedMap[fanStatus] || (fanSpeed > 0 ? fanSpeed / 5 : 0)) : 0;
        currentSpeed.current += (target - currentSpeed.current) * 0.08;
        groupRef.current.rotation.y += currentSpeed.current * delta;

        // Glow when spinning
        if (bladeMatRef.current) {
            bladeMatRef.current.emissiveIntensity = currentSpeed.current > 0.5 ? 0.3 : 0;
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {[0, 1, 2, 3].map((i) => (
                <mesh key={i} rotation={[0, (Math.PI / 2) * i, 0.15]}>
                    <boxGeometry args={[0.6, 0.015, 0.12]} />
                    <meshStandardMaterial
                        ref={i === 0 ? bladeMatRef : undefined}
                        color="#aaa"
                        emissive="#ff8800"
                        emissiveIntensity={0}
                        metalness={0.7}
                        roughness={0.3}
                    />
                </mesh>
            ))}
            <mesh>
                <cylinderGeometry args={[0.06, 0.06, 0.06, 16]} />
                <meshStandardMaterial color="#777" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
    );
}

// ─── EmergencyEffects ─────────────────────────────────────────────────────────

function EmergencyEffects({ emergency }) {
    const pointLightRef = useRef();
    const timeRef = useRef(0);

    useFrame((_, delta) => {
        timeRef.current += delta;
        if (pointLightRef.current) {
            if (emergency === "BAHAYA") {
                const pulse = Math.sin(timeRef.current * 4) * 0.5 + 0.5;
                pointLightRef.current.intensity = 3 + pulse * 4;
                pointLightRef.current.color.setHSL(0, 0.9, 0.5 + pulse * 0.2);
            } else {
                pointLightRef.current.intensity = 2;
                pointLightRef.current.color.setHSL(0.07, 0.6, 0.6);
            }
        }
    });

    return (
        <>
            {/* Bright ambient so everything is visible */}
            <ambientLight intensity={emergency === "BAHAYA" ? 1.0 : 1.8} color={emergency === "BAHAYA" ? "#ff8888" : "#fffaf0"} />

            {/* Main directional — warm daylight feel */}
            <directionalLight position={[5, 8, 5]} intensity={2.5} castShadow color="#fff5e6" />
            {/* Fill light from opposite side */}
            <directionalLight position={[-4, 6, -3]} intensity={1.2} color="#e8e0d0" />
            {/* Top-down fill */}
            <directionalLight position={[0, 10, 0]} intensity={1.0} color="#ffffff" />

            {/* Ceiling center point light */}
            <pointLight ref={pointLightRef} position={[0, 2.8, 0]} distance={20} decay={1.5} />

            {/* Extra corner lights so no dark spots */}
            <pointLight position={[-2.5, 2.5, 2]} intensity={1.5} distance={10} color="#fff8ee" />
            <pointLight position={[2.5, 2.5, 2]} intensity={1.5} distance={10} color="#fff8ee" />
            <pointLight position={[0, 2.5, -2]} intensity={1.5} distance={10} color="#fff8ee" />

            {/* Emergency light fixture on ceiling */}
            <mesh position={[0, 2.92, 0]}>
                <boxGeometry args={[0.3, 0.04, 0.1]} />
                <meshStandardMaterial
                    color={emergency === "BAHAYA" ? "#ff2200" : "#22aa44"}
                    emissive={emergency === "BAHAYA" ? "#ff2200" : "#22aa44"}
                    emissiveIntensity={emergency === "BAHAYA" ? 3 : 1.5}
                />
            </mesh>

            {emergency === "BAHAYA" && (
                <>
                    <pointLight position={[0, 0.5, 0]} intensity={3} color="#ff2200" distance={10} decay={2} />
                    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[3, 32]} />
                        <meshBasicMaterial color="#ff0000" transparent opacity={0.12} />
                    </mesh>
                </>
            )}
        </>
    );
}

// ─── Room (floor, walls, ceiling beams, baseboards) ───────────────────────────

function Room() {
    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[6, 5]} />
                <meshStandardMaterial color="#4a4a42" roughness={0.85} metalness={0.1} />
            </mesh>
            <gridHelper args={[6, 12, "#666", "#555"]} position={[0, 0.005, 0]} />

            {/* Back wall */}
            <mesh position={[0, 1.5, -2.5]} castShadow receiveShadow>
                <boxGeometry args={[6, 3, 0.1]} />
                <meshStandardMaterial color="#5a5a52" roughness={0.8} />
            </mesh>
            {/* Left wall */}
            <mesh position={[-3, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 3, 5]} />
                <meshStandardMaterial color="#5a5a52" roughness={0.8} />
            </mesh>
            {/* Right wall */}
            <mesh position={[3, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 3, 5]} />
                <meshStandardMaterial color="#5a5a52" roughness={0.8} />
            </mesh>

            {/* Baseboard trim — orange accent */}
            <mesh position={[0, 0.04, -2.44]}>
                <boxGeometry args={[5.8, 0.08, 0.02]} />
                <meshStandardMaterial color="#c45a0a" emissive="#c45a0a" emissiveIntensity={0.3} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[-2.94, 0.04, 0]}>
                <boxGeometry args={[0.02, 0.08, 4.8]} />
                <meshStandardMaterial color="#c45a0a" emissive="#c45a0a" emissiveIntensity={0.3} roughness={0.5} metalness={0.3} />
            </mesh>
            <mesh position={[2.94, 0.04, 0]}>
                <boxGeometry args={[0.02, 0.08, 4.8]} />
                <meshStandardMaterial color="#c45a0a" emissive="#c45a0a" emissiveIntensity={0.3} roughness={0.5} metalness={0.3} />
            </mesh>

            {/* Ceiling beams — Z direction */}
            {[-2, 0, 2].map((x) => (
                <mesh key={`bz-${x}`} position={[x, 2.96, 0]}>
                    <boxGeometry args={[0.08, 0.08, 5]} />
                    <meshStandardMaterial color="#6a6a62" metalness={0.5} roughness={0.4} />
                </mesh>
            ))}
            {/* Ceiling beams — X direction */}
            {[-1.5, 1.5].map((z) => (
                <mesh key={`bx-${z}`} position={[0, 2.96, z]}>
                    <boxGeometry args={[6, 0.08, 0.08]} />
                    <meshStandardMaterial color="#6a6a62" metalness={0.5} roughness={0.4} />
                </mesh>
            ))}

            {/* Wall edge highlights */}
            <mesh position={[0, 3, -2.44]}>
                <boxGeometry args={[6, 0.02, 0.02]} />
                <meshStandardMaterial color="#6a6a62" metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[-2.94, 3, 0]}>
                <boxGeometry args={[0.02, 0.02, 5]} />
                <meshStandardMaterial color="#6a6a62" metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[2.94, 3, 0]}>
                <boxGeometry args={[0.02, 0.02, 5]} />
                <meshStandardMaterial color="#6a6a62" metalness={0.4} roughness={0.5} />
            </mesh>
        </group>
    );
}

// ─── Workstation (desk + ESP32 + OLED) ────────────────────────────────────────

function Workstation() {
    const ledRef = useRef();

    useFrame(({ clock }) => {
        if (ledRef.current) {
            ledRef.current.emissiveIntensity = Math.sin(clock.elapsedTime * 2) * 0.5 + 0.5;
        }
    });

    const legOffsets = [
        [-0.65, 0.375, -0.3],
        [0.65, 0.375, -0.3],
        [-0.65, 0.375, 0.3],
        [0.65, 0.375, 0.3],
    ];

    return (
        <group position={[-1.5, 0, 0.5]}>
            {/* Desktop surface */}
            <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[1.4, 0.05, 0.7]} />
                <meshStandardMaterial color="#6a6a62" roughness={0.7} metalness={0.2} />
            </mesh>
            {/* Legs */}
            {legOffsets.map((pos, i) => (
                <mesh key={i} position={pos}>
                    <boxGeometry args={[0.05, 0.75, 0.05]} />
                    <meshStandardMaterial color="#555550" roughness={0.8} metalness={0.2} />
                </mesh>
            ))}

            {/* ESP32 dev board */}
            <mesh position={[-0.2, 0.78, 0]}>
                <boxGeometry args={[0.2, 0.015, 0.1]} />
                <meshStandardMaterial color="#2a9b45" roughness={0.6} metalness={0.1} />
            </mesh>
            {/* ESP32 chip */}
            <mesh position={[-0.2, 0.795, 0]}>
                <boxGeometry args={[0.06, 0.008, 0.06]} />
                <meshStandardMaterial color="#444" roughness={0.5} metalness={0.3} />
            </mesh>
            {/* LED indicators */}
            <mesh position={[-0.26, 0.795, -0.03]}>
                <boxGeometry args={[0.015, 0.008, 0.015]} />
                <meshStandardMaterial ref={ledRef} color="#00ff44" emissive="#00ff44" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-0.23, 0.795, -0.03]}>
                <boxGeometry args={[0.015, 0.008, 0.015]} />
                <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={0.3} />
            </mesh>

            {/* OLED display frame */}
            <mesh position={[0.15, 0.82, 0]} rotation={[-0.15, 0, 0]}>
                <boxGeometry args={[0.14, 0.1, 0.012]} />
                <meshStandardMaterial color="#111" roughness={0.9} metalness={0.1} />
            </mesh>
            {/* OLED screen */}
            <mesh position={[0.15, 0.82, 0.008]} rotation={[-0.15, 0, 0]}>
                <planeGeometry args={[0.11, 0.07]} />
                <meshStandardMaterial color="#003322" emissive="#00ff88" emissiveIntensity={0.4} />
            </mesh>
        </group>
    );
}

// ─── SensorModule (parametric wall-mounted sensor) ────────────────────────────

function SensorModule({ position, rotation, bodyColor = "#2a5a2a", capColor, capRadius }) {
    return (
        <group position={position} rotation={rotation}>
            {/* Mounting bracket */}
            <mesh position={[0, -0.045, 0]}>
                <boxGeometry args={[0.14, 0.01, 0.05]} />
                <meshStandardMaterial color="#6a6a62" roughness={0.7} />
            </mesh>
            {/* PCB body */}
            <mesh castShadow>
                <boxGeometry args={[0.12, 0.08, 0.04]} />
                <meshStandardMaterial color={bodyColor} roughness={0.6} metalness={0.1} />
            </mesh>
            {/* Sensor cap (cylindrical, e.g. MQ-2) */}
            {capRadius && (
                <mesh position={[0, 0, 0.035]}>
                    <cylinderGeometry args={[capRadius, capRadius, 0.03, 12]} />
                    <meshStandardMaterial color={capColor || "#555"} roughness={0.4} metalness={0.5} />
                </mesh>
            )}
            {/* Pin headers */}
            <mesh position={[0, -0.04, 0.025]}>
                <boxGeometry args={[0.08, 0.015, 0.005]} />
                <meshStandardMaterial color="#d4a030" metalness={0.8} roughness={0.3} />
            </mesh>
        </group>
    );
}

// ─── ExhaustFan (housing + blades) ────────────────────────────────────────────

function ExhaustFan({ fanSpeed, fanStatus }) {
    return (
        <group position={[1.8, 2.5, -2.44]}>
            {/* Housing rim */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.04]}>
                <cylinderGeometry args={[0.38, 0.38, 0.03, 24]} />
                <meshStandardMaterial color="#666" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Housing body */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.35, 0.35, 0.12, 24]} />
                <meshStandardMaterial color="#777" metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Guard grill (cross) */}
            <mesh position={[0, 0, 0.065]}>
                <boxGeometry args={[0.6, 0.015, 0.005]} />
                <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.065]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.6, 0.015, 0.005]} />
                <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Fan blades */}
            <FanBlades fanSpeed={fanSpeed} fanStatus={fanStatus} position={[0, 0, 0.03]} />
        </group>
    );
}

// ─── Buzzer ───────────────────────────────────────────────────────────────────

function Buzzer({ active, position }) {
    const emissiveRef = useRef();

    useFrame(({ clock }) => {
        if (emissiveRef.current) {
            emissiveRef.current.emissiveIntensity = active ? (Math.sin(clock.elapsedTime * 6) * 0.5 + 0.5) * 2 : 0;
        }
    });

    return (
        <group position={position}>
            {/* Body */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
                <meshStandardMaterial color="#666" metalness={0.5} roughness={0.6} />
            </mesh>
            {/* Sound holes */}
            {[[-0.012, 0.012], [0.012, 0.012], [0, -0.012]].map(([ox, oy], i) => (
                <mesh key={i} position={[0.032, ox, oy]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.003, 8]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            ))}
            {/* Active indicator LED */}
            <mesh position={[0.032, 0, 0]}>
                <sphereGeometry args={[0.008, 8, 8]} />
                <meshStandardMaterial
                    ref={emissiveRef}
                    color="#ff2200"
                    emissive="#ff2200"
                    emissiveIntensity={0}
                />
            </mesh>
        </group>
    );
}

// ─── CableRun (tube connecting two points) ────────────────────────────────────

function CableRun({ points, color = "#333" }) {
    const curve = useMemo(() => {
        const vecs = points.map((p) => new THREE.Vector3(...p));
        return new THREE.CatmullRomCurve3(vecs);
    }, [points]);

    return (
        <mesh>
            <tubeGeometry args={[curve, 20, 0.008, 6, false]} />
            <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
    );
}

// ─── ServerRack ───────────────────────────────────────────────────────────────

function ServerRack() {
    return (
        <group position={[2, 0, -1.5]}>
            {/* Main cabinet */}
            <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[0.6, 2, 0.5]} />
                <meshStandardMaterial color="#4a4a42" roughness={0.8} metalness={0.2} />
            </mesh>
            {/* Shelves */}
            {[0.4, 0.9, 1.4, 1.8].map((y) => (
                <mesh key={y} position={[0, y, 0.01]}>
                    <boxGeometry args={[0.56, 0.02, 0.46]} />
                    <meshStandardMaterial color="#5a5a52" roughness={0.7} metalness={0.3} />
                </mesh>
            ))}
            {/* Server units on shelves */}
            {[0.55, 1.05, 1.55].map((y) => (
                <mesh key={y} position={[0, y, 0]}>
                    <boxGeometry args={[0.5, 0.08, 0.4]} />
                    <meshStandardMaterial color="#3a3a35" roughness={0.6} metalness={0.4} />
                </mesh>
            ))}
            {/* LED indicators on server units */}
            {[0.55, 1.05, 1.55].map((y) => (
                <mesh key={`led-${y}`} position={[0.22, y + 0.02, 0.21]}>
                    <boxGeometry args={[0.008, 0.008, 0.003]} />
                    <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={0.6} />
                </mesh>
            ))}
            {/* Ventilation slots */}
            <mesh position={[0, 1, -0.255]}>
                <boxGeometry args={[0.5, 1.6, 0.005]} />
                <meshStandardMaterial color="#1a1a18" roughness={0.9} />
            </mesh>
        </group>
    );
}

// ─── OfficeScene (orchestrator) ───────────────────────────────────────────────

const cablePoints = {
    mq2: [[-2.95, 1.8, -0.5], [-2.95, 0.3, -0.5], [-2.95, 0.3, 0.5], [-1.5, 0.78, 0.5]],
    ky026: [[0.5, 1.8, -2.45], [0.5, 0.3, -2.45], [-1.0, 0.3, -2.45], [-1.5, 0.3, 0.5], [-1.5, 0.78, 0.5]],
    dht22: [[2.95, 1.8, 0.5], [2.95, 0.3, 0.5], [-1.5, 0.3, 0.5], [-1.5, 0.78, 0.5]],
};

function OfficeScene({ iot }) {
    const latest = iot?.latestReading;
    const emergency = iot?.data?.emergency_status || "AMAN";
    const actuator = iot?.data?.device_actuator;
    const fanStatus = actuator?.fan_status || "OFF";
    const fanSpeed = actuator?.fan_speed || 0;
    const buzzerOn = actuator?.alarm_status === "ON";
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

    return (
        <>
            <color attach="background" args={["#2a2a26"]} />
            <EmergencyEffects emergency={emergency} />

            <group>
                <Room />
                <Workstation />
                <ServerRack />

                {/* MQ-2 Gas sensor — left wall */}
                <SensorModule
                    position={[-2.95, 1.8, -0.5]}
                    rotation={[0, Math.PI / 2, 0]}
                    bodyColor="#4a8a4a"
                    capColor="#999"
                    capRadius={0.03}
                />

                {/* KY-026 Flame sensor — back wall */}
                <SensorModule
                    position={[0.5, 1.8, -2.45]}
                    rotation={[0, 0, 0]}
                    bodyColor="#8a5a5a"
                />

                {/* DHT22 Temp/Humidity — right wall */}
                <SensorModule
                    position={[2.95, 1.8, 0.5]}
                    rotation={[0, -Math.PI / 2, 0]}
                    bodyColor="#ffffff"
                />

                {/* Exhaust fan — back wall upper */}
                <ExhaustFan fanSpeed={fanSpeed} fanStatus={fanStatus} />

                {/* Buzzer — left wall */}
                <Buzzer active={buzzerOn} position={[-2.95, 2.2, -1.5]} />

                {/* Cable runs */}
                <CableRun points={cablePoints.mq2} color="#8a7060" />
                <CableRun points={cablePoints.ky026} color="#8a5050" />
                <CableRun points={cablePoints.dht22} color="#506080" />
            </group>

            {/* Sensor labels */}
            <SensorLabel position={[-2.95, 2.2, -0.5]} label="MQ-2 Gas" value={gas} unit="ppm" status={gas > gasTh ? "Alert" : "Normal"} />
            <SensorLabel position={[0.5, 2.2, -2.45]} label="KY-026 Flame" value={flameDetected ? "DETECTED" : "CLEAR"} unit="" status={flameDetected ? "Alert" : "Normal"} />
            <SensorLabel position={[2.95, 2.2, 0.5]} label="DHT22 Suhu" value={temp} unit="°C" status={temp > tempTh ? "Alert" : "Normal"} />
            <SensorLabel position={[2.95, 2.5, 0.5]} label="DHT22 Humidity" value={humidity} unit="%" status={humidity > humidityTh ? "Alert" : "Normal"} />

            <OrbitControls
                target={[0, 1.2, 0]}
                enablePan={false}
                minDistance={3}
                maxDistance={8}
                minPolarAngle={0.3}
                maxPolarAngle={Math.PI / 2.2}
                autoRotate={false}
            />
        </>
    );
}

// ─── RoomModel (default export) ───────────────────────────────────────────────

export default function RoomModel({ room, iot }) {
    const emergency = iot?.data?.emergency_status || "AMAN";
    const actuator = iot?.data?.device_actuator;
    const fanStatus = actuator?.fan_status || "OFF";
    const fanSpeed = actuator?.fan_speed || 0;

    const latest = iot?.latestReading;
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

    return (
        <div className="bg-surface2 border border-edge">
            <div className="flex items-center justify-between px-3 py-2 border-b border-edge">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.10em] text-ink2">3D Room Monitor</p>
                    <p className="text-[10px] text-ink3 mt-0.5">{room}</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <span
                        className={`text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border ${
                            fanStatus !== "OFF"
                                ? "text-accent border-accent bg-accent/10"
                                : "text-ink3 border-edge2 bg-surface3"
                        }`}
                    >
                        Fan: {fanStatus}
                        {fanSpeed ? ` ${fanSpeed}%` : ""}
                    </span>
                    <span
                        className={`text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border ${
                            emergency === "BAHAYA"
                                ? "text-danger border-danger bg-danger/10"
                                : "text-success border-success bg-success/10"
                        }`}
                    >
                        {emergency}
                    </span>
                </div>
            </div>

            <div className="h-[320px] relative bg-[#2a2a26]">
                <Canvas
                    camera={{ position: [4, 3, 4], fov: 48 }}
                    dpr={[1, 2]}
                    shadows
                    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
                >
                    <Suspense fallback={null}>
                        <OfficeScene iot={iot} />
                    </Suspense>
                </Canvas>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-1.5">
                        <div
                            className={`w-1.5 h-1.5 ${
                                emergency === "BAHAYA" ? "bg-danger animate-pulse" : "bg-success"
                            }`}
                        />
                        <span className="text-[10px] text-ink3 uppercase tracking-[0.06em]">
                            {emergency === "BAHAYA" ? "Emergency Active" : "All Clear"}
                        </span>
                    </div>
                    <span className="text-[10px] text-ink3 uppercase tracking-[0.06em]">
                        Drag to rotate · Scroll to zoom
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-4 border-t border-edge">
                {[
                    { label: "Gas", value: `${gas} ppm`, alert: gas > gasTh },
                    { label: "Suhu", value: `${temp}°C`, alert: temp > tempTh },
                    { label: "Humidity", value: `${humidity}%`, alert: humidity > humidityTh },
                    {
                        label: "Flame",
                        value: flameDetected ? "DETECTED" : "CLEAR",
                        alert: flameDetected,
                    },
                ].map((s) => (
                    <div
                        key={s.label}
                        className={`px-2 py-2 text-center border-r border-edge last:border-r-0 ${
                            s.alert ? "bg-danger/8" : ""
                        }`}
                    >
                        <p className="text-[9px] uppercase tracking-[0.08em] text-ink3">{s.label}</p>
                        <p
                            className={`text-[13px] font-medium mt-0.5 ${
                                s.alert ? "text-danger" : "text-ink"
                            }`}
                        >
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
