import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

let sensorChart;

// Inisialisasi Grafik
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
                y: { grid: { color: "#21262d" }, ticks: { color: "#8b949e" } },
            },
        },
    });
}

// Ambil Data dari API Laravel
async function updateDashboard() {
    try {
        const response = await fetch("/api/dashboard/data");
        const data = await response.json();

        if (data.status === "success") {
            refreshUI(data);
        }
    } catch (error) {
        console.error("Gagal polling data:", error);
    }
}

function refreshUI(data) {
    const latest = data.sensor_data[0];
    const settings = data.settings;

    if (latest) {
        // Update Cards & Progress
        updateCard("gas", latest.gas_value, settings.gas_threshold);
        updateCard("smoke", latest.smoke_value, settings.smoke_threshold);
        updateCard("temp", latest.temperature, settings.temperature_threshold);
        updateCard(
            "flame",
            latest.flame_value,
            settings.flame_threshold ?? 500,
            true,
        );

        // Update Humid (default 100)
        const humidityEl = document.getElementById("val-humidity");
        if (humidityEl) {
            humidityEl.innerText = latest.humidity || 0;
        }
    }

    // Update Emergency Status
    const statusEl = document.getElementById("emergencyStatus");
    const textEl = document.getElementById("statusText");
    if (statusEl && textEl) {
        if (data.emergency_status === "BAHAYA") {
            statusEl.className = "status-indicator status-bahaya";
            textEl.innerText = "⚠️ STATUS: BAHAYA";
        } else {
            statusEl.className = "status-indicator status-aman";
            textEl.innerText = "✅ STATUS: AMAN";
        }
    }

    // Update Logs
    const logList = document.getElementById("logList");
    if (logList) {
        const eventLogs = [
            ...data.activity_logs.map((log) => ({
                type: "activity",
                title: log.description,
                timestamp: log.created_at,
                badge: "LOG",
            })),
            ...data.sensor_data.map((sensor) => ({
                type: "sensor",
                title: `Data sensor ${sensor.device_name}: Gas ${sensor.gas_value} ppm, Asap ${sensor.smoke_value} ppm, Suhu ${sensor.temperature} °C, Flame ${sensor.flame_value}, Status ${sensor.status_indikasi}`,
                timestamp: sensor.created_at,
                badge: sensor.status_indikasi,
            })),
        ]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        logList.innerHTML = eventLogs
            .map(
                (item) => `
            <div class="log-item">
                <span>${item.title}</span>
                <span class="log-time">${new Date(item.timestamp).toLocaleTimeString()}</span>
                <span style="margin-left:10px;color:${item.badge === "BAHAYA" ? "#f87171" : item.badge === "AMAN" ? "#34d399" : "#94a3b8"};font-weight:600">${item.badge}</span>
            </div>
        `,
            )
            .join("");
    }

    // Update Worker Card
    const worker = data.worker_status;
    const workerList = document.getElementById("workerList");
    const workerCount = document.getElementById("workerCount");
    if (workerList) {
        if (worker) {
            const workerOnline = data.worker_online;
            workerList.innerHTML = `
                <div class="worker-card p-3" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <div class="fw-bold text-cyan">${worker.component_name}</div>
                    <div class="small text-muted">State: ${worker.current_state}</div>
                    <div class="small text-muted">Heartbeat: ${new Date(worker.last_heartbeat).toLocaleTimeString()}</div>
                    <div class="small ${workerOnline ? "text-success" : "text-danger"}">${workerOnline ? "Online" : "Offline"}</div>
                </div>
            `;
            if (workerCount) {
                workerCount.innerText = workerOnline
                    ? "1/1 online"
                    : "1/1 offline";
            }
        } else {
            workerList.innerHTML = `<p style="color:var(--muted);font-size:13px">Tidak ada worker aktif.</p>`;
            if (workerCount) {
                workerCount.innerText = "0/0 offline";
            }
        }
    }

    // Update Threshold Settings UI
    const gasLabel = document.getElementById("th-gas-val");
    const smokeLabel = document.getElementById("th-smoke-val");
    const tempLabel = document.getElementById("th-temp-val");
    if (gasLabel) gasLabel.innerText = settings.gas_threshold + " ppm";
    if (smokeLabel) smokeLabel.innerText = settings.smoke_threshold + " ppm";
    if (tempLabel) tempLabel.innerText = settings.temperature_threshold + " °C";

    // Update Chart Data (15 data terakhir)
    const chartData = [...data.sensor_data].reverse();
    sensorChart.data.labels = chartData.map((d) =>
        new Date(d.created_at).toLocaleTimeString(),
    );
    sensorChart.data.datasets[0].data = chartData.map((d) => d.gas_value);
    sensorChart.data.datasets[1].data = chartData.map((d) => d.smoke_value);
    sensorChart.data.datasets[2].data = chartData.map((d) => d.temperature);
    sensorChart.data.datasets[3].data = chartData.map((d) => d.flame_value);
    sensorChart.update("none"); // Update tanpa animasi agar ringan
}

function updateCard(type, value, thresh, inverse = false) {
    document.getElementById(`val-${type}`).innerText =
        parseFloat(value).toFixed(1);
    const normalized = inverse
        ? Math.min(((thresh - value) / thresh) * 100, 100)
        : Math.min((value / thresh) * 100, 100);
    document.getElementById(`bar-${type}`).style.width = normalized + "%";

    const card = document.getElementById(`card-${type}`);
    const danger = inverse ? value < thresh : value > thresh;
    if (danger) card.style.borderColor = "var(--red)";
    else card.style.borderColor = "var(--border)";
}

// Kirim Command Manual
async function controlActuator(target, action) {
    const csrf = document.querySelector('meta[name="csrf-token"]').content;
    await fetch("/api/actuator", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrf },
        body: JSON.stringify({ target_device: target, action: action }),
    });
    alert(`Perintah ${action} dikirim ke ${target}`);
}

// Simpan Settings
const settingsForm = document.getElementById("settingsForm");
if (settingsForm) {
    settingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const csrf = document.querySelector('meta[name="csrf-token"]').content;
        const payload = {
            mode: document.getElementById("setMode").value,
            gas_threshold: document.getElementById("range-gas").value,
            smoke_threshold: document.getElementById("range-smoke").value,
            temperature_threshold: document.getElementById("range-temp").value,
        };

        const res = await fetch("/api/settings", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrf,
            },
            body: JSON.stringify(payload),
        });

        if (res.ok) alert("Pengaturan berhasil disimpan!");
    });
}

// Update Label Slider Realtime
["gas", "smoke", "temp"].forEach((type) => {
    const input = document.getElementById(`range-${type}`);
    if (!input) return;
    input.addEventListener("input", (e) => {
        const label = document.getElementById(`th-${type}-val`);
        if (!label) return;
        label.innerText = e.target.value + (type === "temp" ? " °C" : " ppm");
    });
});

document.addEventListener("DOMContentLoaded", () => {
    initChart();
    updateDashboard();
    setInterval(updateDashboard, 2500); // Poll setiap 2.5 detik
});
