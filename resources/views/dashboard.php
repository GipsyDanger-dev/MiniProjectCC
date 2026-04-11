<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Safety System Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #e0e0e0;
            padding: 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1600px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding: 25px;
            background: rgba(255, 255, 255, 0.05);
            border-left: 4px solid #00d4ff;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }

        .header h1 {
            font-size: 2em;
            font-weight: 600;
        }

        .header-right {
            text-align: right;
        }

        .system-status {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 0.95em;
        }

        .status-aman {
            background: rgba(76, 175, 80, 0.2);
            color: #4caf50;
            border: 1px solid #4caf50;
        }

        .status-bahaya {
            background: rgba(244, 67, 54, 0.2);
            color: #f44336;
            border: 1px solid #f44336;
        }

        .mode-indicator {
            margin-top: 8px;
            font-size: 0.85em;
            color: #aaa;
        }

        .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .panel {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            padding: 20px;
            backdrop-filter: blur(10px);
        }

        .panel-title {
            font-size: 1.1em;
            font-weight: 600;
            margin-bottom: 18px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            color: #00d4ff;
        }

        .device-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            padding: 16px;
            margin-bottom: 12px;
        }

        .device-card.danger {
            background: rgba(244, 67, 54, 0.1);
            border: 1px solid rgba(244, 67, 54, 0.3);
        }

        .device-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .device-name {
            font-weight: 600;
            color: #fff;
        }

        .device-status-badge {
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: 500;
        }

        .badge-aman {
            background: rgba(76, 175, 80, 0.3);
            color: #81c784;
        }

        .badge-bahaya {
            background: rgba(244, 67, 54, 0.3);
            color: #ef5350;
        }

        .badge-online {
            background: rgba(0, 212, 255, 0.2);
            color: #00d4ff;
            margin-left: 8px;
        }

        .badge-offline {
            background: rgba(128, 128, 128, 0.2);
            color: #999;
            margin-left: 8px;
        }

        .sensor-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
        }

        .sensor-item {
            background: rgba(0, 0, 0, 0.2);
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }

        .sensor-label {
            font-size: 0.8em;
            color: #999;
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .sensor-value {
            font-size: 1.3em;
            font-weight: 600;
            color: #00d4ff;
        }

        .sensor-unit {
            font-size: 0.75em;
            color: #666;
        }

        .timestamp {
            font-size: 0.8em;
            color: #666;
            margin-top: 8px;
        }

        .settings-group {
            margin-bottom: 18px;
        }

        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 4px;
        }

        .setting-label {
            font-weight: 500;
        }

        .setting-input {
            width: 120px;
            padding: 8px 12px;
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            color: #fff;
            border-radius: 4px;
            font-size: 0.9em;
        }

        .setting-input:focus {
            outline: none;
            background: rgba(0, 212, 255, 0.15);
            border-color: #00d4ff;
        }

        .mode-selector {
            display: flex;
            gap: 10px;
            margin-bottom: 18px;
        }

        .mode-option {
            flex: 1;
            padding: 12px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.05);
            transition: all 0.3s;
            font-weight: 500;
        }

        .mode-option.active {
            background: rgba(0, 212, 255, 0.2);
            border-color: #00d4ff;
            color: #00d4ff;
        }

        .mode-option:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        .button-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 12px;
        }

        .button-group-full {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
        }

        .btn {
            padding: 12px 16px;
            border: none;
            border-radius: 4px;
            font-weight: 500;
            font-size: 0.9em;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn-primary {
            background: rgba(0, 212, 255, 0.2);
            color: #00d4ff;
            border: 1px solid #00d4ff;
        }

        .btn-primary:hover {
            background: rgba(0, 212, 255, 0.3);
        }

        .btn-success {
            background: rgba(76, 175, 80, 0.2);
            color: #81c784;
            border: 1px solid #81c784;
        }

        .btn-success:hover {
            background: rgba(76, 175, 80, 0.3);
        }

        .btn-danger {
            background: rgba(244, 67, 54, 0.2);
            color: #ef5350;
            border: 1px solid #ef5350;
        }

        .btn-danger:hover {
            background: rgba(244, 67, 54, 0.3);
        }

        .btn-warning {
            background: rgba(255, 152, 0, 0.2);
            color: #ffb74d;
            border: 1px solid #ffb74d;
        }

        .btn-warning:hover {
            background: rgba(255, 152, 0, 0.3);
        }

        .btn-full {
            grid-column: 1 / -1;
        }

        .log-item {
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border-left: 3px solid #00d4ff;
            border-radius: 4px;
            margin-bottom: 10px;
            font-size: 0.9em;
        }

        .log-item.command {
            border-left-color: #81c784;
        }

        .log-item.danger {
            border-left-color: #ef5350;
        }

        .log-time {
            font-size: 0.8em;
            color: #666;
            margin-top: 6px;
        }

        .scrollable {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 10px;
        }

        .scrollable::-webkit-scrollbar {
            width: 6px;
        }

        .scrollable::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
        }

        .scrollable::-webkit-scrollbar-thumb {
            background: rgba(0, 212, 255, 0.3);
            border-radius: 3px;
        }

        .scrollable::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 212, 255, 0.5);
        }

        .empty-state {
            text-align: center;
            color: #666;
            padding: 30px 20px;
        }

        .control-button-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .fan-control {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 8px;
        }

        .fan-control .btn {
            padding: 10px;
            font-size: 0.85em;
        }

        @media (max-width: 1400px) {
            .grid-3 {
                grid-template-columns: 1fr 1fr;
            }
        }

        @media (max-width: 768px) {
            .grid-2, .grid-3 {
                grid-template-columns: 1fr;
            }
            .header {
                flex-direction: column;
                align-items: flex-start;
            }
            .header-right {
                margin-top: 15px;
                text-align: left;
            }
        }

        .success-message, .error-message {
            padding: 12px 16px;
            border-radius: 4px;
            margin-bottom: 15px;
            display: none;
            font-weight: 500;
        }

        .success-message {
            background: rgba(76, 175, 80, 0.2);
            color: #81c784;
            border: 1px solid #81c784;
        }

        .error-message {
            background: rgba(244, 67, 54, 0.2);
            color: #ef5350;
            border: 1px solid #ef5350;
        }
    </style>
</head>
<body>

<div class="container">
    <!-- Header -->
    <div class="header">
        <div>
            <h1>Smart Safety System</h1>
            <p style="color: #999; margin-top: 5px;">Real-time Monitoring dan Control</p>
        </div>
        <div class="header-right">
            <div class="system-status status-aman" id="overallStatus">
                Status: AMAN
            </div>
            <div class="mode-indicator">
                Mode: <span id="modeIndicator">AUTO</span>
            </div>
        </div>
    </div>

    <div class="success-message" id="successMsg"></div>
    <div class="error-message" id="errorMsg"></div>

    <!-- Main Grid -->
    <div class="grid-3">
        <!-- Panel 1: Monitoring Data -->
        <div class="panel">
            <div class="panel-title">Monitoring Sensor Terbaru</div>
            <div class="scrollable" id="monitoringPanel">
                <div class="empty-state">Memuat data...</div>
            </div>
        </div>

        <!-- Panel 2: System Settings & Manual Control -->
        <div class="panel">
            <div class="panel-title">Pengaturan Sistem</div>
            
            <div class="settings-group">
                <label style="font-weight: 500; color: #00d4ff; font-size: 0.95em; margin-bottom: 10px; display: block;">Mode Operasi</label>
                <div class="mode-selector">
                    <div class="mode-option active" id="modeAuto" onclick="setMode('auto')">AUTO</div>
                    <div class="mode-option" id="modeManual" onclick="setMode('manual')">MANUAL</div>
                </div>
            </div>

            <!-- Manual Control Panel (Hidden by default) -->
            <div id="manualControlPanel" style="display: none; margin-bottom: 18px; padding: 12px; background: rgba(255, 212, 0, 0.1); border-radius: 4px; border: 1px solid rgba(255, 212, 0, 0.3);">
                <label style="font-weight: 500; color: #ffd54f; font-size: 0.95em; margin-bottom: 10px; display: block;">Kontrol Manual Device</label>
                
                <div class="setting-item" style="margin-bottom: 12px;">
                    <select id="deviceSelector" style="width: 100%; padding: 8px; background: rgba(0,0,0,0.3); color: #fff; border: 1px solid #ffd54f; border-radius: 4px;">
                        <option value="1">Device 1 - Ruangan A</option>
                        <option value="2">Device 2 - Ruangan B</option>
                        <option value="3">Device 3 - Ruangan C</option>
                    </select>
                </div>

                <p style="font-size: 0.85em; color: #999; margin-bottom: 8px;">Exhaust</p>
                <div class="button-group" style="margin-bottom: 12px;">
                    <button class="btn btn-primary" onclick="controlActuator('FAN_LOW')">Low</button>
                    <button class="btn btn-primary" onclick="controlActuator('FAN_MEDIUM')">Med</button>
                </div>
                <div class="button-group" style="margin-bottom: 12px;">
                    <button class="btn btn-primary" onclick="controlActuator('FAN_HIGH')">High</button>
                    <button class="btn btn-danger" onclick="controlActuator('FAN_OFF')">Off</button>
                </div>

                <p style="font-size: 0.85em; color: #999; margin-bottom: 8px;">Alert</p>
                <div class="button-group">
                    <button class="btn btn-success" onclick="controlActuator('ALARM_ON')">ON</button>
                    <button class="btn btn-danger" onclick="controlActuator('ALARM_OFF')">OFF</button>
                </div>
            </div>

            <div class="settings-group">
                <label style="font-weight: 500; color: #00d4ff; font-size: 0.95em; margin-bottom: 10px; display: block;">Threshold Sensor</label>
                <div class="setting-item">
                    <div class="setting-label">Gas (ppm)</div>
                    <input type="number" class="setting-input" id="gasThreshold" placeholder="300" value="300">
                </div>
                <div class="setting-item">
                    <div class="setting-label">Smoke (ppm)</div>
                    <input type="number" class="setting-input" id="smokeThreshold" placeholder="200" value="200">
                </div>
                <div class="setting-item">
                    <div class="setting-label">Temper (C)</div>
                    <input type="number" class="setting-input" id="tempThreshold" placeholder="45" value="45">
                </div>
            </div>

            <button class="btn btn-success btn-full" onclick="saveSettings()">Simpan Pengaturan</button>
            <button class="btn btn-warning btn-full" onclick="resetThreshold()" style="margin-top: 10px;">Reset ke Default</button>
        </div>

        <!-- Panel 3: Emergency & Reset -->
        <div class="panel">
            <div class="panel-title">Kontrol Emergency</div>
            
            <div style="margin-bottom: 18px;">
                <p style="font-size: 0.9em; color: #999; margin-bottom: 12px;">
                    Trigger emergency untuk override semua sistem dan activate fan + alarm maksimal.
                </p>
                <button class="btn btn-danger btn-full" onclick="triggerEmergency()">Aktifkan Emergency</button>
            </div>

            <div style="margin-bottom: 18px;">
                <p style="font-size: 0.9em; color: #999; margin-bottom: 12px;">
                    Reset sistem ke kondisi normal dan matikan semua alarm.
                </p>
                <button class="btn btn-warning btn-full" onclick="resetAll()">Reset Sistem</button>
            </div>

            <div style="background: rgba(255, 152, 0, 0.1); padding: 12px; border-radius: 4px; border-left: 3px solid #ffb74d;">
                <p style="font-size: 0.85em; color: #ffb74d;">
                    Emergency Status: <strong id="emergencyStatus">OFF</strong>
                </p>
            </div>
        </div>
    </div>

    <!-- Activity Log Panel -->
    <div class="panel" style="margin-bottom: 20px;">
        <div class="panel-title">Log Aktivitas Terbaru</div>
        <div class="scrollable" id="logPanel">
            <div class="empty-state">Memuat log...</div>
        </div>
    </div>
</div>

<script>
    let selectedDevice = 1;
    let autoRefresh = true;

    function showMessage(msg, type = 'success') {
        const el = type === 'success' ? document.getElementById('successMsg') : document.getElementById('errorMsg');
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(() => {
            el.style.display = 'none';
        }, 3000);
    }

    async function loadDashboard() {
        try {
            const res = await fetch('/api/dashboard');
            if (!res.ok) throw new Error('Failed to load dashboard');
            
            const data = await res.json();
            
            updateMonitoringPanel(data.latest_data);
            updateLogPanel(data.logs);
            updateOverallStatus(data.latest_data, data.settings);
            // JANGAN update settings untuk menghindari reset mode selector saat user edit
            // updateSettings(data.settings);
        } catch (e) {
            console.error('Error loading dashboard:', e);
        }
    }

    function updateMonitoringPanel(latestData) {
        const panel = document.getElementById('monitoringPanel');
        if (!latestData || Object.keys(latestData).length === 0) {
            panel.innerHTML = '<div class="empty-state">Belum ada data sensor</div>';
            return;
        }

        let html = '';
        for (const [deviceId, records] of Object.entries(latestData)) {
            if (records.length === 0) continue;
            const latest = records[0];
            const isDanger = latest.status_indikasi === 'BAHAYA';
            
            html += `
            <div class="device-card ${isDanger ? 'danger' : ''}">
                <div class="device-header">
                    <div class="device-name">Device ${latest.device_id}</div>
                    <div>
                        <span class="device-status-badge ${isDanger ? 'badge-bahaya' : 'badge-aman'}">
                            ${isDanger ? 'BAHAYA' : 'AMAN'}
                        </span>
                    </div>
                </div>
                <div class="sensor-grid">
                    <div class="sensor-item">
                        <div class="sensor-label">Gas</div>
                        <div class="sensor-value">${latest.gas_value}<span class="sensor-unit"> ppm</span></div>
                    </div>
                    <div class="sensor-item">
                        <div class="sensor-label">Smoke</div>
                        <div class="sensor-value">${latest.smoke_value}<span class="sensor-unit"> ppm</span></div>
                    </div>
                    <div class="sensor-item">
                        <div class="sensor-label">Suhu</div>
                        <div class="sensor-value">${latest.temperature}<span class="sensor-unit"> C</span></div>
                    </div>
                </div>
                <div class="timestamp">Terakhir diupdate: ${new Date(latest.created_at).toLocaleTimeString('id-ID')}</div>
            </div>`;
        }
        panel.innerHTML = html;
    }

    function updateLogPanel(logs) {
        const panel = document.getElementById('logPanel');
        if (!logs || logs.length === 0) {
            panel.innerHTML = '<div class="empty-state">Belum ada log aktivitas</div>';
            return;
        }

        let html = '';
        for (const log of logs) {
            const isDanger = log.message.includes('BAHAYA');
            html += `
            <div class="log-item ${isDanger ? 'danger' : 'command'}">
                <div>${log.message}</div>
                <div class="log-time">${new Date(log.created_at).toLocaleString('id-ID')}</div>
            </div>`;
        }
        panel.innerHTML = html;
    }

    function updateOverallStatus(latestData, settings) {
        let isDanger = false;
        for (const records of Object.values(latestData)) {
            if (records.some(r => r.status_indikasi === 'BAHAYA')) {
                isDanger = true;
                break;
            }
        }

        const statusEl = document.getElementById('overallStatus');
        statusEl.textContent = isDanger ? 'Status: BAHAYA' : 'Status: AMAN';
        statusEl.className = `system-status ${isDanger ? 'status-bahaya' : 'status-aman'}`;

        document.getElementById('modeIndicator').textContent = settings ? settings.mode.toUpperCase() : 'AUTO';
        document.getElementById('emergencyStatus').textContent = settings?.emergency_active ? 'ON' : 'OFF';
    }

    function updateSettings(settings) {
        if (settings) {
            document.getElementById('gasThreshold').value = settings.gas_threshold;
            document.getElementById('smokeThreshold').value = settings.smoke_threshold;
            document.getElementById('tempThreshold').value = settings.temperature_threshold;
            
            const modeAuto = document.getElementById('modeAuto');
            const modeManual = document.getElementById('modeManual');
            modeAuto.classList.toggle('active', settings.mode === 'auto');
            modeManual.classList.toggle('active', settings.mode === 'manual');
            
            // Show/hide manual control panel
            const manualPanel = document.getElementById('manualControlPanel');
            manualPanel.style.display = settings.mode === 'manual' ? 'block' : 'none';
        }
    }

    function setMode(mode) {
        document.getElementById('modeAuto').classList.toggle('active', mode === 'auto');
        document.getElementById('modeManual').classList.toggle('active', mode === 'manual');
        
        // Show/hide manual control panel
        const manualPanel = document.getElementById('manualControlPanel');
        manualPanel.style.display = mode === 'manual' ? 'block' : 'none';
    }

    async function saveSettings() {
        try {
            const mode = document.getElementById('modeAuto').classList.contains('active') ? 'auto' : 'manual';
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    gas_threshold: parseFloat(document.getElementById('gasThreshold').value),
                    smoke_threshold: parseFloat(document.getElementById('smokeThreshold').value),
                    temperature_threshold: parseFloat(document.getElementById('tempThreshold').value),
                    mode: mode
                })
            });

            if (res.ok) {
                showMessage('Pengaturan berhasil disimpan', 'success');
                loadDashboard();
            } else {
                showMessage('Gagal menyimpan pengaturan', 'error');
            }
        } catch (e) {
            showMessage('Error: ' + e.message, 'error');
        }
    }

    function resetThreshold() {
        if (!confirm('Reset threshold ke nilai default (Gas: 300, Smoke: 200, Temp: 45)?')) {
            return;
        }

        const defaultGas = 300;
        const defaultSmoke = 200;
        const defaultTemperature = 45;

        document.getElementById('gasThreshold').value = defaultGas;
        document.getElementById('smokeThreshold').value = defaultSmoke;
        document.getElementById('tempThreshold').value = defaultTemperature;

        saveSettings();
    }

    async function controlActuator(action) {
        try {
            const deviceId = parseInt(document.getElementById('deviceSelector').value);
            const res = await fetch('/api/actuator', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    device_id: deviceId,
                    action: action
                })
            });

            if (res.ok) {
                showMessage(`Perintah ${action} telah dikirim ke Device ${deviceId}`, 'success');
                setTimeout(loadDashboard, 300);
            } else {
                showMessage('Gagal mengirim perintah', 'error');
            }
        } catch (e) {
            showMessage('Error: ' + e.message, 'error');
        }
    }

    async function triggerEmergency() {
        if (!confirm('Apakah Anda yakin ingin mengaktifkan mode EMERGENCY? Ini akan mengaktifkan semua sistem keselamatan maksimal.')) {
            return;
        }
        
        try {
            // Send EMERGENCY ke semua device
            for (let i = 1; i <= 3; i++) {
                await fetch('/api/actuator', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        device_id: i,
                        action: 'EMERGENCY'
                    })
                });
            }
            showMessage('Mode EMERGENCY diaktifkan untuk semua device', 'success');
            setTimeout(loadDashboard, 500);
        } catch (e) {
            showMessage('Error: ' + e.message, 'error');
        }
    }

    async function resetAll() {
        if (!confirm('Apakah Anda yakin ingin me-reset sistem?')) {
            return;
        }

        try {
            // Send RESET ke semua device
            for (let i = 1; i <= 3; i++) {
                await fetch('/api/actuator', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        device_id: i,
                        action: 'RESET'
                    })
                });
            }
            showMessage('Sistem berhasil di-reset untuk semua device', 'success');
            setTimeout(loadDashboard, 500);
        } catch (e) {
            showMessage('Error: ' + e.message, 'error');
        }
    }

    // Load dashboard on page load
    async function initDashboard() {
        // Load settings hanya sekali saat page load
        try {
            const res = await fetch('/api/dashboard');
            if (res.ok) {
                const data = await res.json();
                updateSettings(data.settings);
            }
        } catch (e) {
            console.error('Error init settings:', e);
        }
        // Load data pertama
        loadDashboard();
    }

    initDashboard();

    // Auto refresh every 3 seconds (monitoring dan log saja, tidak settings)
    setInterval(() => {
        if (autoRefresh) {
            loadDashboard();
        }
    }, 3000);
</script>

</body>
</html>