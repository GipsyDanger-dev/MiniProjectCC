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
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,60,60,0.08)_0%,_transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,120,0,0.05)_0%,_transparent_50%)]" />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
            }} />

            {/* Login card */}
            <div className="relative w-full max-w-md">
                {/* Glow effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-b from-red-500/10 via-transparent to-orange-500/5 rounded-2xl blur-xl" />

                <div className="relative bg-[#111118] border border-[#1e1e2a] rounded-2xl overflow-hidden">
                    {/* Top accent bar */}
                    <div className="h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

                    <div className="p-8">
                        {/* Logo & Title */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                                <Shield className="w-8 h-8 text-red-400" />
                            </div>
                            <h1 className="text-2xl font-semibold text-white tracking-tight">
                                Sentinel<span className="text-red-400">IoT</span>
                            </h1>
                            <p className="text-[13px] text-gray-500 mt-1.5 tracking-wide">
                                Smart Safety Monitoring System
                            </p>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                                <Flame className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <p className="text-[13px] text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email field */}
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@sentinel.id"
                                    required
                                    className="w-full h-11 px-4 bg-[#0a0a0f] border border-[#1e1e2a] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition-all"
                                />
                            </div>

                            {/* Password field */}
                            <div>
                                <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-gray-400 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full h-11 px-4 pr-11 bg-[#0a0a0f] border border-[#1e1e2a] rounded-lg text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
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

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-[#1e1e2a]">
                            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>System Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
