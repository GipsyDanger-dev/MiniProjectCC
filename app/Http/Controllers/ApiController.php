<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SensorData;
use App\Models\Command;
use App\Models\ActivityLog;
use App\Models\DeviceActuator;
use App\Models\WorkerStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Events\SensorDataReceived;
use App\Models\Device;
use App\Models\SystemSettings;
use Illuminate\Support\Facades\Log;

class ApiController extends Controller
{
    private function triangularMembership(float $value, float $left, float $peak, float $right): float
    {
        // Di luar rentang support
        if ($value < $left || $value > $right) {
            return 0.0;
        }

        // Boundary kanal: turun ke 0
        if ($value === $right && $right !== $peak) {
            return 0.0;
        }

        // Sisi naik (termasuk trapezoidal saat left === peak)
        if ($value < $peak) {
            $denominator = $peak - $left;
            return $denominator > 0 ? ($value - $left) / $denominator : 1.0;
        }

        // Sisi turun
        if ($value > $peak) {
            $denominator = $right - $peak;
            return $denominator > 0 ? ($right - $value) / $denominator : 1.0;
        }

        // Di puncak
        return 1.0;
    }

    private function buildFuzzyDecision(float $gas, float $smoke, float $temperature, float $flame, float $flameThreshold, float $gasThreshold = 250, float $smokeThreshold = 120, float $tempThreshold = 40): array
    {
        if ($flame < $flameThreshold) {
            return [
                'score' => 100.0,
                'fan_status' => 'HIGH',
                'fan_speed' => 100,
                'buzzer_action' => 'START',
                'profile' => 'FLAME_OVERRIDE',
                'rules' => [['Flame override', 1.0, 100]],
                'reason' => 'Flame sensor crossed the emergency threshold'
            ];
        }

        // Dynamic membership berdasarkan threshold dari Settings
        $gasLow = $this->triangularMembership($gas, 0, 0, $gasThreshold * 0.8);
        $gasMedium = $this->triangularMembership($gas, $gasThreshold * 0.6, $gasThreshold, $gasThreshold * 1.6);
        $gasHigh = $this->triangularMembership($gas, $gasThreshold * 1.4, $gasThreshold * 2.4, $gasThreshold * 2.4);

        $smokeLow = $this->triangularMembership($smoke, 0, 0, $smokeThreshold * 0.8);
        $smokeMedium = $this->triangularMembership($smoke, $smokeThreshold * 0.6, $smokeThreshold, $smokeThreshold * 2.0);
        $smokeHigh = $this->triangularMembership($smoke, $smokeThreshold * 1.6, $smokeThreshold * 3.2, $smokeThreshold * 3.2);

        $tempNormal = $this->triangularMembership($temperature, $tempThreshold * 0.5, $tempThreshold * 0.75, $tempThreshold);
        $tempWarm = $this->triangularMembership($temperature, $tempThreshold * 0.875, $tempThreshold, $tempThreshold * 1.25);
        $tempHot = $this->triangularMembership($temperature, $tempThreshold * 1.25, $tempThreshold * 1.75, $tempThreshold * 1.75);

        $rules = [
            ['SAFE', min($gasLow, $smokeLow, $tempNormal), 0],
            ['LOW', min($gasLow, $smokeMedium), 30],
            ['LOW', min($gasMedium, $smokeLow), 30],
            ['LOW', $gasMedium, 30],
            ['LOW', $smokeMedium, 30],
            ['MEDIUM', min($gasMedium, $smokeMedium), 60],
            ['MEDIUM', min($gasMedium, $tempWarm), 60],
            ['MEDIUM', min($smokeMedium, $tempWarm), 60],
            ['HIGH', $gasHigh, 100],
            ['HIGH', $smokeHigh, 100],
            ['HIGH', $tempHot, 100],
            ['HIGH', min($gasMedium, $tempHot), 100],
            ['HIGH', min($smokeHigh, $tempWarm), 100],
        ];

        $weightedSum = 0.0;
        $weightTotal = 0.0;
        $activeRules = [];

        foreach ($rules as [$label, $strength, $output]) {
            $strength = (float) $strength;

            if ($strength <= 0) {
                continue;
            }

            $weightedSum += $strength * $output;
            $weightTotal += $strength;
            $activeRules[] = [$label, round($strength, 4), $output];
        }

        $score = $weightTotal > 0 ? $weightedSum / $weightTotal : 0.0;

        if ($score > 70) {
            $fanStatus = 'HIGH';
            $fanSpeed = 100;
            $buzzerAction = 'START';
            $profile = 'HIGH';
        } elseif ($score > 40) {
            $fanStatus = 'MEDIUM';
            $fanSpeed = 60;
            $buzzerAction = 'START';
            $profile = 'MEDIUM';
        } elseif ($score > 20) {
            $fanStatus = 'LOW';
            $fanSpeed = 30;
            $buzzerAction = 'STOP';
            $profile = 'LOW';
        } else {
            $fanStatus = 'OFF';
            $fanSpeed = 0;
            $buzzerAction = 'STOP';
            $profile = 'SAFE';
        }

        return [
            'score' => round($score, 2),
            'fan_status' => $fanStatus,
            'fan_speed' => $fanSpeed,
            'buzzer_action' => $buzzerAction,
            'profile' => $profile,
            'rules' => $activeRules,
            'reason' => 'Sugeno weighted average on gas, smoke, and temperature',
        ];
    }

    private function syncActuatorCommands(int $deviceId, array $decision): void
    {
        // Manual mode: fuzzy logic tidur, kecuali flame emergency
        $settings = SystemSettings::firstOrCreate(['id' => 1]);
        if ($settings->mode === 'manual') {
            if ($decision['profile'] === 'FLAME_OVERRIDE') {
                // Flame terdeteksi — auto-switch ke AUTO dan langsung eksekusi
                $settings->update(['mode' => 'auto']);
                ActivityLog::create([
                    'action_type' => 'MODE_SWITCH',
                    'status' => 'BAHAYA',
                    'description' => 'Api terdeteksi — auto-switch dari MANUAL ke AUTO',
                    'message' => 'AUTO-SWITCH: api terdeteksi, fuzzy logic ambil alih'
                ]);
                // JANGAN return — lanjut ke fuzzy logic di bawah
            } else {
                return; // skip fuzzy logic, pertahankan manual control
            }
        }

        // Update DeviceActuator berdasarkan keputusan fuzzy
        $fanStatus = $decision['fan_status'];
        $buzzerStatus = $decision['buzzer_action'] === 'START' ? 'ON' : 'OFF';

        DeviceActuator::updateOrCreate(
            ['device_id' => $deviceId],
            [
                'fan_status' => $fanStatus,
                'alarm_status' => $buzzerStatus,
                'fan_speed' => $fanStatus === 'OFF' ? 0 : $decision['fan_speed'],
            ]
        );

        // Kirim command ke ESP32 (selalu buat baru, jangan reuse)
        if ($fanStatus !== 'OFF') {
            Command::create([
                'device_id' => $deviceId,
                'target_device' => 'exhaust_fan',
                'action' => $fanStatus,
                'status' => 'pending'
            ]);
        }

        if ($decision['buzzer_action'] === 'START') {
            Command::create([
                'device_id' => $deviceId,
                'target_device' => 'buzzer',
                'action' => 'START',
                'status' => 'pending'
            ]);
        }
    }

    private function buildActivityMessage(int $deviceId, array $decision, float $gas, float $smoke, float $temperature, float $flame, float $flameThreshold): array
    {
        if (($decision['profile'] ?? null) === 'FLAME_OVERRIDE') {
            return [
                'status' => 'BAHAYA',
                'message' => "[🔴 BAHAYA] Device {$deviceId} | Flame override triggered (Flame={$flame} < threshold={$flameThreshold})",
                'description' => "Device {$deviceId}: fuzzy_override=flame, gas={$gas}, smoke={$smoke}, temp={$temperature}, flame={$flame}",
            ];
        }

        $status = ($decision['fan_status'] === 'OFF') ? 'AMAN' : 'BAHAYA';
        $ruleSummary = collect($decision['rules'] ?? [])
            ->take(4)
            ->map(function ($rule) {
                return "{$rule[0]}@{$rule[1]}→{$rule[2]}";
            })
            ->implode(' | ');

        return [
            'status' => $status,
            'message' => "[" . ($status === 'BAHAYA' ? '🔴 BAHAYA' : '🟢 AMAN') . "] Device {$deviceId} | Sugeno={$decision['score']} → {$decision['fan_status']}" . ($ruleSummary ? " | {$ruleSummary}" : ''),
            'description' => "Device {$deviceId}: fuzzy={$decision['score']}, fan={$decision['fan_status']}, speed={$decision['fan_speed']}, gas={$gas}, smoke={$smoke}, temp={$temperature}, flame={$flame}",
        ];
    }

    public function ingestData(Request $request)
    {
        try {
            $request->validate([
                'device_id' => 'required|integer|exists:devices,id',
                'gas_value' => 'required|numeric',
                'smoke_value' => 'required|numeric',
                'temperature' => 'required|numeric',
                'humidity' => 'nullable|numeric',
                'flame_value' => 'required|numeric'
            ]);

            $settings = SystemSettings::firstOrCreate(['id' => 1]);
            $gasThresh = Cache::get('gas_threshold', $settings->gas_threshold ?? 250);
            $smokeThresh = Cache::get('smoke_threshold', $settings->smoke_threshold ?? 120);
            $tempThresh = Cache::get('temperature_threshold', $settings->temperature_threshold ?? 40);
            $flameThresh = Cache::get('flame_threshold', $settings->flame_threshold ?? 500);

            $decision = $this->buildFuzzyDecision(
                (float) $request->gas_value,
                (float) $request->smoke_value,
                (float) $request->temperature,
                (float) $request->flame_value,
                (float) $flameThresh,
                (float) $gasThresh,
                (float) $smokeThresh,
                (float) $tempThresh
            );

            $status_indikasi = $decision['fan_status'] === 'OFF' ? 'AMAN' : 'BAHAYA';

            $this->syncActuatorCommands($request->device_id, $decision);

            //nyimpen data sensor
            $sensorData = SensorData::create([
                'device_id' => $request->device_id,
                'gas_value' => $request->gas_value,
                'smoke_value' => $request->smoke_value,
                'temperature' => $request->temperature,
                'humidity' => $request->humidity ?? 0,
                'flame_value' => $request->flame_value,
                'status_indikasi' => $status_indikasi,
                'fuzzy_score' => $decision['score'],
                'fan_status' => $decision['fan_status'],
                'fan_speed' => $decision['fan_speed'],
                'decision_profile' => $decision['profile']
            ]);

            $activity = $this->buildActivityMessage(
                $request->device_id,
                $decision,
                (float) $request->gas_value,
                (float) $request->smoke_value,
                (float) $request->temperature,
                (float) $request->flame_value,
                (float) $flameThresh
            );

            ActivityLog::create([
                'action_type' => 'SENSOR_DATA',
                'status' => $activity['status'],
                'description' => $activity['description'],
                'message' => $activity['message']
            ]);

            // Broadcast real-time event ke dashboard
            broadcast(new SensorDataReceived(
                $sensorData->toArray(),
                $decision,
                $status_indikasi
            ))->toOthers();

            return response()->json([
                'status' => 'success',
                'data' => $sensorData,
                'decision' => $decision,
            ], 201);
            
        } catch (\Exception $e) {
            Log::error("ingestData error: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function dashboard(Request $request)
    {
        try {
            $deviceId = $request->query('device_id', 1);

            // Query sensor data dengan timeout dan index optimization
            $sensorData = SensorData::where('device_id', $deviceId)
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get();

            // Separate query untuk activity logs (no join needed)
            $logs = ActivityLog::orderBy('created_at', 'desc')
                ->limit(15)
                ->get();

            $worker = WorkerStatus::first();

            // Separate query untuk latest command
            $latestCommand = Command::where('device_id', $deviceId)
                ->orderBy('updated_at', 'desc')
                ->select('id', 'device_id', 'target_device', 'action', 'status', 'updated_at')
                ->first();
            
            // Cek hanya sensor data TERAKHIR, bukan 20 data semuanya
            $latestSensorData = SensorData::where('device_id', $deviceId)
                ->orderBy('created_at', 'desc')
                ->first();

            $latestActuator = DeviceActuator::where('device_id', $deviceId)
                ->orderBy('updated_at', 'desc')
                ->first();

            $isEmergency = $latestSensorData && $latestSensorData->status_indikasi === 'BAHAYA';
            $workerOnline = $worker && $worker->last_heartbeat ? now()->diffInSeconds($worker->last_heartbeat) <= 60 : false;

            $settings = SystemSettings::firstOrCreate(['id' => 1]);

            return response()->json([
                'status' => 'success',
                'device_id' => $deviceId,
                'sensor_data' => $sensorData,
                'activity_logs' => $logs,
                'worker_status' => $worker,
                'worker_online' => $workerOnline,
                'latest_command' => $latestCommand,
                'device_actuator' => $latestActuator,
                'emergency_status' => $isEmergency ? 'BAHAYA' : 'AMAN',
                'system_mode' => $settings->mode ?? 'auto',
                'settings' => [
                    'gas_threshold' => Cache::get('gas_threshold', $settings->gas_threshold ?? 250),
                    'smoke_threshold' => Cache::get('smoke_threshold', $settings->smoke_threshold ?? 120),
                    'temp_threshold' => Cache::get('temperature_threshold', $settings->temperature_threshold ?? 40),
                    'flame_threshold' => Cache::get('flame_threshold', $settings->flame_threshold ?? 500)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error("Dashboard error: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Database connection timeout or error'], 503);
        }
    }


  public function saveSettings(Request $request)
    {
        try {
            $request->validate([
                'gas_threshold' => 'required|numeric',
                'smoke_threshold' => 'required|numeric',
                'temperature_threshold' => 'required|numeric',
                'flame_threshold' => 'required|numeric',
            ]);

            // Simpan ke database (persist)
            SystemSettings::updateOrCreate(
                ['id' => 1],
                [
                    'gas_threshold' => $request->gas_threshold,
                    'smoke_threshold' => $request->smoke_threshold,
                    'temperature_threshold' => $request->temperature_threshold,
                    'flame_threshold' => $request->flame_threshold,
                ]
            );

            // Simpan ke cache (fast read)
            Cache::put('gas_threshold', $request->gas_threshold);
            Cache::put('smoke_threshold', $request->smoke_threshold);
            Cache::put('temperature_threshold', $request->temperature_threshold);
            Cache::put('flame_threshold', $request->flame_threshold);

            ActivityLog::create([
                'action_type' => 'SYSTEM_UPDATE',
                'status' => 'AMAN',
                'description' => "Gas={$request->gas_threshold}, Smoke={$request->smoke_threshold}, Temp={$request->temperature_threshold}, Flame={$request->flame_threshold}",
                'message' => "Threshold settings updated successfully"
            ]);

            return response()->json(['status' => 'success', 'message' => 'Settings saved successfully']);
        } catch (\Exception $e) {
            Log::error("saveSettings error: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function controlActuator(Request $request)
    {
        $request->validate([
            'target_device' => 'required|in:exhaust_fan,buzzer',
            'action' => 'required|string',
            'device_id' => 'nullable|integer'
        ]);

        $deviceId = $request->device_id ?? 1;

        if ($request->target_device === 'exhaust_fan') {
            $allowedActions = ['START', 'STOP', 'OFF', 'LOW', 'MEDIUM', 'HIGH'];
        } else {
            $allowedActions = ['START', 'STOP'];
        }

        if (!in_array($request->action, $allowedActions, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid action for selected target device'
            ], 422);
        }

        $action = $request->action;
        if ($request->target_device === 'exhaust_fan' && $action === 'START') {
            $action = 'HIGH';
        }
        if ($request->target_device === 'exhaust_fan' && $action === 'STOP') {
            $action = 'OFF';
        }

        Command::create([
            'device_id' => $deviceId,
            'target_device' => $request->target_device,
            'action' => $action,
            'status' => 'pending'
        ]);

        // Set manual mode — fuzzy logic tidak akan override
        SystemSettings::firstOrCreate(['id' => 1])->update(['mode' => 'manual']);

        // Langsung update DeviceActuator sesuai perintah manual
        $speedMap = ['LOW' => 30, 'MEDIUM' => 60, 'HIGH' => 100];
        if ($request->target_device === 'exhaust_fan') {
            DeviceActuator::updateOrCreate(
                ['device_id' => $deviceId],
                [
                    'fan_status' => $action,
                    'fan_speed' => $action === 'OFF' ? 0 : ($speedMap[$action] ?? 100),
                ]
            );
        } else {
            DeviceActuator::updateOrCreate(
                ['device_id' => $deviceId],
                [
                    'alarm_status' => $action === 'START' ? 'ON' : 'OFF',
                ]
            );
        }

        ActivityLog::create([
            'action_type' => 'MANUAL_COMMAND',
            'status' => 'AMAN',
            'description' => "Mode: MANUAL — {$action} → {$request->target_device}",
            'message' => "Manual: {$action} → {$request->target_device}"
        ]);

        return response()->json(['status' => 'success', 'mode' => 'manual']);
    }

    public function setMode(Request $request)
    {
        $request->validate([
            'mode' => 'required|in:auto,manual'
        ]);

        SystemSettings::firstOrCreate(['id' => 1])->update(['mode' => $request->mode]);

        ActivityLog::create([
            'action_type' => 'MODE_SWITCH',
            'status' => 'AMAN',
            'description' => "Mode diubah ke " . strtoupper($request->mode),
            'message' => "Mode: " . strtoupper($request->mode)
        ]);

        return response()->json(['status' => 'success', 'mode' => $request->mode]);
    }

    public function getPendingCommand(Request $request)
    {
        $request->validate([
            'device_id' => 'required|integer'
        ]);

        $command = DB::transaction(function () use ($request) {
            $cmd = Command::where('status', 'pending')
                ->where('device_id', $request->device_id)
                ->orderBy('id')
                ->lockForUpdate()
                ->first();

            if ($cmd) {
                $cmd->update(['status' => 'processing']);
            }

            return $cmd;
        });

        if ($command) {
            return response()->json(['status' => 'success', 'data' => $command]);
        }

        return response()->json(['status' => 'empty', 'message' => 'No pending commands']);
    }

    public function updateWorkerStatus(Request $request)
    {
        $request->validate([
            'command_id' => 'required|integer',
            'status' => 'required|in:completed,failed'
        ]);

        $command = Command::find($request->command_id);
        
        if ($command) {
            $command->update(['status' => $request->status]);
            // Jangan log di activity log - sudah ditampilkan di worker status card
            return response()->json(['status' => 'success']);
        }

        return response()->json(['status' => 'error', 'message' => 'Command not found'], 404);
    }

    public function workerHeartbeat(Request $request)
    {
        $request->validate([
            'component_name' => 'required|string',
            'current_state' => 'required|string'
        ]);

        WorkerStatus::updateOrCreate(
            ['component_name' => $request->component_name],
            ['current_state' => $request->current_state, 'last_heartbeat' => now()]
        );

        return response()->json(['status' => 'alive']);
    }

    public function clearWorkerStatus()
    {
        try {
            WorkerStatus::truncate();

            ActivityLog::create([
                'action_type' => 'SYSTEM_UPDATE',
                'status' => 'AMAN',
                'description' => "Worker status cleared manually",
                'message' => "🗑️ All worker statuses have been cleared"
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Worker status cleared',
                'worker_online' => false,
                'worker_status' => null
            ]);
        } catch (\Exception $e) {
            Log::error("clearWorkerStatus error: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function getDevices()
    {
        $devices = Device::all();
        return response()->json(['status' => 'success', 'data' => $devices]);
    }

    public function createDevice(Request $request)
    {
        $request->validate([
            'device_name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'api_key' => 'nullable|string|max:255',
        ]);

        $device = Device::create([
            'device_name' => $request->device_name,
            'location' => $request->location,
            'api_key' => $request->api_key,
            'status' => $request->status ?? 'offline',
        ]);

        return response()->json(['status' => 'success', 'data' => $device], 201);
    }

    public function updateDevice(Request $request, $id)
    {
        $device = Device::find($id);
        if (!$device) {
            return response()->json(['status' => 'error', 'message' => 'Device not found'], 404);
        }

        $device->update($request->only(['device_name', 'location', 'status']));
        return response()->json(['status' => 'success', 'data' => $device]);
    }

    public function resetDevice($id)
    {
        $device = Device::find($id);
        if (!$device) {
            return response()->json(['status' => 'error', 'message' => 'Device not found'], 404);
        }

        $device->update(['status' => 'offline']);
        Command::where('device_id', $id)->delete();
        DeviceActuator::where('device_id', $id)->delete();
        SensorData::where('device_id', $id)->delete();

        return response()->json(['status' => 'success', 'message' => 'Device reset']);
    }

    public function getUser()
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'id' => 1,
                'name' => 'Admin',
                'email' => 'admin@smartsafety.local',
            ]);
        }
        return response()->json($user);
    }

    public function logout()
    {
        if (auth()->check()) {
            auth()->user()->currentAccessToken()->delete();
        }
        return response()->json(['status' => 'success', 'message' => 'Logged out']);
    }
}