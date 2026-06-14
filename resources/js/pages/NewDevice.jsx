import React, { useState } from "react";
import { Cpu, KeyRound, MapPin, PlusCircle } from "lucide-react";

export default function NewDevice({ onCreated, onReload }) {
    const [deviceName, setDeviceName] = useState("");
    const [location, setLocation] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [status, setStatus] = useState("offline");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!deviceName.trim() || !location.trim() || !apiKey.trim()) {
            setError("Please complete all required fields.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/devices", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify({
                    device_name: deviceName.trim(),
                    location,
                    api_key: apiKey.trim(),
                    status,
                }),
            });

            const payload = await res.json();
            if (payload.status !== "success") {
                setError(payload.message || "Failed to create device.");
                return;
            }

            setSuccess("Device created successfully.");
            setDeviceName("");
            setApiKey("");
            setStatus("offline");
            onCreated?.(payload.data);
            onReload?.();
        } catch (_err) {
            setError("Failed to create device.");
        } finally {
            setSubmitting(false);
        }
    };

    const FieldRow = ({ icon: Icon, label, children }) => (
        <div className="py-2.5 border-b border-edge">
            <p className="text-[9px] uppercase tracking-[0.08em] text-ink3 flex items-center gap-1.5 mb-1.5">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </p>
            {children}
        </div>
    );

    return (
        <div className="flex flex-col gap-2.5">
            <div>
                <p className="text-[12px] font-medium text-ink2">New Device</p>
                <p className="text-[11px] text-ink3 mt-0.5">Add a new device for your rooms and integrations.</p>
            </div>

            <div className="max-w-xl">
                <div className="bg-surface2 border border-edge rounded-lg shadow-card">
                    <div className="px-4 py-3 border-b border-edge">
                        <p className="text-[12px] font-medium text-ink2">Device Configuration</p>
                    </div>
                    <form onSubmit={handleSubmit} className="px-4">
                        <FieldRow icon={Cpu} label="Device Name">
                            <input
                                type="text"
                                value={deviceName}
                                onChange={(e) => setDeviceName(e.target.value)}
                                className="text-[10px] w-full bg-transparent outline-none border-b border-edge text-ink pb-0.5 focus:border-accent transition-smooth"
                                placeholder="Warehouse Gateway"
                            />
                        </FieldRow>

                        <FieldRow icon={MapPin} label="Room / Location">
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="text-[10px] w-full bg-transparent outline-none border-b border-edge text-ink pb-0.5 focus:border-accent transition-smooth"
                                placeholder="Warehouse"
                            />
                        </FieldRow>

                        <FieldRow icon={KeyRound} label="API Key">
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="text-[10px] w-full bg-transparent outline-none border-b border-edge text-ink pb-0.5 focus:border-accent transition-smooth"
                                placeholder="key-warehouse-001"
                            />
                        </FieldRow>

                        <FieldRow label="Status">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="text-[10px] w-full bg-transparent outline-none border-b border-edge text-ink pb-0.5 focus:border-accent transition-smooth"
                            >
                                <option value="offline">offline</option>
                                <option value="online">online</option>
                            </select>
                        </FieldRow>

                        {error && <p className="text-[10px] text-danger py-1.5">{error}</p>}
                        {success && <p className="text-[10px] text-success py-1.5">{success}</p>}

                        <div className="py-2.5">
                            <button
                                type="submit"
                                disabled={submitting || !deviceName.trim() || !apiKey.trim() || !location.trim()}
                                className="w-full h-9 rounded-lg bg-accent text-accent-foreground text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-smooth disabled:opacity-50"
                            >
                                <PlusCircle className="w-3 h-3" />
                                {submitting ? "Creating..." : "Create Device"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
