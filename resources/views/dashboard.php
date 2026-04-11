<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Safety System Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container-fluid py-4">
    <div class="row mb-4">
        <div class="col-12">
            <h2 class="fw-bold">🚨 Smart Safety Control Panel</h2>
            <div id="emergencyBadge" class="badge bg-success fs-5 p-2 w-100 mt-2">STATUS GEDUNG: AMAN</div>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-md-8">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-dark text-white">📡 Live Sensor Data</div>
                <div class="card-body overflow-auto" style="max-height: 400px;">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Waktu</th>
                                <th>Lokasi</th>
                                <th>Gas</th>
                                <th>Asap</th>
                                <th>Suhu</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="sensorTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="col-md-4">
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-primary text-white">⚙️ Threshold Settings</div>
                <div class="card-body">
                    <form id="settingsForm">
                        <div class="mb-2">
                            <label class="form-label">Mode Operasi</label>
                            <select id="setMode" class="form-select">
                                <option value="auto">Otomatis (Auto-Recovery)</option>
                                <option value="manual">Manual Only</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <label class="form-label">Batas Gas</label>
                            <input type="number" id="setGas" class="form-control" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label">Batas Asap</label>
                            <input type="number" id="setSmoke" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Batas Suhu (°C)</label>
                            <input type="number" id="setTemp" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Simpan Pengaturan</button>
                    </form>
                </div>
            </div>

            <div class="card shadow-sm">
                <div class="card-header bg-danger text-white">🕹️ Manual Override</div>
                <div class="card-body">
                    <p class="fw-bold mb-1">Exhaust Fan</p>
                    <div class="btn-group w-100 mb-3">
                        <button onclick="sendManualCommand('exhaust_fan', 'START')" class="btn btn-outline-danger">START</button>
                        <button onclick="sendManualCommand('exhaust_fan', 'STOP')" class="btn btn-outline-secondary">STOP</button>
                    </div>
                    <p class="fw-bold mb-1">Alarm Buzzer</p>
                    <div class="btn-group w-100">
                        <button onclick="sendManualCommand('buzzer', 'START')" class="btn btn-outline-danger">START</button>
                        <button onclick="sendManualCommand('buzzer', 'STOP')" class="btn btn-outline-secondary">STOP</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-md-8">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-secondary text-white">📋 Activity Logs</div>
                <div class="card-body overflow-auto" style="max-height: 250px;">
                    <ul id="logList" class="list-group list-group-flush"></ul>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-info text-white">💻 Worker Status</div>
                <div class="card-body text-center d-flex flex-column justify-content-center">
                    <h5 id="workerName" class="fw-bold">Menunggu...</h5>
                    <p id="workerState" class="text-muted mb-0">Offline</p>
                    <small id="workerTime" class="text-secondary">-</small>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    const API_DASHBOARD = '/api/dashboard/data';
    const API_SETTINGS = '/api/settings';
    const API_ACTUATOR = '/api/actuator';
    let isFirstLoad = true;

    async function fetchDashboardData() {
        try {
            const response = await fetch(API_DASHBOARD);
            const data = await response.json();
            if (data.status === 'success') {
                updateSensorTable(data.sensor_data);
                updateLogs(data.activity_logs);
                updateWorkerStatus(data.worker_status);
                updateEmergencyBadge(data.emergency_status);
                if (isFirstLoad) {
                    populateSettings(data.settings);
                    isFirstLoad = false;
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    function updateSensorTable(data) {
        const tbody = document.getElementById('sensorTableBody');
        tbody.innerHTML = '';
        data.forEach(item => {
            const time = new Date(item.created_at).toLocaleTimeString();
            const badgeClass = item.status_indikasi === 'BAHAYA' ? 'bg-danger' : 'bg-success';
            const row = `<tr>
                <td>${time}</td>
                <td class="fw-bold">${item.device_name}</td>
                <td>${item.gas_value}</td>
                <td>${item.smoke_value}</td>
                <td>${item.temperature}</td>
                <td><span class="badge ${badgeClass}">${item.status_indikasi}</span></td>
            </tr>`;
            tbody.innerHTML += row;
        });
    }

    function updateLogs(logs) {
        const list = document.getElementById('logList');
        list.innerHTML = '';
        logs.forEach(log => {
            const time = new Date(log.created_at).toLocaleTimeString();
            const icon = log.action_type === 'SYSTEM_UPDATE' ? '⚙️' : '🔔';
            list.innerHTML += `<li class="list-group-item"><small class="text-muted">[${time}]</small> ${icon} ${log.description}</li>`;
        });
    }

    function updateWorkerStatus(worker) {
        if (worker) {
            document.getElementById('workerName').innerText = worker.component_name;
            document.getElementById('workerState').innerText = worker.current_state;
            document.getElementById('workerTime').innerText = "Last beat: " + new Date(worker.last_heartbeat).toLocaleTimeString();
        }
    }

    function updateEmergencyBadge(status) {
        const badge = document.getElementById('emergencyBadge');
        if (status === 'BAHAYA') {
            badge.className = 'badge bg-danger fs-5 p-2 w-100 mt-2 blink_me';
            badge.innerText = '⚠️ STATUS GEDUNG: BAHAYA (EVAKUASI) ⚠️';
        } else {
            badge.className = 'badge bg-success fs-5 p-2 w-100 mt-2';
            badge.innerText = '✅ STATUS GEDUNG: AMAN';
        }
    }

    function populateSettings(settings) {
        document.getElementById('setMode').value = settings.mode;
        document.getElementById('setGas').value = settings.gas_threshold;
        document.getElementById('setSmoke').value = settings.smoke_threshold;
        document.getElementById('setTemp').value = settings.temperature_threshold;
    }

    document.getElementById('settingsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            mode: document.getElementById('setMode').value,
            gas_threshold: document.getElementById('setGas').value,
            smoke_threshold: document.getElementById('setSmoke').value,
            temperature_threshold: document.getElementById('setTemp').value
        };

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        await fetch(API_SETTINGS, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken 
            },
            body: JSON.stringify(payload)
        });
        alert('Pengaturan berhasil disimpan!');
    });

    async function sendManualCommand(target, action) {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        await fetch(API_ACTUATOR, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ target_device: target, action: action })
        });
    }

    setInterval(fetchDashboardData, 2000);
</script>

<style>
    .blink_me { animation: blinker 1s linear infinite; }
    @keyframes blinker { 50% { opacity: 0; } }
</style>
</body>
</html>