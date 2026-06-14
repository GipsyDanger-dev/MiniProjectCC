import React, { useState } from "react";
import { Shield, Eye, EyeOff, Flame, Loader2 } from "lucide-react";

export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.status === "success") {
                onLogin(data.user);
            } else {
                setError(data.message || "Login gagal");
            }
        } catch (err) {
            setError("Tidak dapat terhubung ke server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
            }} />

            <div className="relative w-full max-w-md">
                <div className="relative bg-[#191919] border border-[#212327] rounded-lg overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white mb-4">
                                <Shield className="w-6 h-6 text-[#0a0a0a]" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-2xl font-normal text-white tracking-tight" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.6px' }}>
                                Sentinel<span className="text-white">IoT</span>
                            </h1>
                            <p className="text-[11px] text-[#7d8187] mt-1.5 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1.4px' }}>
                                Smart Safety Monitoring System
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 px-4 py-3 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg flex items-center gap-3">
                                <Flame className="w-4 h-4 text-[#ef4444] flex-shrink-0" strokeWidth={1.5} />
                                <p className="text-[13px] text-[#ef4444]">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-normal uppercase text-[#7d8187] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1.4px' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@sentinel.id"
                                    required
                                    className="w-full h-11 px-4 bg-[#1a1c20] border border-[#212327] rounded-lg text-sm text-white placeholder:text-[#7d8187] focus:outline-none focus:border-white transition-all duration-150 font-normal"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-normal uppercase text-[#7d8187] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1.4px' }}>
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full h-11 px-4 pr-11 bg-[#1a1c20] border border-[#212327] rounded-lg text-sm text-white placeholder:text-[#7d8187] focus:outline-none focus:border-white transition-all duration-150 font-normal"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d8187] hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-white text-[#0a0a0a] text-sm font-normal rounded-[9999px] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fafaf7]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    "Masuk"
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-[#212327]">
                            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7d8187]">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                                <span>System Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
