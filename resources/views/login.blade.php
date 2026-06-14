<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>SentinelIoT Login</title>
    @vite(["resources/css/app.css"])
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
</head>
<body class="min-h-screen bg-background text-foreground">
    <main class="min-h-screen p-3 md:p-5">
        <div class="relative isolate overflow-hidden rounded-lg border border-[#212327] min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-40px)]" style="background:#0a0a0a;">
            <!-- Ambient indigo grid -->
            <div class="absolute inset-0 pointer-events-none" style="background-image:linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px, transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,black 20%,transparent 70%);-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 30%,black 20%,transparent 70%);"></div>
            <div class="relative z-10 grid min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-40px)] lg:grid-cols-[1.25fr_0.95fr]">
                <section class="px-7 py-8 md:px-10 md:py-10 flex flex-col">
                    <div class="inline-flex items-center gap-3">
                        <span class="w-8 h-8 rounded-full text-[#0a0a0a] text-[11px] font-normal inline-flex items-center justify-center" style="font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%);">SI</span>
                        <div><p class="text-lg font-normal leading-none text-white">SentinelIoT</p><p class="text-[11px] text-[#7d8187]">Smart Safety Monitoring</p></div>
                    </div>
                    <span class="mt-12 inline-flex w-fit items-center px-3 py-1.5 rounded-[9999px] border border-[#212327] bg-[#1a1c20] text-[11px] text-white font-normal uppercase" style="font-family: 'JetBrains Mono', monospace; letter-spacing: 1.4px;">Real-time Fuzzy Logic Detection</span>
                    <h1 class="mt-6 text-4xl lg:text-5xl leading-tight font-normal max-w-[480px] text-white" style="font-family: 'Inter', sans-serif; letter-spacing: -1.2px; line-height: 1;">Pantau ruangan Anda tanpa khawatir.</h1>
                    <p class="mt-4 text-lg text-[#dadbdf] max-w-[520px] leading-relaxed" style="font-family: 'Inter', sans-serif;">Deteksi dini gas, asap, suhu, dan api dengan visualisasi 3D interaktif.</p>
                    <div class="mt-8 grid grid-cols-3 gap-3 max-w-[480px]">
                        <article class="rounded-lg border border-[rgba(124,58,237,0.15)] bg-[#191919] px-3 py-3 hover:border-[rgba(124,58,237,0.3)] transition-colors duration-200"><p class="text-3xl font-normal text-[#c4b5fd]" style="font-family: 'JetBrains Mono', monospace; letter-spacing: -0.5px;">13</p><p class="text-[11px] text-[#7d8187] mt-1">Fuzzy Rules</p></article>
                        <article class="rounded-lg border border-[rgba(124,58,237,0.15)] bg-[#191919] px-3 py-3 hover:border-[rgba(124,58,237,0.3)] transition-colors duration-200"><p class="text-3xl font-normal text-[#c4b5fd]" style="font-family: 'JetBrains Mono', monospace; letter-spacing: -0.5px;">&lt;3s</p><p class="text-[11px] text-[#7d8187] mt-1">Latency</p></article>
                        <article class="rounded-lg border border-[rgba(124,58,237,0.15)] bg-[#191919] px-3 py-3 hover:border-[rgba(124,58,237,0.3)] transition-colors duration-200"><p class="text-3xl font-normal text-[#c4b5fd]" style="font-family: 'JetBrains Mono', monospace; letter-spacing: -0.5px;">24/7</p><p class="text-[11px] text-[#7d8187] mt-1">Monitoring</p></article>
                    </div>
                    <p class="mt-auto pt-8 text-[11px] text-[#7d8187]">&copy; 2026 SentinelIoT</p>
                </section>
                <section class="px-6 py-8 md:px-10 md:py-10 flex items-center justify-center">
                    <div class="w-full max-w-[420px] rounded-lg border border-[rgba(124,58,237,0.15)] bg-[#191919] p-6">
                        <h2 class="text-3xl font-normal text-white" style="font-family: 'Inter', sans-serif; letter-spacing: -0.6px;">Selamat datang kembali</h2>
                        <p class="mt-2 text-sm text-[#7d8187]">Masuk ke akun Anda.</p>
                        <form class="mt-6 space-y-3" id="loginForm">
                            <label class="block">
                                <span class="block text-[11px] uppercase text-[#7d8187] mb-1.5 font-normal" style="font-family: 'JetBrains Mono', monospace; letter-spacing: 1.4px;">Email</span>
                                <div class="h-11 rounded-lg border border-[#212327] bg-[#1a1c20] px-4 flex items-center gap-2 transition-all duration-150 hover:border-[#363a3f] focus-within:border-white">
                                    <span class="text-[#7d8187] text-sm">@</span>
                                    <input type="email" name="email" id="emailInput" placeholder="you@email.com" class="bg-transparent outline-none border-0 w-full text-sm text-white placeholder:text-[#7d8187] font-normal" required>
                                </div>
                            </label>
                            <label class="block">
                                <div class="flex items-center justify-between mb-1.5">
                                    <span class="text-[11px] uppercase text-[#7d8187] font-normal" style="font-family: 'JetBrains Mono', monospace; letter-spacing: 1.4px;">Password</span>
                                    <a href="#" class="text-[11px] text-[#7d8187] hover:text-white transition-all duration-150">Lupa?</a>
                                </div>
                                <div class="h-11 rounded-lg border border-[#212327] bg-[#1a1c20] px-4 flex items-center gap-2 transition-all duration-150 hover:border-[#363a3f] focus-within:border-white">
                                    <span class="text-[#7d8187] text-sm">&#x1f512;</span>
                                    <input type="password" name="password" id="passwordInput" placeholder="Password" class="bg-transparent outline-none border-0 w-full text-sm text-white placeholder:text-[#7d8187] font-normal" required>
                                    <button type="button" id="togglePassword" class="text-[#7d8187] hover:text-white transition-all duration-150 cursor-pointer">
                                        <svg id="eyeOpen" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                        <svg id="eyeClosed" class="w-4 h-4 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151"/><path d="m2 2 20 20"/></svg>
                                    </button>
                                </div>
                            </label>
                            <label class="inline-flex items-center gap-2 text-xs text-[#7d8187]">
                                <input type="checkbox" class="rounded border-[#212327] bg-[#1a1c20] text-white focus:ring-white/20">
                                Tetap masuk
                            </label>
                            <button type="submit" id="loginBtn" class="h-11 w-full rounded-[9999px] bg-white text-[#0a0a0a] font-normal text-sm transition-all duration-150 hover:bg-[#fafaf7] cursor-pointer" style="font-family: 'Inter', sans-serif;">
                                Masuk ke Dashboard
                            </button>
                        </form>
                        <div class="mt-4 flex items-center gap-3"><span class="h-px flex-1 bg-[#212327]"></span><span class="text-[10px] text-[#7d8187]">atau</span><span class="h-px flex-1 bg-[#212327]"></span></div>
                        <button type="button" class="mt-4 h-11 w-full rounded-[9999px] border border-[#212327] bg-[#0a0a0a] text-white font-normal text-sm transition-all duration-150 hover:bg-[#1a1c20] cursor-pointer" style="font-family: 'Inter', sans-serif;">
                            Lanjutkan dengan Google
                        </button>
                    </div>
                </section>
            </div>
        </div>
    </main>
    <script>
        document.getElementById("togglePassword")?.addEventListener("click",()=>{const p=document.getElementById("passwordInput"),o=document.getElementById("eyeOpen"),c=document.getElementById("eyeClosed"),i=p.type==="password";p.type=i?"text":"password";o.classList.toggle("hidden",i);c.classList.toggle("hidden",!i)});
        document.getElementById("loginForm")?.addEventListener("submit",async e=>{e.preventDefault();const b=document.getElementById("loginBtn"),email=document.getElementById("emailInput").value,pw=document.getElementById("passwordInput").value;b.disabled=true;b.textContent="Loading...";try{const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]')?.content||""},body:JSON.stringify({email,password:pw})});const d=await r.json();if(d.status==="success")window.location.href="/dashboard";else{alert("Login failed: "+d.message);b.disabled=false;b.textContent="Masuk ke Dashboard"}}catch(err){alert("Error: "+err.message);b.disabled=false;b.textContent="Masuk ke Dashboard"}});
    </script>
</body>
</html>
