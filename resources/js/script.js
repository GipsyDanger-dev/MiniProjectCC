import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

let sensorChart;
let currentDeviceId = 1;
let thresholdsInitialized = false;

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
    try {
        const response = await fetch(
            `/api/dashboard/data?device_id=${currentDeviceId}`,
        );
        const data = await response.json();

        if (data.status === "success") {
            if (!thresholdsInitialized) {
                syncThresholdUI(data.settings);
                thresholdsInitialized = true;
            }
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
        updateCard("temp", latest.temperature, settings.temperature_threshold);
        updateCard("flame", latest.flame_value, settings.flame_threshold, true);
    }

    // Logs Merge
    const logList = document.getElementById("logList");
    if (logList) {
        const systemLogs = data.activity_logs.map((log) => ({
            msg: log.description,
            time: new Date(log.created_at),
            type: log.action_type === "SENSOR_ALERT" ? "danger" : "system",
        }));
        const sensorLogs = data.sensor_data
            .filter((s) => s.status_indikasi === "AMAN")
            .map((s) => ({
                msg: "Lingkungan Aman",
                time: new Date(s.created_at),
                type: "ok",
            }));

        const combined = [...systemLogs, ...sensorLogs]
            .sort((a, b) => b.time - a.time)
            .slice(0, 10);
        logList.innerHTML = combined
            .map(
                (item) => `
            <div class="log-item ${item.type === "danger" ? "danger" : "warning"}">
                <div style="flex:1">
                    <div class="log-msg">${item.msg}</div>
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
    document.getElementById("sidebar").classList.toggle("open");
};

// ... function updateCard, syncThresholdUI, Event Listeners tetap sama ...
function updateCard(type, value, thresh, inverse = false) {
    const valEl = document.getElementById(`val-${type}`);
    if (valEl) valEl.innerText = parseFloat(value).toFixed(1);
    const barEl = document.getElementById(`bar-${type}`);
    if (barEl) barEl.style.width = Math.min((value / thresh) * 100, 100) + "%";
    const card = document.getElementById(`card-${type}`);
    if (value > thresh) card.classList.add("danger");
    else card.classList.remove("danger");
}

function syncThresholdUI(settings) {
    ["gas", "smoke", "temp", "flame"].forEach((t) => {
        document.getElementById(`range-${t}`).value =
            settings[`${t}_threshold`];
        document.getElementById(`th-${t}-val`).innerText =
            settings[`${t}_threshold`];
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initChart();
    updateDashboard();
    setInterval(updateDashboard, 3000);
});
