<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>IoT Monitor Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    @vite(['resources/css/style.css', 'resources/js/script.js'])
</head>
<body>

<header>
  <div class="logo">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    IoT Monitor
    <span class="badge">SIMULATOR</span>
  </div>
  <div class="header-right">
    <div class="live-dot" id="liveIndicator"><div class="dot"></div>LIVE</div>
    <button class="btn" id="toggleBtn">⏸ Pause</button>
  </div>
</header>

<div class="container">
  <!-- Sensor Cards -->
  <div class="grid-4" id="sensorCards">
    <div class="card" id="card-gas">
      <div class="card-title"><span>💨 Gas</span><div class="alert-dot" id="alert-gas" style="display:none"><span class="ping"></span><span></span></div></div>
      <div><span class="sensor-value" id="val-gas" style="color:var(--cyan)">0</span><span class="sensor-unit">ppm</span></div>
      <div class="progress-bar"><div class="progress-fill" id="bar-gas" style="background:var(--cyan);width:0%"></div></div>
      <div class="progress-label"><span>0</span><span id="max-gas">400 ppm</span></div>
    </div>
    <div class="card" id="card-smoke">
      <div class="card-title"><span>🌫️ Asap</span><div class="alert-dot" id="alert-smoke" style="display:none"><span class="ping"></span><span></span></div></div>
      <div><span class="sensor-value" id="val-smoke" style="color:var(--purple)">0</span><span class="sensor-unit">ppm</span></div>
      <div class="progress-bar"><div class="progress-fill" id="bar-smoke" style="background:var(--purple);width:0%"></div></div>
      <div class="progress-label"><span>0</span><span id="max-smoke">300 ppm</span></div>
    </div>
    <div class="card" id="card-temp">
      <div class="card-title"><span>🌡️ Suhu</span><div class="alert-dot" id="alert-temp" style="display:none"><span class="ping"></span><span></span></div></div>
      <div><span class="sensor-value" id="val-temp" style="color:var(--red)">0</span><span class="sensor-unit">°C</span></div>
      <div class="progress-bar"><div class="progress-fill" id="bar-temp" style="background:var(--red);width:0%"></div></div>
      <div class="progress-label"><span>0</span><span id="max-temp">45 °C</span></div>
    </div>
    <div class="card" id="card-flame">
      <div class="card-title"><span>🔥 Flame</span><div class="alert-dot" id="alert-flame" style="display:none"><span class="ping"></span><span></span></div></div>
      <div><span class="sensor-value" id="val-flame" style="color:#fbbf24">0</span><span class="sensor-unit">raw</span></div>
      <div class="progress-bar"><div class="progress-fill" id="bar-flame" style="background:#fbbf24;width:0%"></div></div>
      <div class="progress-label"><span>0</span><span id="max-flame">500</span></div>
    </div>
    <div class="card" id="card-humidity">
      <div class="card-title"><span>💧 Kelembaban</span></div>
      <div><span class="sensor-value" id="val-humidity" style="color:var(--blue)">0</span><span class="sensor-unit">%</span></div>
      <div class="progress-bar"><div class="progress-fill" id="bar-humidity" style="background:var(--blue);width:0%"></div></div>
      <div class="progress-label"><span>0</span><span>100 %</span></div>
    </div>
  </div>

  <!-- Chart -->
  <div class="card chart-container">
    <div class="card-title">📈 Live Sensor Trend</div>
    <canvas id="chart"></canvas>
  </div>

  <!-- Bottom Grid -->
  <div class="grid-3">
    <!-- Activity Logs -->
    <div class="card">
      <div class="card-title">📋 Activity Logs</div>
      <div class="log-list" id="logList"><p style="color:var(--muted);font-size:13px">Menunggu data...</p></div>
    </div>

    <!-- Threshold Settings -->
    <div class="card">
      <div class="card-title">⚙️ Threshold Settings</div>
      <div class="threshold-item">
        <div class="threshold-header">
          <div class="threshold-label"><span style="color:var(--cyan)">💨</span> Batas Gas</div>
          <span class="threshold-val" style="color:var(--cyan)" id="th-gas-val">400 ppm</span>
        </div>
        <input type="range" class="range-gas" id="range-gas" min="50" max="1000" step="10" value="400">
      </div>
      <div class="threshold-item">
        <div class="threshold-header">
          <div class="threshold-label"><span style="color:var(--purple)">🌫️</span> Batas Asap</div>
          <span class="threshold-val" style="color:var(--purple)" id="th-smoke-val">300 ppm</span>
        </div>
        <input type="range" class="range-smoke" id="range-smoke" min="50" max="800" step="10" value="300">
      </div>
      <div class="threshold-item">
        <div class="threshold-header">
          <div class="threshold-label"><span style="color:var(--red)">🌡️</span> Batas Suhu</div>
          <span class="threshold-val" style="color:var(--red)" id="th-temp-val">45 °C</span>
        </div>
        <input type="range" class="range-temp" id="range-temp" min="20" max="80" step="1" value="45">
      </div>
    </div>

    <!-- Worker Status -->
    <div class="card">
      <div class="workers-header card-title">
        <span>👷 Worker Status</span>
        <span class="workers-count" id="workerCount">0/0 online</span>
      </div>
      <div id="workerList"></div>
    </div>
  </div>
</div>

</body>
</html>