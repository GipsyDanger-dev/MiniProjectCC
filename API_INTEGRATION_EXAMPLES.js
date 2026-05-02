// Example API Integration for React Components
// Place this code in your components to connect with Laravel backend

// ============================================
// 1. DASHBOARD - Fetch Real Data
// ============================================

import { useEffect, useState } from 'react';
import axios from 'axios';

function DashboardWithAPI({ device }) {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats for selected device
        const statsResponse = await axios.get(`/api/devices/${device}/stats`);
        setStats(statsResponse.data);
        
        // Fetch recent alerts
        const alertsResponse = await axios.get(`/api/alerts?device=${device}&limit=5`);
        setAlerts(alertsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Optional: Poll every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [device]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Temperature" value={`${stats.temperature}°C`} />
          <StatCard label="Humidity" value={`${stats.humidity}%`} />
          <StatCard label="Devices Online" value={`${stats.online}/${stats.total}`} />
          <StatCard label="Alerts" value={stats.alert_count} />
        </div>
      )}
      
      {/* Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        {alerts.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// 2. SENSOR DATA - Real-time Updates
// ============================================

function SensorDataWithAPI({ device }) {
  const [sensors, setSensors] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await axios.get(`/api/devices/${device}/sensors`);
        setSensors(response.data);
      } catch (error) {
        console.error('Error fetching sensors:', error);
      }
    };

    fetchSensors();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchSensors, 5000);
    return () => clearInterval(interval);
  }, [device]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await axios.get(`/api/devices/${device}/sensors`);
      setSensors(response.data);
    } catch (error) {
      console.error('Error refreshing sensors:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sensor Data</h1>
        <button 
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sensors.map(sensor => (
          <SensorCard key={sensor.id} sensor={sensor} />
        ))}
      </div>
    </div>
  );
}

// ============================================
// 3. SETTINGS - Save Configuration
// ============================================

function SettingsWithAPI() {
  const [settings, setSettings] = useState({
    temp_threshold: 30,
    humidity_threshold: 80,
    co2_threshold: 500,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/settings', settings);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {message && (
        <div className={`p-4 rounded-lg mb-4 ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <label className="block text-sm font-medium mb-2">
            Temperature Threshold (°C)
          </label>
          <input
            type="number"
            value={settings.temp_threshold}
            onChange={(e) => handleChange('temp_threshold', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <label className="block text-sm font-medium mb-2">
            Humidity Threshold (%)
          </label>
          <input
            type="number"
            value={settings.humidity_threshold}
            onChange={(e) => handleChange('humidity_threshold', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
          <label className="block text-sm font-medium mb-2">
            CO2 Threshold (ppm)
          </label>
          <input
            type="number"
            value={settings.co2_threshold}
            onChange={(e) => handleChange('co2_threshold', e.target.value)}
            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

// ============================================
// 4. DEVICE CONTROL - Send Commands
// ============================================

async function controlDevice(deviceId, action) {
  try {
    const response = await axios.post('/api/actuator', {
      device_id: deviceId,
      action: action, // 'start', 'stop', 'restart'
    });
    return response.data;
  } catch (error) {
    console.error('Error controlling device:', error);
    throw error;
  }
}

// Usage in component
function DeviceControlButton({ deviceId }) {
  const [loading, setLoading] = useState(false);

  const handleControl = async (action) => {
    setLoading(true);
    try {
      const result = await controlDevice(deviceId, action);
      console.log('Device controlled:', result);
      // Show success message
    } catch (error) {
      console.error('Failed to control device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-x-2">
      <button onClick={() => handleControl('start')} disabled={loading}>Start</button>
      <button onClick={() => handleControl('stop')} disabled={loading}>Stop</button>
      <button onClick={() => handleControl('restart')} disabled={loading}>Restart</button>
    </div>
  );
}

// ============================================
// 5. ACTIVITY LOG - Paginated List
// ============================================

function ActivityLogWithAPI() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 20;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/activity-logs?page=${page}&limit=${PAGE_SIZE}`);
        setLogs(response.data.items);
        setHasMore(response.data.has_more);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Activity Log</h1>

      {/* Logs list */}
      <div className="space-y-2">
        {logs.map(log => (
          <LogItem key={log.id} log={log} />
        ))}
      </div>

      {/* Pagination */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="py-2">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// 6. ERROR HANDLING - Global Pattern
// ============================================

const handleAPICall = async (apiFunction, onSuccess, onError) => {
  try {
    const result = await apiFunction();
    onSuccess(result);
  } catch (error) {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.log('Unauthorized - redirect to login');
    } else if (error.response?.status === 404) {
      // Handle not found
      onError?.('Resource not found');
    } else if (error.response?.status === 500) {
      // Handle server error
      onError?.('Server error - please try again');
    } else {
      onError?.(error.message);
    }
  }
};

// ============================================
// 7. AXIOS INTERCEPTORS (in bootstrap.js)
// ============================================

// Add this to resources/js/bootstrap.js for global error handling:

/*
import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Add response interceptor for error handling
window.axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
*/

export {
  DashboardWithAPI,
  SensorDataWithAPI,
  SettingsWithAPI,
  controlDevice,
  ActivityLogWithAPI,
  handleAPICall,
};
