import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

let sensorChart;
let currentDeviceId = 1;
let refreshInterval;
let isFormFocused = false;
let isSimulationRunning = true;

// 1. Chart Init
function initChart() {
    const ctx = document.getElementById("chart").getContext("2d");
    sensorChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Gas",
                    borderColor: "#00f2ff",
                    data: [],
                    tension: 0.4,
                    pointRadius: 0,
                },
                {
                    label: "Asap",
                    borderColor: "#a855f7",
                    data: [],
                    tension: 0.4,
                    pointRadius: 0,
                },
                {
                    label: "Suhu",
                    borderColor: "#f43f5e",
                    data: [],
                    tension: 0.4,
                    pointRadius: 0,
                },
                {
                    label: "Flame",
                    borderColor: "#fbbf24",
                    data: [],
                    tension: 0.4,
                    pointRadius: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { color: "#21262d" } },
            },
        },
    });
}

// 2. Fetch Data with Device ID
async function updateDashboard() {
    // ⚠️ SKIP update jika form sedang di-focus - prevent nilai reset
    if (isFormFocused) {
        console.log("Form focused - skipping dashboard update");
        return;
    }

    try {
        const response = await fetch(
            `/api/dashboard/data?device_id=${currentDeviceId}`,
        );
        const data = await response.json();

        if (data.status === "success") {
            // Selalu sync threshold UI setiap kali ada update
            syncThresholdUI(data.settings);
            refreshUI(data);
        }
    } catch (error) {
        console.error("Error polling:", error);
    }
}

function refreshUI(data) {
    const latest = data.sensor_data[0];
    const settings = data.settings;

    if (latest) {
        updateCard("gas", latest.gas_value, settings.gas_threshold);
        updateCard("smoke", latest.smoke_value, settings.smoke_threshold);
        updateCard("temp", latest.temperature, settings.temp_threshold);
        updateCard("flame", latest.flame_value, settings.flame_threshold, true);        
        // Update max threshold display di progress labels
        document.getElementById("max-gas").innerText = settings.gas_threshold;
        document.getElementById("max-smoke").innerText = settings.smoke_threshold;
        document.getElementById("max-temp").innerText = settings.temp_threshold;
        document.getElementById("max-flame").innerText = settings.flame_threshold;    }

    // Logs Merge
    const logList = document.getElementById("logList");
    if (logList) {
        const systemLogs = data.activity_logs.map((log) => ({
            msg: log.message || log.description,
            sensorData: log.description,
            time: new Date(log.created_at),
            status: log.status,
            type: log.status === "BAHAYA" ? "danger" : (log.action_type === "SENSOR_ALERT" ? "danger" : "system"),
        }));

        const combined = systemLogs
            .sort((a, b) => b.time - a.time)
            .slice(0, 10);
        logList.innerHTML = combined
            .map(
                (item) => `
            <div class="log-item ${item.status === "BAHAYA" ? "danger" : "ok"}">
                <div style="flex:1">
                    <div class="log-msg">${item.msg}</div>
                    <div class="log-time" style="font-size:11px;color:#888;margin-top:4px">${item.sensorData}</div>
                    <div class="log-time">${item.time.toLocaleTimeString("id-ID")}</div>
                </div>
            </div>`,
            )
            .join("");
    }

    // Header Status
    const statusEl = document.getElementById("liveIndicator");
    if (data.emergency_status === "BAHAYA")
        statusEl.className = "live-dot status-bahaya";
    else statusEl.className = "live-dot status-aman";

    // Worker Status Display
    const workerList = document.getElementById("workerList");
    const workerCount = document.getElementById("workerCount");
    
    if (workerList && data.worker_status) {
        const worker = data.worker_status;
        const isOnline = data.worker_online;
        const statusEmoji = isOnline ? '🟢' : '🔴';
        const statusText = isOnline ? 'Online' : 'Offline';
        const statusClass = isOnline ? 'status-online' : 'status-offline';
        
        // Format latest command
        let commandHTML = '';
        if (data.latest_command) {
            const cmd = data.latest_command;
            const cmdStatusEmoji = cmd.status === 'completed' ? '✅' : 
                                  cmd.status === 'failed' ? '❌' : 
                                  cmd.status === 'processing' ? '⏳' : '⏹️';
            const deviceName = cmd.device && cmd.device.device_name ? cmd.device.device_name : 'Unknown';
            commandHTML = `<div class="worker-command">${cmdStatusEmoji} ${cmd.action} → ${cmd.target_device} (${deviceName})</div>`;
        }
        
        const lastHeartbeat = new Date(worker.last_heartbeat);
        const formattedTime = lastHeartbeat.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        workerList.innerHTML = `
          <div class="worker-item ${statusClass}">
            <div class="worker-row">
              <div class="worker-name">${worker.component_name}</div>
              <div class="worker-status-badge">${statusEmoji} ${statusText}</div>
            </div>
            <div class="worker-row">
              <div class="worker-detail"><span class="detail-label">State:</span> ${worker.current_state || '—'}</div>
              <div class="worker-detail"><span class="detail-label">Last:</span> ${formattedTime}</div>
            </div>
            ${commandHTML}
          </div>
        `;
        
        workerCount.innerText = isOnline ? '1' : '0';
        workerCount.className = `badge worker-badge ${statusClass}`;
    } else {
        if (workerList) {
            workerList.innerHTML = `<div class="worker-item status-offline" style="text-align:center;padding:20px;color:var(--muted)">🔌 No workers connected</div>`;
        }
        if (workerCount) {
            workerCount.innerText = '0';
            workerCount.className = 'badge worker-badge status-offline';
        }
    }

    // Chart update
    const chartData = [...data.sensor_data].reverse();
    sensorChart.data.labels = chartData.map((d) =>
        new Date(d.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
    );
    sensorChart.data.datasets[0].data = chartData.map((d) => d.gas_value);
    sensorChart.data.datasets[1].data = chartData.map((d) => d.smoke_value);
    sensorChart.data.datasets[2].data = chartData.map((d) => d.temperature);
    sensorChart.data.datasets[3].data = chartData.map((d) => d.flame_value);
    sensorChart.update("none");
}

// 3. Selection Logic
window.selectDevice = (id) => {
    currentDeviceId = id;
    document.getElementById("currentDeviceTitle").innerText = `Device ${id}`;
    document.getElementById("chartDeviceName").innerText = `Device ${id}`;
    toggleMenu();
    updateDashboard(); // Langsung update tanpa nunggu interval
};

window.toggleMenu = () => {
    const sidebar = document.getElementById("sidebar");
    const header = document.getElementById("mainHeader");
    const container = document.querySelector(".container");
    
    sidebar.classList.toggle("open");
    header.classList.toggle("open");
    container.classList.toggle("open");
};

// Toggle Simulation (Pause/Resume)
window.toggleSimulation = () => {
    const toggleBtn = document.getElementById("toggleBtn");
    
    if (isSimulationRunning) {
        // Pause - stop the interval
        clearInterval(refreshInterval);
        isSimulationRunning = false;
        toggleBtn.innerText = "▶ Resume";
        toggleBtn.style.backgroundColor = "var(--orange)";
        console.log("✋ Dashboard paused");
    } else {
        // Resume - restart the interval
        refreshInterval = setInterval(updateDashboard, 3000);
        isSimulationRunning = true;
        toggleBtn.innerText = "⏸ Pause";
        toggleBtn.style.backgroundColor = "";
        console.log("▶️ Dashboard resumed");
        updateDashboard(); // Immediate update
    }
};

// Clear Worker Status
window.clearWorkerStatus = async () => {
    if (!confirm("Yakin ingin clear worker status?")) return;
    
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        const response = await fetch("/api/worker/clear", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken || "",
            }
        });
        
        const result = await response.json();
        if (result.status === "success") {
            alert("✅ Worker status cleared!");
            
            // Update UI immediately
            const workerList = document.getElementById("workerList");
            const workerCount = document.getElementById("workerCount");
            
            if (workerList) {
                workerList.innerHTML = `<div class="worker-item status-offline" style="text-align:center;padding:20px;color:var(--muted)">🔌 No workers connected</div>`;
            }
            if (workerCount) {
                workerCount.innerText = '0';
                workerCount.className = 'badge worker-badge status-offline';
            }
            
            // Then refresh dashboard data
            updateDashboard();
        } else {
            alert("❌ Error: " + (result.message || "Failed to clear"));
        }
    } catch (error) {
        console.error("Error clearing worker:", error);
        alert("❌ Error: " + error.message);
    }
};

// ... function updateCard, syncThresholdUI, Event Listeners tetap sama ...
function updateCard(type, value, thresh, inverse = false) {
    const valEl = document.getElementById(`val-${type}`);
    if (valEl) valEl.innerText = parseFloat(value).toFixed(1);
    
    const barEl = document.getElementById(`bar-${type}`);
    if (barEl) {
        const percentage = Math.min((value / thresh) * 100, 100);
        barEl.style.width = percentage + "%";
    }
    
    const card = document.getElementById(`card-${type}`);
    if (card) {
        // Tentukan apakah sensor dalam kondisi bahaya
        let isDanger = false;
        if (inverse) {
            // Untuk FLAME: danger jika value < threshold (api terdeteksi)
            isDanger = value < thresh;
        } else {
            // Untuk Gas, Smoke, Temp: danger jika value > threshold
            isDanger = value > thresh;
        }
        
        // Debug log
        console.log(`${type}: value=${value}, thresh=${thresh}, isDanger=${isDanger}`);
        
        // Update class danger
        if (isDanger) {
            card.classList.add("danger");
        } else {
            card.classList.remove("danger");
        }
    }
}

function syncThresholdUI(settings) {
    ["gas", "smoke", "temp", "flame"].forEach((t) => {
        document.getElementById(`range-${t}`).value =
            settings[`${t}_threshold`];
        document.getElementById(`th-${t}-val`).innerText =
            settings[`${t}_threshold`];
    });
}

// 4. Threshold Slider Listeners and Save
function setupThresholdListeners() {
    const settingsForm = document.getElementById("settingsForm");
    
    // Slider drag listeners - pause refresh saat drag
    ["gas", "smoke", "temp", "flame"].forEach((type) => {
        const slider = document.getElementById(`range-${type}`);
        const display = document.getElementById(`th-${type}-val`);
        
        if (slider) {
            // Update display saat input
            slider.addEventListener("input", (e) => {
                if (display) display.innerText = e.target.value;
            });
            
            // Pause refresh saat mulai drag (jangan resume sampe focusout)
            slider.addEventListener("pointerdown", () => {
                isFormFocused = true;
                if (refreshInterval) clearInterval(refreshInterval);
                console.log("Slider drag started - auto-refresh paused");
            });
            
            // Fallback untuk mouse
            slider.addEventListener("mousedown", () => {
                isFormFocused = true;
                if (refreshInterval) clearInterval(refreshInterval);
            });
        }
    });
    
    // Form focus listeners - ONLY resume on focusout dari entire form
    if (settingsForm) {
        settingsForm.addEventListener("focusin", () => {
            isFormFocused = true;
            if (refreshInterval) clearInterval(refreshInterval);
            console.log("Form focused - auto-refresh paused");
        });
        
        settingsForm.addEventListener("focusout", () => {
            isFormFocused = false;
            // Resume after focusout (user truly left the form)
            setTimeout(() => {
                if (!isFormFocused) { // Double check it's still false
                    refreshInterval = setInterval(updateDashboard, 3000);
                    console.log("Form completely unfocused - auto-refresh resumed");
                }
            }, 300);
        });
    }

    // Form submit handler
    if (settingsForm) {
        settingsForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const payload = {
                gas_threshold: parseInt(document.getElementById("range-gas").value),
                smoke_threshold: parseInt(document.getElementById("range-smoke").value),
                temperature_threshold: parseInt(document.getElementById("range-temp").value),
                flame_threshold: parseInt(document.getElementById("range-flame").value),
            };
            
            console.log("Sending settings:", payload);
            
            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
                console.log("CSRF Token:", csrfToken ? "Found" : "Missing");
                
                const response = await fetch("/api/settings", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken || "",
                    },
                    body: JSON.stringify(payload),
                });
                
                console.log("Response status:", response.status);
                const result = await response.json();
                console.log("Response data:", result);
                
                if (result.status === "success") {
                    alert("⚙️ Pengaturan berhasil disimpan!");
                    // Jangan langsung update, tunggu user selesai
                } else {
                    alert("❌ Error: " + (result.message || "Gagal menyimpan"));
                }
            } catch (error) {
                console.error("Full error:", error);
                alert("❌ Gagal menghubungi server: " + error.message);
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initChart();
    setupThresholdListeners();
    updateDashboard();
    refreshInterval = setInterval(updateDashboard, 3000);
});
