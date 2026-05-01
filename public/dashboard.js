// Dashboard Data Handler - Simple non-module script
let sensorChart = null;
let sparklineCharts = {};
let sensorHistoryData = {
    gas: [],
    smoke: [],
    temp: [],
    flame: []
};
let currentDeviceId = 1;
let refreshInterval = null;
let scene, camera, renderer, twinObject;
let isInitialized = false; // Prevent double initialization

console.log('Dashboard JS loaded');

// Initialize Sparkline Charts
function initSparklines() {
    const sparklineConfig = {
        gas: { id: 'spark-gas', color: '#8b5cf6', manual: true },
        smoke: { id: 'spark-smoke', color: '#f59e0b', manual: false },
        temp: { id: 'spark-temp', color: '#10b981', manual: false },
        flame: { id: 'spark-flame', color: '#ef4444', manual: true }
    };

    console.log('=== Initializing Sparklines ===');
    
    // Destroy all existing sparklines
    Object.entries(sparklineConfig).forEach(([key, config]) => {
        try {
            if (sparklineCharts[key]) {
                sparklineCharts[key].destroy();
                sparklineCharts[key] = null;
            }
        } catch (e) {
            console.log(`Error destroying ${key}:`, e.message);
        }
    });
    
    sparklineCharts = {};
    
    // Initialize each sparkline with fresh canvas
    Object.entries(sparklineConfig).forEach(([key, config]) => {
        const canvas = document.getElementById(config.id);
        if (!canvas) {
            console.warn(`Canvas ${config.id} not found`);
            return;
        }
        
        try {
            // Completely reset the canvas
            canvas.width = 1;
            canvas.height = 1;
            canvas.width = 60;
            canvas.height = 20;
            
            // For Gas and Flame, use manual mode
            if (config.manual) {
                // Create a placeholder object for manual drawing
                sparklineCharts[key] = {
                    type: 'manual',
                    update: () => {},
                    destroy: () => {},
                    hidden: false
                };
                console.log(`✅ Sparkline ${key} initialized (manual mode)`);
                return;
            }
            
            const ctx = canvas.getContext('2d', { willReadFrequently: false });
            if (!ctx) throw new Error('Cannot get 2D context');
            
            // Create chart for Smoke and Temp only
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        borderColor: config.color,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        spanGaps: false
                    }]
                },
                options: {
                    responsive: false,
                    maintainAspectRatio: false,
                    animation: { duration: 0 },
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                        filler: { propagate: false }
                    },
                    scales: {
                        x: { display: false, grid: { display: false } },
                        y: { display: false, grid: { display: false }, min: 0, max: 100 }
                    }
                }
            });
            
            sparklineCharts[key] = chart;
            console.log(`✅ Sparkline ${key} initialized (Chart.js)`);
            
        } catch (error) {
            console.error(`❌ Failed to initialize ${key}:`, error.message);
            // Fallback to manual
            sparklineCharts[key] = {
                type: 'manual',
                update: () => {},
                destroy: () => {},
                hidden: false
            };
        }
    });
    
    console.log('Initialized sparklines:', Object.keys(sparklineCharts));
}

// Update sparkline with new data
function updateSparkline(type, value) {
    if (!sparklineCharts[type]) {
        console.warn(`Sparkline ${type} not initialized, skipping update`);
        return;
    }
    
    // Keep last 10 values
    sensorHistoryData[type].push(value);
    if (sensorHistoryData[type].length > 10) {
        sensorHistoryData[type].shift();
    }
    
    try {
        // For manual mode (Gas, Flame), always use manual draw
        if (sparklineCharts[type].type === 'manual') {
            drawSparklineManual(type);
        } else {
            // For Chart.js mode (Smoke, Temp)
            sparklineCharts[type].data.labels = sensorHistoryData[type].map((_, i) => i);
            sparklineCharts[type].data.datasets[0].data = sensorHistoryData[type];
            sparklineCharts[type].update({ duration: 0 });
        }
    } catch (error) {
        console.error(`Error updating sparkline ${type}:`, error.message);
        // Fallback to manual draw
        drawSparklineManual(type);
    }
}

// Manual sparkline drawing fallback
function drawSparklineManual(type) {
    const canvasId = `spark-${type}`;
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const data = sensorHistoryData[type] || [];
    if (data.length < 2) return;
    
    const colors = {
        gas: '#8b5cf6',
        smoke: '#f59e0b',
        temp: '#10b981',
        flame: '#ef4444'
    };
    
    // Clear canvas
    ctx.clearRect(0, 0, 60, 20);
    
    // Draw line
    ctx.strokeStyle = colors[type];
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const maxVal = 100;
    const padding = 1;
    const width = 60 - 2 * padding;
    const height = 20 - 2 * padding;
    
    ctx.beginPath();
    
    data.forEach((val, i) => {
        const x = padding + (i / (data.length - 1)) * width;
        const y = padding + height - (Math.min(val, maxVal) / maxVal) * height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
}

// Initialize 3D Digital Twin
function init3DTwin() {
    const container = document.getElementById('canvas-container');
    if (!container) {
        console.warn('⚠️ canvas-container not found');
        return;
    }
    
    if (container.querySelector('canvas')) {
        console.log('✅ 3D Twin canvas already initialized');
        return;
    }

    try {
        // Scene setup
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);
        
        camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Create a simple box representing the facility
        const geometry = new THREE.BoxGeometry(3, 2, 3);
        const material = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
        twinObject = new THREE.Mesh(geometry, material);
        scene.add(twinObject);
        
        // Add lighting
        const light = new THREE.DirectionalLight(0xffffff, 0.8);
        light.position.set(5, 5, 5);
        scene.add(light);
        
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        
        // Add OrbitControls
        if (typeof OrbitControls !== 'undefined') {
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.autoRotate = true;
            controls.autoRotateSpeed = 2;
        }
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            if (twinObject) twinObject.rotation.x += 0.002;
            renderer.render(scene, camera);
        }
        animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
        
        console.log('✅ 3D Twin initialized');
    } catch (error) {
        console.error('Error initializing 3D Twin:', error);
    }
}

// Update 3D Twin color based on status
function update3DTwinStatus(status) {
    if (twinObject) {
        if (status === 'BAHAYA') {
            twinObject.material.color.setHex(0xef4444); // Red for danger
        } else {
            twinObject.material.color.setHex(0x3b82f6); // Blue for safe
        }
    }
}

// Initialize Chart
function initChart() {
    const chartEl = document.getElementById('chart');
    if (!chartEl) {
        console.error('Chart element not found');
        return;
    }
    
    try {
        // Destroy existing chart if any
        if (sensorChart) {
            try {
                sensorChart.destroy();
                sensorChart = null;
            } catch (e) {
                console.log('Error destroying old chart:', e.message);
            }
        }
        
        const ctx = chartEl.getContext('2d');
        if (!ctx) {
            console.error('Could not get chart canvas context');
            return;
        }
        
        sensorChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    { label: 'Gas (ppm)', borderColor: '#06b6d4', data: [], tension: 0.3, pointRadius: 0, fill: false, borderWidth: 2 },
                    { label: 'Smoke (ppm)', borderColor: '#3b82f6', data: [], tension: 0.3, pointRadius: 0, fill: false, borderWidth: 2 },
                    { label: 'Temp (°C)', borderColor: '#f97316', data: [], tension: 0.3, pointRadius: 0, fill: false, borderWidth: 2 },
                    { label: 'Flame (raw)', borderColor: '#ef4444', data: [], tension: 0.3, pointRadius: 0, fill: false, borderWidth: 2 }
                ]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                plugins: { 
                    legend: { 
                        labels: { color: '#475569', font: { size: 11 } },
                        display: true,
                        position: 'top'
                    } 
                },
                scales: { 
                    y: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: '#e2e8f0' } }, 
                    x: { ticks: { color: '#475569', font: { size: 10 } }, grid: { color: '#e2e8f0' } } 
                }
            }
        });
        console.log('✅ Chart initialized');
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

// Update dashboard data from API
async function updateDashboard() {
    try {
        console.log(`Fetching dashboard data for device ${currentDeviceId}...`);
        const response = await fetch(`/api/dashboard/data?device_id=${currentDeviceId}`);
        
        if (!response.ok) {
            console.error('API response error:', response.status);
            return;
        }
        
        const data = await response.json();
        console.log('Dashboard data received:', data);
        
        if (data && data.status === 'success') {
            updateSensorUI(data);
            updateChartData(data.sensor_data);
            updateActivityLogs(data.activity_logs);
            updateWorkerStatus(data.worker_status, data.worker_online);
            syncThresholdUI(data.settings);
            update3DTwinStatus(data.emergency_status);
        } else {
            console.error('API error:', data?.message || 'No status in response');
        }
    } catch (error) {
        console.error('Dashboard update error:', error);
    }
}

function updateSensorUI(data) {
    const latest = data.sensor_data[0];
    if (!latest) {
        console.warn('No sensor data available');
        return;
    }

    const settings = data.settings;
    
    // Update large metric cards with sparklines
    const updateMetric = (id, value, threshold, color) => {
        const valEl = document.getElementById(`val-${id}-large`);
        const barEl = document.getElementById(`bar-${id}-large`);
        const thresholdEl = document.getElementById(`threshold-${id}-large`);
        
        if (!valEl || !barEl || !thresholdEl) {
            console.warn(`Metric element ${id} not found`);
            return;
        }
        
        valEl.textContent = value.toFixed(1);
        
        // Progress bar width
        const percent = Math.min(100, (value / threshold) * 100);
        barEl.style.width = percent + '%';
        barEl.style.background = color;
        
        // Threshold display
        thresholdEl.textContent = `Threshold: ${threshold}`;
        
        // Update sparkline
        updateSparkline(id, value);
    };

    updateMetric('gas', latest.gas_value, settings.gas_threshold, '#ef4444');
    updateMetric('smoke', latest.smoke_value, settings.smoke_threshold, '#f59e0b');
    updateMetric('temp', latest.temperature, settings.temp_threshold, '#10b981');
    updateMetric('flame', latest.flame_value, settings.flame_threshold, '#10b981');

    // Update status badge
    const statusBadge = document.getElementById('statusBadge');
    if (statusBadge) {
        if (data.emergency_status === 'BAHAYA') {
            statusBadge.textContent = 'DANGER';
            statusBadge.style.background = 'rgba(239, 68, 68, 0.1)';
            statusBadge.style.color = '#ef4444';
            statusBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        } else {
            statusBadge.textContent = 'SAFE';
            statusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
            statusBadge.style.color = '#10b981';
            statusBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        }
    }
    console.log('Sensor UI updated');
}

function updateChartData(sensorData) {
    if (!sensorChart) {
        console.warn('Chart not initialized yet');
        return;
    }
    
    try {
        const chartData = [...sensorData].reverse().slice(0, 20);
        sensorChart.data.labels = chartData.map(d => new Date(d.created_at).toLocaleTimeString());
        sensorChart.data.datasets[0].data = chartData.map(d => d.gas_value);
        sensorChart.data.datasets[1].data = chartData.map(d => d.smoke_value);
        sensorChart.data.datasets[2].data = chartData.map(d => d.temperature);
        sensorChart.data.datasets[3].data = chartData.map(d => d.flame_value);
        
        // Safely update
        if (sensorChart && sensorChart.ctx) {
            sensorChart.update({ duration: 0 });
            console.log('Chart data updated');
        }
    } catch (error) {
        console.error('Error updating chart:', error.message);
    }
}

function updateActivityLogs(logs) {
    const logList = document.getElementById('logList');
    if (!logList) return;
    
    logList.innerHTML = logs.slice(0, 8).map(log => `
        <div class="log-item" style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; last:border-b-0;">
            <div style="font-size: 13px; color: #0f172a; font-weight: 500;">${log.message || log.description}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${log.status === 'BAHAYA' ? '#ef4444' : '#10b981'};"></span>
                ${new Date(log.created_at).toLocaleTimeString()} • ${log.status}
            </div>
        </div>
    `).join('');
}

function updateWorkerStatus(worker, online) {
    const panel = document.getElementById('workerPanel');
    if (!panel) return;
    
    if (worker && online) {
        panel.innerHTML = `
            <div class="worker-status">
                <div style="margin-bottom: 8px;">
                    <span style="color: #10b981; font-weight: 600; font-size: 12px;">● Online</span>
                </div>
                <div style="font-size: 12px; color: #0f172a;">State: ${worker.current_state || 'Idle'}</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Last: ${new Date(worker.last_heartbeat).toLocaleTimeString()}</div>
            </div>
        `;
    } else {
        panel.innerHTML = `<div class="worker-status"><span style="color: #ef4444; font-weight: 600; font-size: 12px;">● Offline</span></div>`;
    }
}

// Update range slider visual progress based on value
function updateRangeSliderBackground(rangeEl) {
    if (!rangeEl) return;
    
    const value = parseInt(rangeEl.value);
    const min = parseInt(rangeEl.min);
    const max = parseInt(rangeEl.max);
    const percent = ((value - min) / (max - min)) * 100;
    
    // Get color based on class
    let color = '#3b82f6'; // blue default (gas)
    if (rangeEl.classList.contains('range-gas')) color = '#3b82f6';
    else if (rangeEl.classList.contains('range-smoke')) color = '#a78bfa';
    else if (rangeEl.classList.contains('range-temp')) color = '#ef4444';
    else if (rangeEl.classList.contains('range-flame')) color = '#f59e0b';
    
    // Set background gradient: filled part + unfilled part
    rangeEl.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, #cbd5e1 ${percent}%, #cbd5e1 100%)`;
}

function syncThresholdUI(settings) {
    const updates = {
        'range-gas': 'th-gas-val',
        'range-smoke': 'th-smoke-val',
        'range-temp': 'th-temp-val',
        'range-flame': 'th-flame-val'
    };

    const thresholds = {
        'range-gas': settings.gas_threshold,
        'range-smoke': settings.smoke_threshold,
        'range-temp': settings.temp_threshold,
        'range-flame': settings.flame_threshold
    };

    Object.entries(updates).forEach(([rangeId, labelId]) => {
        const rangeEl = document.getElementById(rangeId);
        const labelEl = document.getElementById(labelId);
        if (rangeEl && labelEl) {
            // Don't update if user is currently interacting with this slider
            if (document.activeElement !== rangeEl) {
                rangeEl.value = thresholds[rangeId];
                updateRangeSliderBackground(rangeEl);
            }
            // Always update the display label
            labelEl.textContent = thresholds[rangeId];
        }
    });
}

// Device selection
window.selectDevice = (id) => {
    currentDeviceId = id;
    
    // Update active button
    const items = document.querySelectorAll('.nav-item');
    items.forEach((item, idx) => {
        if (idx + 1 === id) {
            item.classList.add('active');
            item.style.background = 'var(--accent)';
            item.style.color = 'white';
        } else {
            item.classList.remove('active');
            item.style.background = 'var(--border)';
            item.style.color = 'var(--text-secondary)';
        }
    });
    
    updateDashboard();
};

// Save settings
window.saveSettings = async () => {
    try {
        const rangeGas = document.getElementById('range-gas');
        const rangeSmoke = document.getElementById('range-smoke');
        const rangeTemp = document.getElementById('range-temp');
        const rangeFlame = document.getElementById('range-flame');
        
        if (!rangeGas || !rangeSmoke || !rangeTemp || !rangeFlame) {
            console.error('Threshold elements not found');
            return;
        }
        
        const settings = {
            gas_threshold: parseInt(rangeGas.value),
            smoke_threshold: parseInt(rangeSmoke.value),
            temperature_threshold: parseInt(rangeTemp.value),
            flame_threshold: parseInt(rangeFlame.value)
        };

        console.log('📤 Sending settings:', settings);

        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' 
            },
            body: JSON.stringify(settings)
        });

        console.log('📥 Response status:', response.status);
        const result = await response.json();
        console.log('📥 Response body:', result);

        if (result.status === 'success') {
            console.log('✅ Settings saved successfully!');
            // Reload dashboard to reflect new threshold values
            console.log('🔄 Refreshing dashboard...');
            await updateDashboard();
            console.log('✅ Dashboard refreshed!');
        } else {
            console.log('❌ Save failed:', result.message);
        }
    } catch (error) {
        console.error('Settings save error:', error);
    }
};

// Setup range input listeners for display update
function setupRangeListeners() {
    const rangeIds = ['gas', 'smoke', 'temp', 'flame'];
    
    rangeIds.forEach(type => {
        const rangeEl = document.getElementById(`range-${type}`);
        const valEl = document.getElementById(`th-${type}-val`);
        
        if (rangeEl && valEl) {
            // Update display when user moves slider (real-time preview)
            rangeEl.addEventListener('input', (e) => {
                valEl.textContent = e.target.value;
                // Update visual progress bar
                updateRangeSliderBackground(e.target);
                console.log(`Updated ${type} display to ${e.target.value}`);
            });
            // Removed auto-save on change - user must click Save button
        }
    });
    
    console.log('Range listeners setup complete');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log('Dashboard already initialized, skipping...');
        return;
    }
    isInitialized = true;
    
    console.log('Initializing dashboard...');
    try {
        init3DTwin();
        initSparklines();
        setupRangeListeners();
        initChart();
        updateDashboard();
        
        // Auto-refresh every 2 seconds
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(() => {
            updateDashboard();
        }, 2000);
        
        // Handle window resize for chart
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (sensorChart) {
                    sensorChart.resize();
                }
            }, 250);
        });
        
        console.log('Dashboard initialized and auto-refresh started');
    } catch (error) {
        console.error('Dashboard initialization error:', error);
    }
});

// Also try to initialize immediately if DOM is already ready
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing immediately');
    if (!isInitialized) {
        setTimeout(() => {
            isInitialized = true;
            try {
                init3DTwin();
                initSparklines();
                setupRangeListeners();
                initChart();
                updateDashboard();
                
                if (refreshInterval) clearInterval(refreshInterval);
                refreshInterval = setInterval(() => {
                    updateDashboard();
                }, 2000);
                console.log('Dashboard initialized');
            } catch (error) {
                console.error('Dashboard initialization error:', error);
            }
        }, 100);
    }
}
