import React, { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

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

function FanBlades({ fanSpeed, fanStatus, position = [0, 0, 0] }) {
    const groupRef = useRef();
    const currentSpeed = useRef(0);

    const BLADE_COUNT = 6;
    const bladeMat = useRef();

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        const speedMap = { LOW: 3, MEDIUM: 7, HIGH: 14 };
        const target = fanStatus !== "OFF" ? (speedMap[fanStatus] || (fanSpeed > 0 ? fanSpeed / 8 : 0)) : 0;
        currentSpeed.current += (target - currentSpeed.current) * 0.06;
        groupRef.current.rotation.z += currentSpeed.current * delta;
    });

    return (
        <group ref={groupRef} position={position}>
            {Array.from({ length: BLADE_COUNT }).map((_, i) => {
                const angle = (i / BLADE_COUNT) * Math.PI * 2;
                return (
                    <mesh
                        key={i}
                        position={[Math.cos(angle) * 0.28, Math.sin(angle) * 0.28, 0]}
                        rotation={[0, 0, angle + Math.PI / 6]}
                    >
                        <boxGeometry args={[0.48, 0.10, 0.02]} />
                        <meshStandardMaterial
                            ref={i === 0 ? bladeMat : undefined}
                            color="#999"
                            emissive="#c45a0a"
                            emissiveIntensity={0}
                            roughness={0.4}
                            metalness={0.8}
                        />
                    </mesh>
                );
            })}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.09, 0.09, 0.06, 12]} />
                <meshStandardMaterial color="#c45a0a" metalness={0.95} roughness={0.3} />
            </mesh>
        </group>
    );
}

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
            <ambientLight intensity={emergency === "BAHAYA" ? 1.0 : 1.8} color={emergency === "BAHAYA" ? "#ff8888" : "#fffaf0"} />

            <directionalLight position={[5, 8, 5]} intensity={2.5} castShadow color="#fff5e6" />
            <directionalLight position={[-4, 6, -3]} intensity={1.2} color="#e8e0d0" />
            <directionalLight position={[0, 10, 0]} intensity={1.0} color="#ffffff" />

            <pointLight ref={pointLightRef} position={[0, 2.8, 0]} distance={20} decay={1.5} />

            {/* Extra corner lights so no dark spots */}
            <pointLight position={[-2.5, 2.5, 2]} intensity={1.5} distance={10} color="#fff8ee" />
            <pointLight position={[2.5, 2.5, 2]} intensity={1.5} distance={10} color="#fff8ee" />
            <pointLight position={[0, 2.5, -2]} intensity={1.5} distance={10} color="#fff8ee" />

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

function Room() {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[6, 5]} />
                <meshStandardMaterial color="#4a4a42" roughness={0.85} metalness={0.1} />
            </mesh>
            <gridHelper args={[6, 12, "#666", "#555"]} position={[0, 0.005, 0]} />

            <mesh position={[0, 1.5, -2.5]} castShadow receiveShadow>
                <boxGeometry args={[6, 3, 0.1]} />
                <meshStandardMaterial color="#5a5a52" roughness={0.8} />
            </mesh>
            <mesh position={[-3, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 3, 5]} />
                <meshStandardMaterial color="#5a5a52" roughness={0.8} />
            </mesh>
            <mesh position={[3, 1.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.1, 3, 5]} />
                <meshStandardMaterial color="#5a5a52" roughness={0.8} />
            </mesh>

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

            {[-2, 0, 2].map((x) => (
                <mesh key={`bz-${x}`} position={[x, 2.96, 0]}>
                    <boxGeometry args={[0.08, 0.08, 5]} />
                    <meshStandardMaterial color="#6a6a62" metalness={0.5} roughness={0.4} />
                </mesh>
            ))}
            {[-1.5, 1.5].map((z) => (
                <mesh key={`bx-${z}`} position={[0, 2.96, z]}>
                    <boxGeometry args={[6, 0.08, 0.08]} />
                    <meshStandardMaterial color="#6a6a62" metalness={0.5} roughness={0.4} />
                </mesh>
            ))}

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
            <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[1.4, 0.05, 0.7]} />
                <meshStandardMaterial color="#6a6a62" roughness={0.7} metalness={0.2} />
            </mesh>
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
            <mesh position={[0.15, 0.82, 0.008]} rotation={[-0.15, 0, 0]}>
                <planeGeometry args={[0.11, 0.07]} />
                <meshStandardMaterial color="#003322" emissive="#00ff88" emissiveIntensity={0.4} />
            </mesh>
        </group>
    );
}

function SensorModule({ position, rotation, bodyColor = "#2a5a2a", capColor, capRadius }) {
    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, -0.045, 0]}>
                <boxGeometry args={[0.14, 0.01, 0.05]} />
                <meshStandardMaterial color="#6a6a62" roughness={0.7} />
            </mesh>
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
            <mesh position={[0, -0.04, 0.025]}>
                <boxGeometry args={[0.08, 0.015, 0.005]} />
                <meshStandardMaterial color="#d4a030" metalness={0.8} roughness={0.3} />
            </mesh>
        </group>
    );
}

function ExhaustFan({ fanSpeed, fanStatus }) {
    const grillePositions = [-2, -1, 0, 1, 2];
    return (
        <group position={[-2, 2.3, -2.44]}>
            <mesh>
                <boxGeometry args={[1.4, 1.4, 0.25]} />
                <meshStandardMaterial color="#1e1e1c" roughness={0.7} metalness={0.8} />
            </mesh>

            {[
                { size: [1.4, 0.06, 0.28], pos: [0, 0.67, 0] },
                { size: [1.4, 0.06, 0.28], pos: [0, -0.67, 0] },
                { size: [0.06, 1.4, 0.28], pos: [0.67, 0, 0] },
                { size: [0.06, 1.4, 0.28], pos: [-0.67, 0, 0] },
            ].map(({ size, pos }, i) => (
                <mesh key={`frame-${i}`} position={pos}>
                    <boxGeometry args={size} />
                    <meshStandardMaterial color="#c45a0a" roughness={0.4} metalness={0.9} />
                </mesh>
            ))}

            <FanBlades fanSpeed={fanSpeed} fanStatus={fanStatus} position={[0, 0, 0.14]} />

            {/* Wire guard — behind blades */}
            {grillePositions.map((i) => (
                <React.Fragment key={`grille-${i}`}>
                    <mesh position={[0, i * 0.22, 0.17]}>
                        <boxGeometry args={[1.2, 0.02, 0.005]} />
                        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.8} transparent opacity={0.5} />
                    </mesh>
                    <mesh position={[i * 0.22, 0, 0.17]}>
                        <boxGeometry args={[0.02, 1.2, 0.005]} />
                        <meshStandardMaterial color="#555" roughness={0.5} metalness={0.8} transparent opacity={0.5} />
                    </mesh>
                </React.Fragment>
            ))}
        </group>
    );
}

function FilingCabinet({ position }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[0.45, 1, 0.4]} />
                <meshStandardMaterial color="#4a4a42" roughness={0.7} metalness={0.3} />
            </mesh>
            {[0.25, 0.55, 0.85].map((y) => (
                <mesh key={y} position={[0, y, 0.21]}>
                    <boxGeometry args={[0.15, 0.02, 0.02]} />
                    <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
                </mesh>
            ))}
        </group>
    );
}

function Whiteboard({ position }) {
    return (
        <group position={position}>
            <mesh>
                <boxGeometry args={[1.6, 1, 0.04]} />
                <meshStandardMaterial color="#e8e8e0" roughness={0.3} metalness={0.05} />
            </mesh>
            {[
                { size: [1.64, 0.03, 0.05], pos: [0, 0.5, 0] },
                { size: [1.64, 0.03, 0.05], pos: [0, -0.5, 0] },
                { size: [0.03, 1, 0.05], pos: [0.8, 0, 0] },
                { size: [0.03, 1, 0.05], pos: [-0.8, 0, 0] },
            ].map(({ size, pos }, i) => (
                <mesh key={i} position={pos}>
                    <boxGeometry args={size} />
                    <meshStandardMaterial color="#888" metalness={0.6} roughness={0.4} />
                </mesh>
            ))}
            <mesh position={[0, -0.55, 0.05]}>
                <boxGeometry args={[0.8, 0.04, 0.08]} />
                <meshStandardMaterial color="#777" metalness={0.7} roughness={0.3} />
            </mesh>
        </group>
    );
}

function FireExtinguisher({ position }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
                <meshStandardMaterial color="#cc2200" roughness={0.6} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0.42, 0.04]}>
                <boxGeometry args={[0.08, 0.03, 0.03]} />
                <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0.04, 0.42, 0]} rotation={[0, 0, -0.4]}>
                <cylinderGeometry args={[0.015, 0.01, 0.1, 8]} />
                <meshStandardMaterial color="#333" metalness={0.7} roughness={0.4} />
            </mesh>
        </group>
    );
}

function Monitor({ position }) {
    const screenRef = useRef();
    useFrame(({ clock }) => {
        if (screenRef.current) {
            screenRef.current.emissiveIntensity = 0.3 + Math.sin(clock.elapsedTime * 0.5) * 0.1;
        }
    });
    return (
        <group position={position}>
            <mesh position={[0, 0.12, 0]} rotation={[-0.1, 0, 0]}>
                <boxGeometry args={[0.45, 0.28, 0.015]} />
                <meshStandardMaterial color="#111" roughness={0.9} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.12, 0.009]} rotation={[-0.1, 0, 0]}>
                <planeGeometry args={[0.4, 0.24]} />
                <meshStandardMaterial ref={screenRef} color="#002244" emissive="#0066cc" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0, -0.02, 0.02]}>
                <boxGeometry args={[0.06, 0.04, 0.06]} />
                <meshStandardMaterial color="#444" metalness={0.7} roughness={0.4} />
            </mesh>
        </group>
    );
}

function Buzzer({ active, position }) {
    const emissiveRef = useRef();

    useFrame(({ clock }) => {
        if (emissiveRef.current) {
            emissiveRef.current.emissiveIntensity = active ? (Math.sin(clock.elapsedTime * 6) * 0.5 + 0.5) * 2 : 0;
        }
    });

    return (
        <group position={position}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 0.06, 16]} />
                <meshStandardMaterial color="#666" metalness={0.5} roughness={0.6} />
            </mesh>
            {[[-0.012, 0.012], [0.012, 0.012], [0, -0.012]].map(([ox, oy], i) => (
                <mesh key={i} position={[0.032, ox, oy]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.003, 8]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            ))}
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

function ServerRack() {
    return (
        <group position={[2, 0, -1.5]}>
            <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[0.6, 2, 0.5]} />
                <meshStandardMaterial color="#4a4a42" roughness={0.8} metalness={0.2} />
            </mesh>
            {[0.4, 0.9, 1.4, 1.8].map((y) => (
                <mesh key={y} position={[0, y, 0.01]}>
                    <boxGeometry args={[0.56, 0.02, 0.46]} />
                    <meshStandardMaterial color="#5a5a52" roughness={0.7} metalness={0.3} />
                </mesh>
            ))}
            {[0.55, 1.05, 1.55].map((y) => (
                <mesh key={y} position={[0, y, 0]}>
                    <boxGeometry args={[0.5, 0.08, 0.4]} />
                    <meshStandardMaterial color="#3a3a35" roughness={0.6} metalness={0.4} />
                </mesh>
            ))}
            {[0.55, 1.05, 1.55].map((y) => (
                <mesh key={`led-${y}`} position={[0.22, y + 0.02, 0.21]}>
                    <boxGeometry args={[0.008, 0.008, 0.003]} />
                    <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={0.6} />
                </mesh>
            ))}
            <mesh position={[0, 1, -0.255]}>
                <boxGeometry args={[0.5, 1.6, 0.005]} />
                <meshStandardMaterial color="#1a1a18" roughness={0.9} />
            </mesh>
        </group>
    );
}

const cablePoints = {
    mq2: [[-2.95, 1.8, -0.5], [-2.95, 0.3, -0.5], [-2.95, 0.3, 0.5], [-1.5, 0.78, 0.5]],
    ky026: [[2, 1.5, -2.45], [2, 0.3, -2.45], [-1.0, 0.3, -2.45], [-1.5, 0.3, 0.5], [-1.5, 0.78, 0.5]],
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
                <FilingCabinet position={[2.5, 0, 1.2]} />
                <Whiteboard position={[1.5, 1.8, -2.44]} />
                <FireExtinguisher position={[2.7, 0, -2.2]} />
                <Monitor position={[-1.5, 0.78, 0.3]} />

                {/* MQ-2 Gas sensor — left wall */}
                <SensorModule
                    position={[-2.95, 1.8, -0.5]}
                    rotation={[0, Math.PI / 2, 0]}
                    bodyColor="#4a8a4a"
                    capColor="#999"
                    capRadius={0.03}
                />

                {/* KY-026 Flame sensor — back wall right side */}
                <SensorModule
                    position={[2, 1.5, -2.45]}
                    rotation={[0, 0, 0]}
                    bodyColor="#8a5a5a"
                />

                {/* DHT22 Temp/Humidity — right wall */}
                <SensorModule
                    position={[2.95, 1.8, 0.5]}
                    rotation={[0, -Math.PI / 2, 0]}
                    bodyColor="#ffffff"
                />

                <ExhaustFan fanSpeed={fanSpeed} fanStatus={fanStatus} />

                <Buzzer active={buzzerOn} position={[-2.95, 2.3, -1.5]} />

                <CableRun points={cablePoints.mq2} color="#8a7060" />
                <CableRun points={cablePoints.ky026} color="#8a5050" />
                <CableRun points={cablePoints.dht22} color="#506080" />
            </group>

            <SensorLabel position={[-2.95, 2.4, -0.5]} label="MQ-2 Gas" value={gas} unit=" ppm" status={gas > gasTh ? "Alert" : "Normal"} />
            <SensorLabel position={[2, 2.0, -2.45]} label="KY-026 Flame" value={flameDetected ? "DETECTED" : "CLEAR"} unit="" status={flameDetected ? "Alert" : "Normal"} />
            <SensorLabel position={[2.95, 2.3, 0.5]} label="DHT22 Temp" value={`${temp}`} unit="°C" status={temp > tempTh ? "Alert" : "Normal"} />
            <SensorLabel position={[2.95, 1.6, 0.5]} label="DHT22 Humid" value={`${humidity}`} unit="%" status={humidity > humidityTh ? "Alert" : "Normal"} />

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
