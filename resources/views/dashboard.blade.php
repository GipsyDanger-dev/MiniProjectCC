<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Fire & Gas Detection | Enterprise Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three/examples/js/controls/OrbitControls.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #0f172a; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f8fafc; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        /* Card Styling */
        .glass-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04); }
        
        /* Input Range Styling */
        input[type=range] { -webkit-appearance: none; background: #dbe4f0; height: 4px; border-radius: 5px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #ffffff; cursor: pointer; border: 2px solid #94a3b8; box-shadow: 0 1px 4px rgba(15, 23, 42, 0.15); }

        /* Status Badge */
        .badge-safe { background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); color: #4ade80; }
        .badge-danger { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; }
        
        /* Container constraints */
        body { overflow-x: hidden; max-width: 100vw; }
        main { width: 100%; }
    </style>
</head>
<body class="p-6">

    <!-- HEADER SECTION -->
    <header class="flex justify-between items-start mb-8 max-w-7xl mx-auto">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Fire & Gas Detection</h1>
            <p class="text-zinc-500 text-sm">Smart Monitoring System • <span id="current-time">16:24:00</span></p>
        </div>
        
        <div class="flex items-center gap-4">
            <div class="relative">
                <select id="device-selector" class="bg-white border border-slate-200 text-sm text-slate-700 rounded-lg px-4 py-2 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-slate-300">
                    <option value="1">Main Hall</option>
                    <option value="2">Kitchen</option>
                    <option value="3">Warehouse</option>
                    <option value="4">Server Room</option>
                </select>
                <i data-lucide="chevron-down" class="absolute right-3 top-2.5 w-4 h-4 text-slate-400"></i>
            </div>
            <div id="statusBadge" class="badge-safe px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                <span class="w-2 h-2 bg-green-500 rounded-full"></span> SAFE
            </div>
        </div>
    </header>

    <!-- MAIN GRID -->
    <main class="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
        
        <!-- LEFT COLUMN: VIEWPORT & TELEMETRY -->
        <div class="col-span-12 lg:col-span-8 space-y-6">
            
            <!-- 3D Viewport Placeholder -->
            <div class="glass-card overflow-hidden">
                <div class="p-4 border-b border-slate-200 flex justify-between items-center">
                    <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">3D Digital Twin Viewport</span>
                    <span class="text-[10px] text-green-500 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> WebGL Ready
                    </span>
                </div>
                <div id="canvas-container" class="h-100 flex flex-col items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 relative group">
                    <i data-lucide="layers" class="w-12 h-12 text-slate-400 mb-4 group-hover:text-slate-500 transition-colors"></i>
                    <p class="text-slate-600 text-sm font-medium">Three.js Canvas Loading...</p>
                    <p class="text-slate-500 text-xs">Main Hall - Ready for injection</p>
                    <!-- Visual Grid Background -->
                    <div class="absolute inset-0 opacity-[0.06] pointer-events-none" style="background-image: radial-gradient(#94a3b8 1px, transparent 0); background-size: 24px 24px;"></div>
                </div>
            </div>

            <!-- Live Telemetry Chart -->
            <div class="glass-card p-6" style="display: flex; flex-direction: column; height: 380px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-shrink: 0;">
                    <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Telemetry</span>
                    <div class="flex gap-4 text-[10px] font-medium text-slate-500">
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-cyan-500"></span> Gas</span>
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Smoke</span>
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-orange-500"></span> Temp</span>
                        <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-500"></span> Flame</span>
                    </div>
                </div>
                <div style="flex: 1; position: relative; min-height: 0; width: 100%;">
                    <canvas id="chart" style="position: absolute; top: 0; left: 0; width: 100% !important; height: 100% !important;"></canvas>
                </div>
            </div>
        </div>

        <!-- RIGHT COLUMN: METRICS & CONFIG -->
        <div class="col-span-12 lg:col-span-4 space-y-6">
            
            <section>
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Live Metrics</h3>
                <div class="grid grid-cols-2 gap-4">
                    <!-- Metric Card -->
                    <div class="glass-card p-4 hover:border-slate-300 transition-colors">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-[10px] text-slate-500 font-medium">Gas Level</span>
                            <div style="width: 60px; height: 20px;"><canvas id="spark-gas"></canvas></div>
                        </div>
                        <div class="flex items-baseline gap-1 mb-3">
                            <span class="text-2xl font-bold mono" id="val-gas-large">244</span>
                            <span class="text-[10px] text-slate-500">ppm</span>
                        </div>
                        <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                            <div class="bg-green-500 h-full w-[45%]" id="bar-gas-large"></div>
                        </div>
                        <div class="flex justify-between text-[9px] text-slate-500 mono">
                            <span>0</span>
                            <span id="threshold-gas-large">Threshold: 250</span>
                        </div>
                    </div>

                    <div class="glass-card p-4 hover:border-slate-300 transition-colors">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-[10px] text-slate-500 font-medium">Smoke Level</span>
                            <div style="width: 60px; height: 20px;"><canvas id="spark-smoke"></canvas></div>
                        </div>
                        <div class="flex items-baseline gap-1 mb-3">
                            <span class="text-2xl font-bold mono" id="val-smoke-large">81</span>
                            <span class="text-[10px] text-slate-500">ppm</span>
                        </div>
                        <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                            <div class="bg-green-500 h-full w-[30%]" id="bar-smoke-large"></div>
                        </div>
                        <div class="flex justify-between text-[9px] text-slate-500 mono">
                            <span>0</span>
                            <span id="threshold-smoke-large">Threshold: 120</span>
                        </div>
                    </div>

                    <div class="glass-card p-4 hover:border-slate-300 transition-colors">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-[10px] text-slate-500 font-medium">Temperature</span>
                            <div style="width: 60px; height: 20px;"><canvas id="spark-temp"></canvas></div>
                        </div>
                        <div class="flex items-baseline gap-1 mb-3">
                            <span class="text-2xl font-bold mono text-green-400" id="val-temp-large">24</span>
                            <span class="text-[10px] text-slate-500">°C</span>
                        </div>
                        <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                            <div class="bg-green-500 h-full w-[50%]" id="bar-temp-large"></div>
                        </div>
                        <div class="flex justify-between text-[9px] text-slate-500 mono">
                            <span>0</span>
                            <span id="threshold-temp-large">Threshold: 40</span>
                        </div>
                    </div>

                    <div class="glass-card p-4 hover:border-slate-300 transition-colors">
                        <div class="flex justify-between items-start mb-1">
                            <span class="text-[10px] font-medium text-red-500">Flame</span>
                            <div style="width: 60px; height: 20px;"><canvas id="spark-flame"></canvas></div>
                        </div>
                        <div class="flex items-baseline gap-1 mb-3">
                            <span class="text-2xl font-bold mono text-red-500" id="val-flame-large">118</span>
                            <span class="text-[10px] text-slate-500">raw</span>
                        </div>
                        <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1">
                            <div class="bg-red-500 h-full w-[20%]" id="bar-flame-large"></div>
                        </div>
                        <div class="flex justify-between text-[9px] text-slate-500 mono">
                            <span>0</span>
                            <span id="threshold-flame-large">Threshold: 500</span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="glass-card p-6">
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Threshold Configuration</h3>
                <div class="space-y-6">
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-medium">Gas Trigger</span>
                            <span class="text-xs font-bold mono" id="th-gas-val">250</span> <span class="text-xs font-bold mono">ppm</span>
                        </div>
                        <input type="range" id="range-gas" class="range-gas w-full" value="250" min="100" max="1000">
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-medium">Smoke Trigger</span>
                            <span class="text-xs font-bold mono" id="th-smoke-val">120</span> <span class="text-xs font-bold mono">ppm</span>
                        </div>
                        <input type="range" id="range-smoke" class="range-smoke w-full" value="120" min="50" max="300">
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-medium">Temp Trigger</span>
                            <span class="text-xs font-bold mono" id="th-temp-val">40</span> <span class="text-xs font-bold mono">°C</span>
                        </div>
                        <input type="range" id="range-temp" class="range-temp w-full" value="40" min="20" max="100">
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-xs font-medium">Flame Trigger</span>
                            <span class="text-xs font-bold mono" id="th-flame-val">500</span> <span class="text-xs font-bold mono">raw</span>
                        </div>
                        <input type="range" id="range-flame" class="range-flame w-full" value="500" min="100" max="1000">
                    </div>
                    <button onclick="saveSettings()" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 rounded-lg mt-4 transition-colors">
                        Save Settings
                    </button>
                </div>
            </section>

            <!-- Worker Info -->
            <section class="glass-card p-5">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Background Worker</span>
                </div>
                <div id="workerPanel" class="flex items-center gap-3">
                    <div class="flex items-center gap-2 text-xs font-medium text-green-500 bg-green-500/5 px-3 py-2 rounded-md border border-green-500/10 w-full">
                        <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
                    </div>
                    <div class="text-[10px] text-slate-500 text-right w-full">
                        Last Heartbeat<br><span class="text-slate-700">2 seconds ago</span>
                    </div>
                </div>
            </section>
        </div>

        <!-- ACTIVITY LOGS: FULL WIDTH -->
        <div class="col-span-12 space-y-6">
            <section class="glass-card p-6">
                <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Activity Logs</h3>
                <div id="logList" class="space-y-0 max-h-62.5 overflow-y-auto">
                    <div class="log-item py-3 border-b border-slate-200 last:border-b-0">
                        <div class="text-sm text-slate-700">Loading activity logs...</div>
                        <div class="text-xs text-slate-500 mt-1">Waiting for first update</div>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <script>
        // Initialize Lucide Icons
        lucide.createIcons();

        // Time Display
        setInterval(() => {
            document.getElementById('current-time').innerText = new Date().toLocaleTimeString('en-GB');
        }, 1000);

        // Device selector listener
        document.getElementById('device-selector').addEventListener('change', (e) => {
            selectDevice(parseInt(e.target.value));
        });
    </script>
    <script src="/dashboard.js"></script>
</body>
</html>