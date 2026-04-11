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

<!-- Sidebar Menu -->
<div id="sidebar" class="sidebar">
    <div class="sidebar-header">
        <h3>Pilih Perangkat</h3>
        <button onclick="toggleMenu()" class="close-btn">&times;</button>
    </div>
    <ul class="device-list">
        <li onclick="selectDevice(1)">📡 Device 1 (Main Hall)</li>
        <li onclick="selectDevice(2)">📡 Device 2 (Kitchen)</li>
        <li onclick="selectDevice(3)">📡 Device 3 (Warehouse)</li>
        <li onclick="selectDevice(4)">📡 Device 4 (Server Room)</li>
    </ul>
</div>

<header id="mainHeader">
  <div class="logo">
    <button onclick="toggleMenu()" class="menu-trigger">☰</button>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    IoT Monitor - <span id="currentDeviceTitle">Device 1</span>
    <span class="badge">SIMULATOR</span>
  </div>
  <div class="header-right">
    <div class="live-dot" id="liveIndicator"><div class="dot"></div><span id="statusText">LIVE</span></div>
    <button class="btn" id="toggleBtn" onclick="toggleSimulation()">⏸ Pause</button>
  </div>
</header>

<div class="container">
  <!-- Sensor Cards -->
  <div class="grid-4">
    <div class="card" id="card-gas">
      <div class="card-title"><span>💨 Gas</span><div class="alert-dot" id="alert-gas" style="display:none"><span class="ping"></span><span></span></div></div>
      <div><span class="sensor-value" id="val-gas" style="color:var(--cyan)">0</span><span class="sensor-unit">ppm</span></div>
      <div class="progress-bar"><div class="progress-fill" id="bar-gas" style="background:var(--cyan);width:0%"></div></div>
      <div class="progress-label"><span>0</span><span id="max-gas">--</span></div>
    </div>
    <div class="card" id="card-smoke">
      <div class="card-title"><span>🌫️ Asap</span><div class="alert-dot" id="alert-smoke" style="display:none"><span class="ping"></span><span></span></div></div>
      <div><span class="sensor-value" id="val-smoke" style="color:var(--purple)">0</span><span class="sensor-unit">ppm</span></div>
      <div class="progress-bar"><div class="progress-fill" id="bar-smoke" style="background:var(--purple);width:0%"></div></div>
      <div class="progress-label"><span>0</span><span id="max-smoke">--</span></div>
    </div>
    <div class="card" id="card-temp">
      <div class="card-title"><span>🌡️ Suhu</span><div class="alert-dot" id="alert-temp" style="display:none"><span class="ping"></span><span></span></div></div>
      <div><span class="sensor-value" id="val-temp" style="color:var(--red)">0</span><span class="sensor-unit">°C</span></div>
      <div class="progress-bar"><div class="progress-fill" id="bar-temp" style="background:var(--red);width:0%"></div></div>
      <div class="progress-label"><span>0</span><span id="max-temp">--</span></div>
    </div>
    <div class="card" id="card-flame">
      <div class="card-title"><span>🔥 Flame</span><div class="alert-dot" id="alert-flame" style="display:none"><span class="ping"></span><span></span></div></div>
      <div><span class="sensor-value" id="val-flame" style="color:#fbbf24">0</span><span class="sensor-unit">raw</span></div>
      <div class="progress-bar"><div class="progress-fill" id="bar-flame" style="background:#fbbf24;width:0%"></div></div>
      <div class="progress-label"><span>0</span><span id="max-flame">--</span></div>
    </div>
  </div>

  <div class="card chart-container">
    <div class="card-title">📈 Live Trend - <span id="chartDeviceName">Device 1</span></div>
    <canvas id="chart"></canvas>
  </div>

  <div class="grid-3">
    <!-- Logs -->
    <div class="card">
      <div class="card-title">📋 Activity Logs</div>
      <div class="log-list" id="logList"></div>
    </div>

    <!-- Threshold Settings -->
    <div class="card">
      <div class="card-title">⚙️ Threshold Settings</div>
      <form id="settingsForm">
        <div class="threshold-item">
          <div class="threshold-header"><span>Batas Gas</span><span class="threshold-val" id="th-gas-val">--</span></div>
          <input type="range" class="range-gas" id="range-gas" min="50" max="1000">
        </div>
        <div class="threshold-item">
          <div class="threshold-header"><span>Batas Asap</span><span class="threshold-val" id="th-smoke-val">--</span></div>
          <input type="range" class="range-smoke" id="range-smoke" min="50" max="800">
        </div>
        <div class="threshold-item">
          <div class="threshold-header"><span>Batas Suhu</span><span class="threshold-val" id="th-temp-val">--</span></div>
          <input type="range" class="range-temp" id="range-temp" min="20" max="80">
        </div>
        <div class="threshold-item">
          <div class="threshold-header"><span>Batas Flame</span><span class="threshold-val" id="th-flame-val">--</span></div>
          <input type="range" class="range-flame" id="range-flame" min="100" max="1000">
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%">Save Settings</button>
      </form>
    </div>

    <!-- Workers -->
    <div class="card">
      <div class="card-title">
        👷 Worker Status
        <span id="workerCount" class="badge worker-badge status-offline">0</span>
      </div>
      <div id="workerList" class="worker-list-container"></div>
      <button id="clearWorkerBtn" onclick="clearWorkerStatus()" class="btn btn-secondary" style="width:100%;margin-top:10px;font-size:12px">Clear Worker</button>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</body>
</html>