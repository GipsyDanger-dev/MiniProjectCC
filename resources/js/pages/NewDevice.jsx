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
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
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
            onCreated?.(payload.device);
            onReload?.();
        } catch (_err) {
            setError("Failed to create device.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pb-6 space-y-5">
            <div>
                <h1 className="text-4xl font-semibold text-foreground">
                    New Device
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Add a new device for your rooms and integrations.
                </p>
            </div>

            <section className="rounded-[20px] border border-white/15 backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-xl max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-2">
                            <Cpu className="w-3 h-3" />
                            Device Name
                        </p>
                        <input
                            type="text"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                            className="text-sm mt-2 w-full bg-transparent outline-none border-b border-white/10 text-foreground pb-1 focus:border-lime/50 transition-smooth"
                            placeholder="Warehouse Gateway"
                        />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            Room / Location
                        </p>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="text-sm mt-2 w-full bg-transparent outline-none border-b border-white/10 text-foreground pb-1 focus:border-lime/50 transition-smooth"
                            placeholder="Warehouse"
                        />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-2">
                            <KeyRound className="w-3 h-3" />
                            API Key
                        </p>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="text-sm mt-2 w-full bg-transparent outline-none border-b border-white/10 text-foreground pb-1 focus:border-lime/50 transition-smooth"
                            placeholder="key-warehouse-001"
                        />
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            Status
                        </p>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="device-select text-sm mt-2 w-full bg-transparent outline-none border-b border-white/10 text-foreground pb-1 focus:border-lime/50 transition-smooth"
                        >
                            <option value="offline">offline</option>
                            <option value="online">online</option>
                        </select>
                    </div>

                    {error ? (
                        <p className="text-sm text-danger">{error}</p>
                    ) : null}
                    {success ? (
                        <p className="text-sm text-success">{success}</p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            !deviceName.trim() ||
                            !apiKey.trim() ||
                            !location.trim()
                        }
                        className="h-11 px-6 rounded-full bg-lime/20 text-lime border border-lime/35 font-semibold hover:bg-lime/30 transition-smooth disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" />
                        {submitting ? "Creating..." : "Create Device"}
                    </button>
                </form>
            </section>
        </div>
    );
}
