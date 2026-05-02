<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>SentinelIoT Login</title>
        @vite(["resources/css/app.css"])
    </head>
    <body class="min-h-screen bg-background text-foreground">
        <main class="min-h-screen p-3 md:p-5">
            <div class="relative isolate overflow-hidden rounded-[22px] border border-white/10 min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-40px)] bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02)_58%,rgba(99,102,241,0.08))]">
                <div class="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_110%_at_100%_0%,rgba(204,255,0,0.08),transparent_68%)]"></div>

                <div class="relative z-10 grid min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-40px)] lg:grid-cols-[1.25fr_0.95fr]">
                    <section class="px-7 py-8 md:px-10 md:py-10 flex flex-col">
                        <div class="inline-flex items-center gap-3">
                            <span class="w-10 h-10 rounded-full bg-white text-black font-bold text-sm inline-flex items-center justify-center">🛡</span>
                            <div>
                                <p class="text-2xl font-semibold leading-none">SentinelIoT</p>
                                <p class="text-sm text-muted-foreground">Smart Safety Monitoring</p>
                            </div>
                        </div>

                        <span class="mt-14 inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/25 text-xs">
                            ✨ Real-time Fuzzy Logic Detection
                        </span>

                        <h1 class="mt-8 text-5xl leading-tight font-semibold max-w-[480px]">
                            Pantau ruangan Anda tanpa khawatir.
                        </h1>
                        <p class="mt-5 text-xl text-muted-foreground max-w-[620px]">
                            Deteksi dini gas, asap, suhu, dan api dengan visualisasi 3D interaktif. Masuk untuk mengakses dashboard monitoring Anda.
                        </p>

                        <div class="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-[560px]">
                            <article class="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
                                <p class="text-4xl font-semibold leading-none">13</p>
                                <p class="text-sm text-muted-foreground mt-2">Fuzzy Rules</p>
                            </article>
                            <article class="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
                                <p class="text-4xl font-semibold leading-none">&lt;3s</p>
                                <p class="text-sm text-muted-foreground mt-2">Latency</p>
                            </article>
                            <article class="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
                                <p class="text-4xl font-semibold leading-none">24/7</p>
                                <p class="text-sm text-muted-foreground mt-2">Monitoring</p>
                            </article>
                        </div>

                        <p class="mt-auto pt-10 text-sm text-muted-foreground">
                            &copy; 2026 SentinelIoT. All rights reserved.
                        </p>
                    </section>

                    <section class="px-6 py-8 md:px-10 md:py-10 flex items-center justify-center">
                        <div class="w-full max-w-[460px] rounded-[24px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_56%,rgba(99,102,241,0.1))] p-6 md:p-7 shadow-[0_20px_48px_rgba(0,0,0,0.48)]">
                            <h2 class="text-4xl leading-tight font-semibold">
                                Selamat datang kembali 👋
                            </h2>
                            <p class="mt-3 text-sm text-muted-foreground">
                                Masuk ke akun Anda untuk melanjutkan.
                            </p>

                            <form class="mt-7 space-y-4" id="loginForm">
                                <label class="block">
                                    <span class="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Email</span>
                                    <div class="h-12 rounded-full border border-white/10 bg-black/25 px-4 flex items-center gap-2 transition-smooth hover:border-lime/55 focus-within:border-lime/70 focus-within:shadow-[0_0_0_1px_rgba(204,255,0,0.25)]">
                                        <span class="text-muted-foreground">✉</span>
                                        <input
                                            type="email"
                                            name="email"
                                            id="emailInput"
                                            value="admin@sentinel.io"
                                            class="bg-transparent outline-none border-0 w-full text-sm caret-lime"
                                            required
                                        >
                                    </div>
                                </label>

                                <label class="block">
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs uppercase tracking-[0.18em] text-muted-foreground">Password</span>
                                        <a href="#" class="text-xs text-muted-foreground hover:text-lime transition-smooth">
                                            Lupa password?
                                        </a>
                                    </div>
                                    <div class="h-12 rounded-full border border-white/10 bg-black/25 px-4 flex items-center gap-2 transition-smooth hover:border-lime/55 focus-within:border-lime/70 focus-within:shadow-[0_0_0_1px_rgba(204,255,0,0.25)]">
                                        <span class="text-muted-foreground">🔒</span>
                                        <input
                                            type="password"
                                            name="password"
                                            id="passwordInput"
                                            value="admin123"
                                            class="bg-transparent outline-none border-0 w-full text-sm caret-lime"
                                            required
                                        >
                                        <button
                                            type="button"
                                            id="togglePassword"
                                            aria-label="Toggle password visibility"
                                            class="relative text-muted-foreground hover:text-lime transition-smooth cursor-pointer flex-shrink-0"
                                        >
                                            <svg
                                                id="eyeOpen"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                class="w-4 h-4"
                                            >
                                                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                            <svg
                                                id="eyeClosed"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                class="w-4 h-4 hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                            >
                                                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .698 10.75 10.75 0 0 1-1.444 2.49"/>
                                                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
                                                <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
                                                <path d="m2 2 20 20"/>
                                            </svg>
                                        </button>
                                    </div>
                                </label>

                                <label class="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                    <input
                                        type="checkbox"
                                        class="rounded-full border-white/20 bg-black/25 text-lime focus:ring-lime/60"
                                    >
                                    Tetap masuk di perangkat ini
                                </label>

                                <button
                                    type="submit"
                                    id="loginBtn"
                                    class="h-12 w-full rounded-full bg-[linear-gradient(180deg,rgba(20,20,28,0.95),rgba(9,9,14,0.95))] border border-lime/30 text-foreground font-semibold shadow-[0_0_0_1px_rgba(204,255,0,0.18),0_12px_28px_rgba(204,255,0,0.28)] transition-smooth hover:bg-lime hover:[background-image:none] hover:text-lime-foreground hover:border-lime hover:shadow-[0_0_0_1px_rgba(204,255,0,0.28),0_16px_36px_rgba(204,255,0,0.38)] cursor-pointer"
                                >
                                    Masuk ke Dashboard
                                </button>
                            </form>

                            <div class="mt-5 flex items-center gap-3">
                                <span class="h-px flex-1 bg-white/10"></span>
                                <span class="text-xs text-muted-foreground">atau</span>
                                <span class="h-px flex-1 bg-white/10"></span>
                            </div>

                            <button
                                type="button"
                                class="mt-5 h-12 w-full rounded-full bg-white text-black font-semibold transition-smooth hover:bg-lime hover:text-lime-foreground cursor-pointer"
                            >
                                G Lanjutkan dengan Google
                            </button>

                        </div>
                    </section>
                </div>

            </div>
        </main>
        <script>
            const togglePasswordBtn = document.getElementById("togglePassword");
            const passwordInput = document.getElementById("passwordInput");
            const eyeOpen = document.getElementById("eyeOpen");
            const eyeClosed = document.getElementById("eyeClosed");
            const loginForm = document.getElementById("loginForm");
            const loginBtn = document.getElementById("loginBtn");

            togglePasswordBtn?.addEventListener("click", () => {
                const isPassword = passwordInput.type === "password";
                passwordInput.type = isPassword ? "text" : "password";
                eyeOpen.classList.toggle("hidden", isPassword);
                eyeClosed.classList.toggle("hidden", !isPassword);
            });

            loginForm?.addEventListener("submit", async (e) => {
                e.preventDefault();
                const email = document.getElementById("emailInput").value;
                const password = document.getElementById("passwordInput").value;

                loginBtn.disabled = true;
                loginBtn.textContent = "Loading...";

                try {
                    const response = await fetch("/api/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.content || ""
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (data.status === "success") {
                        window.location.href = "/dashboard";
                    } else {
                        alert("Login failed: " + data.message);
                        loginBtn.disabled = false;
                        loginBtn.textContent = "Masuk ke Dashboard";
                    }
                } catch (error) {
                    alert("Error: " + error.message);
                    loginBtn.disabled = false;
                    loginBtn.textContent = "Masuk ke Dashboard";
                }
            });
        </script>
    </body>
</html>
