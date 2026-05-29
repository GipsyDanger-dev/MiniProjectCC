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
        <div class="relative isolate overflow-hidden rounded-2xl border border-white/[0.06] min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-40px)]" style="background:#0A0A0F;background-image:linear-gradient(rgba(124,58,237,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.03) 1px,transparent 1px),radial-gradient(ellipse 60% 40% at 50% 0%,rgba(124,58,237,0.15) 0%,transparent 70%);background-size:60px 60px,60px 60px,100% 100%;">
            <div class="relative z-10 grid min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-40px)] lg:grid-cols-[1.25fr_0.95fr]">
                <section class="px-7 py-8 md:px-10 md:py-10 flex flex-col">
                    <div class="inline-flex items-center gap-3">
                        <span class="w-10 h-10 rounded-xl bg-violet text-white font-bold text-sm inline-flex items-center justify-center">SI</span>
                        <div><p class="text-xl font-bold leading-none">SentinelIoT</p><p class="text-xs text-muted-foreground">Smart Safety Monitoring</p></div>
                    </div>
                    <span class="mt-12 inline-flex w-fit items-center px-3 py-1.5 rounded-full border border-violet/30 bg-violet/10 text-[11px] text-violet font-semibold uppercase tracking-[0.1em]">Real-time Fuzzy Logic Detection</span>
                    <h1 class="mt-6 text-4xl lg:text-5xl leading-tight font-bold max-w-[480px] tracking-tight">Pantau ruangan Anda tanpa khawatir.</h1>
                    <p class="mt-4 text-lg text-muted-foreground max-w-[520px] leading-relaxed">Deteksi dini gas, asap, suhu, dan api dengan visualisasi 3D interaktif.</p>
                    <div class="mt-8 grid grid-cols-3 gap-3 max-w-[480px]">
                        <article class="rounded-xl border border-white/[0.06] bg-[#1A1525] px-3 py-3"><p class="text-3xl font-bold">13</p><p class="text-xs text-muted-foreground mt-1">Fuzzy Rules</p></article>
                        <article class="rounded-xl border border-white/[0.06] bg-[#1A1525] px-3 py-3"><p class="text-3xl font-bold">&lt;3s</p><p class="text-xs text-muted-foreground mt-1">Latency</p></article>
                        <article class="rounded-xl border border-white/[0.06] bg-[#1A1525] px-3 py-3"><p class="text-3xl font-bold">24/7</p><p class="text-xs text-muted-foreground mt-1">Monitoring</p></article>
                    </div>
                    <p class="mt-auto pt-8 text-xs text-muted-foreground">&copy; 2026 SentinelIoT</p>
                </section>
                <section class="px-6 py-8 md:px-10 md:py-10 flex items-center justify-center">
                    <div class="w-full max-w-[420px] rounded-2xl border border-white/[0.06] bg-[#1A1525]/80 backdrop-blur-xl p-6">
                        <h2 class="text-3xl font-bold">Selamat datang kembali</h2>
                        <p class="mt-2 text-sm text-muted-foreground">Masuk ke akun Anda.</p>
                        <form class="mt-6 space-y-3" id="loginForm">
                            <label class="block"><span class="block text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1.5 font-semibold">Email</span><div class="h-11 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 flex items-center gap-2 transition-smooth hover:border-violet/30 focus-within:border-violet/50"><span class="text-muted-foreground text-sm">@</span><input type="email" name="email" id="emailInput" placeholder="you@email.com" class="bg-transparent outline-none border-0 w-full text-sm" required></div></label>
                            <label class="block"><div class="flex items-center justify-between mb-1.5"><span class="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-semibold">Password</span><a href="#" class="text-[10px] text-muted-foreground hover:text-violet transition-smooth">Lupa?</a></div><div class="h-11 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 flex items-center gap-2 transition-smooth hover:border-violet/30 focus-within:border-violet/50"><span class="text-muted-foreground text-sm">🔒</span><input type="password" name="password" id="passwordInput" placeholder="Password" class="bg-transparent outline-none border-0 w-full text-sm" required><button type="button" id="togglePassword" class="text-muted-foreground hover:text-violet transition-smooth cursor-pointer"><svg id="eyeOpen" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg><svg id="eyeClosed" class="w-4 h-4 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151"/><path d="m2 2 20 20"/></svg></button></div></label>
                            <label class="inline-flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" class="rounded border-white/[0.06] bg-white/[0.03] text-violet focus:ring-violet/40">Tetap masuk</label>
                            <button type="submit" id="loginBtn" class="h-11 w-full rounded-lg bg-gradient-to-r from-violet to-violet-light text-white font-semibold text-sm transition-smooth hover:shadow-violet cursor-pointer">Masuk ke Dashboard</button>
                        </form>
                        <div class="mt-4 flex items-center gap-3"><span class="h-px flex-1 bg-white/[0.06]"></span><span class="text-[10px] text-muted-foreground">atau</span><span class="h-px flex-1 bg-white/[0.06]"></span></div>
                        <button type="button" class="mt-4 h-11 w-full rounded-lg bg-white text-black font-semibold text-sm transition-smooth hover:bg-violet hover:text-white cursor-pointer">Lanjutkan dengan Google</button>
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
