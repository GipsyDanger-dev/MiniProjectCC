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
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                <div className="relative bg-surface2 border border-edge rounded-xl overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-accent via-warning to-accent" />

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-accent/10 border border-accent/20 mb-4">
                                <Shield className="w-8 h-8 text-accent" />
                            </div>
                            <h1 className="text-2xl font-semibold text-ink tracking-tight">
                                Sentinel<span className="text-accent">IoT</span>
                            </h1>
                            <p className="text-[13px] text-ink3 mt-1.5">
                                Smart Safety Monitoring System
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 px-4 py-3 bg-danger/10 rounded-lg flex items-center gap-3">
                                <Flame className="w-4 h-4 text-danger flex-shrink-0" />
                                <p className="text-[13px] text-danger">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-medium text-ink3 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@sentinel.id"
                                    required
                                    className="w-full h-11 px-4 bg-surface border border-edge rounded-lg text-sm text-ink placeholder:text-ink3/60 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-medium text-ink3 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="w-full h-11 px-4 pr-11 bg-surface border border-edge rounded-lg text-sm text-ink placeholder:text-ink3/60 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink3 hover:text-ink transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

                        <div className="mt-8 pt-6 border-t border-edge">
                            <div className="flex items-center justify-center gap-2 text-[11px] text-ink3">
                                <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                <span>System Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
