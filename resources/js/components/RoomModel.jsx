import React, { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Environment } from "@react-three/drei";
import * as THREE from "three";

function LoadingSpinner() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground">Loading 3D Model...</span>
            </div>
        </Html>
    );
}

function FanBlades({ fanSpeed, fanStatus, position = [0, 3, 0] }) {
    const groupRef = useRef();
    const currentSpeed = useRef(0);

    useFrame((_, delta) => {
        if (!groupRef.current) return;
        const speedMap = { LOW: 4, MEDIUM: 8, HIGH: 16 };
        const target = fanStatus !== "OFF" ? (speedMap[fanStatus] || 0) : 0;
        currentSpeed.current += (target - currentSpeed.current) * 0.05;
        groupRef.current.rotation.y += currentSpeed.current * delta;
    });

    return (
        <group ref={groupRef} position={position}>
            {[0, 1, 2, 3].map((i) => (
                <mesh key={i} rotation={[0, (Math.PI / 2) * i, 0.15]}>
                    <boxGeometry args={[1.6, 0.04, 0.3]} />
                    <meshStandardMaterial color="#888" metalness={0.8} roughness={0.3} />
                </mesh>
            ))}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.2, 16]} />
                <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
    );
}

function EmergencyLighting({ emergency, fanStatus }) {
    const pointLightRef = useRef();
    const timeRef = useRef(0);

    useFrame((_, delta) => {
        timeRef.current += delta;
        if (pointLightRef.current) {
            if (emergency === "BAHAYA") {
                const pulse = Math.sin(timeRef.current * 4) * 0.5 + 0.5;
                pointLightRef.current.intensity = 1.5 + pulse * 2;
                pointLightRef.current.color.setHSL(0, 0.9, 0.5 + pulse * 0.2);
            } else {
                pointLightRef.current.intensity = 0.8;
                pointLightRef.current.color.setHSL(0.28, 0.8, 0.5);
            }
        }
    });

    return (
        <>
            <ambientLight intensity={emergency === "BAHAYA" ? 0.4 : 0.6} color={emergency === "BAHAYA" ? "#ff4444" : "#ffffff"} />
            <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
            <pointLight ref={pointLightRef} position={[0, 3, 0]} distance={15} />
            {emergency === "BAHAYA" && (
                <pointLight position={[0, 0.5, 0]} intensity={2} color="#ff2200" distance={8} decay={2} />
            )}
        </>
    );
}

function SensorLabel({ position, label, value, unit, status }) {
    const color = status === "Alert" ? "#ef4444" : "#22c55e";
    return (
        <Html position={position} center distanceFactor={8} style={{ pointerEvents: "none" }}>
            <div className="flex flex-col items-center gap-0.5">
                <div className="px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap border backdrop-blur-sm"
                    style={{
                        backgroundColor: status === "Alert" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                        borderColor: `${color}40`,
                        color: color,
                    }}>
                    {label}
                </div>
                <div className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/60 text-white whitespace-nowrap">
                    {value}{unit}
                </div>
            </div>
        </Html>
    );
}

function OfficeScene({ iot }) {
    const { scene } = useGLTF("/office.glb");
    const groupRef = useRef();

    const latest = iot?.latestReading;
    const emergency = iot?.data?.emergency_status || "AMAN";
    const actuator = iot?.data?.device_actuator;
    const fanStatus = actuator?.fan_status || "OFF";
    const fanSpeed = actuator?.fan_speed || 0;

    const gas = Math.round(Number(latest?.gas_value || 0));
    const temp = Math.round(Number(latest?.temperature || 0));
    const humidity = Math.round(Number(latest?.humidity || 0));
    const flameValue = Number(latest?.flame_value || 9999);
    const flameDetected = flameValue < 500;

    const { modelOffset, fanY, labelY, floorY } = useMemo(() => {
        const box = new THREE.Box3().setFromObject(scene);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);
        return {
            modelOffset: [-center.x, -box.min.y, -center.z],
            fanY: size.y + 0.3,
            labelY: size.y + 1.2,
            floorY: 0,
        };
    }, [scene]);

    useEffect(() => {
        if (!scene) return;
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [scene]);

    return (
        <>
            <EmergencyLighting emergency={emergency} fanStatus={fanStatus} />

            <group ref={groupRef}>
                <primitive object={scene} position={modelOffset} />
                <FanBlades fanSpeed={fanSpeed} fanStatus={fanStatus} position={[0, fanY, 0]} />
            </group>

            <SensorLabel position={[-2, labelY, 1]} label="MQ-2 Gas" value={gas} unit="ppm" status={gas > 250 ? "Alert" : "Normal"} />
            <SensorLabel position={[2, labelY, 1]} label="DHT22 Suhu" value={temp} unit="°C" status={temp > 40 ? "Alert" : "Normal"} />
            <SensorLabel position={[-2, labelY, -1]} label="DHT22 Humidity" value={humidity} unit="%" status={humidity > 70 ? "Alert" : "Normal"} />
            <SensorLabel position={[2, labelY, -1]} label="KY-026 Flame" value={flameDetected ? "DETECTED" : "CLEAR"} unit="" status={flameDetected ? "Alert" : "Normal"} />

            {emergency === "BAHAYA" && (
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[3, 32]} />
                    <meshBasicMaterial color="#ff0000" transparent opacity={0.08} />
                </mesh>
            )}

            <OrbitControls
                target={[0, 1.5, 0]}
                enablePan={false}
                minDistance={1}
                maxDistance={6}
                minPolarAngle={0.3}
                maxPolarAngle={Math.PI / 2.2}
                autoRotate={false}
            />
        </>
    );
}

useGLTF.preload("/office.glb");

export default function RoomModel({ room, iot }) {
    const emergency = iot?.data?.emergency_status || "AMAN";
    const actuator = iot?.data?.device_actuator;
    const fanStatus = actuator?.fan_status || "OFF";
    const fanSpeed = actuator?.fan_speed || 0;

    const latest = iot?.latestReading;
    const gas = Math.round(Number(latest?.gas_value || 0));
    const temp = Math.round(Number(latest?.temperature || 0));
    const humidity = Math.round(Number(latest?.humidity || 0));
    const flameValue = Number(latest?.flame_value || 9999);

    return (
        <div className="card-surface p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        3D Room Monitor
                    </p>
                    <h3 className="text-lg font-semibold text-foreground mt-1">
                        {room}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                        fanStatus !== "OFF"
                            ? "bg-purple/20 text-purple"
                            : "bg-muted/40 text-muted-foreground"
                    }`}>
                        Fan: {fanStatus}{fanSpeed ? ` ${fanSpeed}%` : ""}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] uppercase tracking-wider ${
                        emergency === "BAHAYA"
                            ? "bg-danger/20 text-danger"
                            : "bg-success/20 text-success"
                    }`}>
                        {emergency}
                    </span>
                </div>
            </div>

            <div className="mt-4 h-[400px] rounded-2xl border border-border/40 overflow-hidden relative">
                <Canvas
                    camera={{ position: [1.5, 1, 1.5], fov: 50 }}
                    dpr={[1, 2]}
                    shadows
                    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
                >
                    <Suspense fallback={<LoadingSpinner />}>
                        <OfficeScene iot={iot} />
                    </Suspense>
                </Canvas>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${emergency === "BAHAYA" ? "bg-danger animate-pulse" : "bg-success"}`} />
                        <span className="text-[10px] text-muted-foreground">
                            {emergency === "BAHAYA" ? "Emergency Active" : "All Clear"}
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                        Drag to rotate · Scroll to zoom
                    </span>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
                {[
                    { label: "Gas", value: `${gas} ppm`, alert: gas > 250 },
                    { label: "Suhu", value: `${temp}°C`, alert: temp > 40 },
                    { label: "Humidity", value: `${humidity}%`, alert: humidity > 70 },
                    { label: "Flame", value: flameValue < 500 ? "DETECTED" : "CLEAR", alert: flameValue < 500 },
                ].map((s) => (
                    <div key={s.label} className={`px-3 py-2 rounded-xl text-center border ${
                        s.alert
                            ? "bg-danger/10 border-danger/30 text-danger"
                            : "bg-muted/20 border-border/30 text-foreground"
                    }`}>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                        <p className="text-sm font-semibold mt-0.5">{s.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
