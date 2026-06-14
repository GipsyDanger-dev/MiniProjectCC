# SentinelIoT - Smart Safety Monitoring System

Real-time IoT safety monitoring system with fuzzy logic-based hazard detection, automated actuator control, and 3D visualization.

## Architecture

```
ESP32 Sensors → Laravel API → Fuzzy Logic → Actuator Commands → ESP32
                    ↓
              React Dashboard (Pusher real-time)
                    ↓
              Worker (Python) → Command Execution
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 13, MySQL |
| Frontend | React 19, Vite, Tailwind CSS v3 |
| 3D | Three.js, @react-three/fiber |
| Real-time | Pusher (broadcasting) |
| IoT | ESP32 (C++), Python worker |
| Fuzzy Logic | Sugeno method, 13 rules |

## Features

### Sensor Monitoring
- Gas (MQ-2), Smoke, Temperature (DHT22), Flame (KY-026), Humidity
- Real-time data ingestion via `POST /api/ingest`
- Historical data visualization with charts

### Fuzzy Logic Engine (Sugeno)
- 13 inference rules covering gas, smoke, temperature combinations
- Flame override: immediate HIGH + buzzer when flame_value < threshold
- Dynamic membership functions based on configurable thresholds
- Output zones: SAFE (score 0-20), LOW (20-40), MEDIUM (40-70), HIGH (70-100)

### Actuator Control
- **Exhaust Fan**: OFF / LOW (30%) / MEDIUM (60%) / HIGH (100%)
- **Buzzer**: START / STOP
- Manual override mode: user commands take priority over fuzzy logic
- Flame emergency: auto-switches from manual to auto mode

### Mode System
- **Auto**: Fuzzy logic controls actuators automatically
- **Manual**: User has full control, fuzzy logic sleeps
- Flame emergency overrides manual mode (safety first)

### Device Management
- CRUD for IoT devices
- Device reset (clears sensor data, commands, actuator state)
- API key authentication per device

## API Endpoints

### Protected (requires `x-api-key` header)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingest` | Ingest sensor data, triggers fuzzy logic |
| GET | `/api/command/get` | ESP32 polls for pending commands |
| POST | `/api/status/update` | Update command status (completed/failed) |
| POST | `/api/worker/heartbeat` | Worker heartbeat |

### Frontend (no API key required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/data` | Full dashboard data |
| POST | `/api/settings` | Save threshold settings |
| POST | `/api/actuator` | Manual actuator control |
| POST | `/api/mode` | Switch auto/manual mode |
| GET | `/api/devices` | List devices |
| POST | `/api/devices` | Create device |
| PUT | `/api/devices/{id}` | Update device |
| POST | `/api/devices/{id}/reset` | Reset device |

## Database Schema

### Key Tables
- `devices` - Registered IoT devices
- `sensor_data` - Sensor readings with fuzzy decision output
- `system_settings` - Global thresholds and mode
- `device_actuators` - Current actuator state (single source of truth)
- `commands` - Pending commands for ESP32 polling
- `activity_logs` - System event log
- `worker_status` - Python worker heartbeat

## Testing

```bash
php artisan test
```

**89 tests, 194 assertions** — Test-Driven Development (TDD) approach, all tests written before verification:

### Test-Driven Development (TDD)

All features are covered by tests written first, then verified against implementation:

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --filter=FuzzyLogicTest
php artisan test --filter=FlameEmergencyTest

# Run with coverage (requires Xdebug)
php artisan test --coverage
```

### Test Suites
- Fuzzy logic (21 unit tests): membership functions, all zones, flame override
- Sensor ingestion (9 tests): validation, auth, humidity, commands
- Dashboard (8 tests): settings, emergency status, actuator state
- Actuator control (13 tests): fan speeds, buzzer, mode switch, validation
- Manual override (3 tests): fuzzy blocking, stop persistence, auto resume
- Flame emergency (5 tests): auto-switch, immediate execution, override
- Settings (5 tests): DB persistence, cache, validation
- Command polling (5 tests): atomic lock, processing state
- Worker status (6 tests): heartbeat, command update, clear
- Device CRUD (7 tests): create, update, reset cascade

## Code Quality

### Dead Code Audit (2026-06-02)

Comprehensive audit performed and all issues resolved:

| Category | Issue | Fix |
|----------|-------|-----|
| Dead filter UI | ActivityLogs filter buttons changed state but didn't filter data | Fixed to use `filteredLogs` |
| Non-functional search | SensorData search input was cosmetic only | Made search filter table rows |
| Unused imports | Settings had 3 unused lucide-react imports | Removed `Bell`, `Moon`, `SlidersHorizontal` |
| Unused state | `webNotif` state declared but never read | Removed |
| Dead state | `dangerOnly` toggle did nothing | Now persists to localStorage |
| Dead code | `GaugeCard` component defined but never rendered | Removed |
| Commented-out code | 30-line 3D Room Model section in DeviceStatus | Removed |
| Dead code path | Unreachable `profile` page in MainApp | Removed |
| Dead cache call | `Cache::forget('worker_status')` on non-existent key | Removed |
| Legacy dead files | `script.js`, `dashboard.blade.php`, `public/dashboard.js` | Deleted |
| Silent errors | `saveThresholds` swallowed errors silently | Now logs to console |

### TDD Coverage Matrix

| Test File | Tests | Covers |
|-----------|-------|--------|
| `FuzzyLogicTest` | 21 | Triangular membership, all 4 zones, flame override, custom thresholds |
| `IngestDataTest` | 9 | Flame override, safe zone, validation, API key, humidity, activity log |
| `DashboardTest` | 8 | Settings, emergency status, system mode, actuator state, custom device_id |
| `ActuatorControlTest` | 13 | Fan speeds (OFF/LOW/MEDIUM/HIGH), buzzer, mode switch, validation |
| `ManualOverrideTest` | 3 | Fuzzy blocked in manual, stop persists, auto resumes after switch |
| `FlameEmergencyTest` | 5 | Auto-switch manual→auto, immediate execution, overrides stopped fan |
| `SettingsTest` | 5 | DB persistence, cache sync, validation, overwrite |
| `CommandPollingTest` | 5 | Atomic lock, processing state, empty response, API key required |
| `WorkerStatusTest` | 6 | Heartbeat create/update, command status, 404, clear |
| `DeviceCrudTest` | 7 | List, create, update, 404, reset cascade (sensor_data + commands + actuators) |

## Frontend Pages

| Page | Description |
|------|-------------|
| Dashboard | Overview cards, threshold settings, actuator controls, activity log |
| Sensor Data | Charts, raw readings table with search, CSV export |
| Device Status | Hardware diagnostics, API health checks |
| Activity Logs | Filterable event timeline with CSV export |
| Settings | Threshold config, device management, fuzzy rules table |
| 3D Room | Interactive Three.js model with emergency animations |

## Configuration

### Environment Variables (.env)
```
DB_CONNECTION=mysql
DB_HOST=...
DB_DATABASE=sentinel
PUSHER_APP_ID=...
PUSHER_APP_KEY=...
PUSHER_APP_SECRET=...
IOT_API_KEY=your-device-api-key
```

### Thresholds (configurable via dashboard)
- Gas: 250 PPM (default)
- Smoke: 120 PPM (default)
- Temperature: 40°C (default)
- Flame: 500 analog (default, lower = fire detected)

## Project Structure

```
smart-safety-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/ApiController.php    # All API logic
│   │   └── Middleware/CheckApiKey.php       # API key auth
│   └── Models/
│       ├── Device.php
│       ├── SensorData.php
│       ├── SystemSettings.php
│       ├── DeviceActuator.php
│       ├── Command.php
│       ├── ActivityLog.php
│       └── WorkerStatus.php
├── resources/js/
│   ├── MainApp.jsx          # Router + layout
│   ├── pages/               # Dashboard, SensorData, etc.
│   ├── components/          # Sidebar, Topbar, RoomModel, etc.
│   └── app.jsx              # Entry point
├── routes/
│   ├── api.php              # API routes (with CheckApiKey)
│   └── web.php              # Frontend routes (no auth)
├── tests/
│   ├── Feature/             # 10 feature test files
│   └── Unit/                # FuzzyLogicTest
├── simulator.py             # Sensor data simulator
└── worker.py                # Python command executor
```
