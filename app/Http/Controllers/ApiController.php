<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SensorData;
use App\Models\Command;
use App\Models\ActivityLog;
use App\Models\DeviceActuator;
use App\Models\WorkerStatus;
use App\Models\Device;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Events\SensorDataReceived;
use App\Models\SystemSettings;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ApiController extends Controller
{
    private function triangularMembership(float $value, float $left, float $peak, float $right): float
    {
        if ($value < $left || $value > $right) {
            return 0.0;
        }

        // Trapezoidal edge case: left === peak means flat top
        if ($value === $right && $right !== $peak) {
            return 0.0;
        }

        if ($value < $peak) {
            $denominator = $peak - $left;
            return $denominator > 0 ? ($value - $left) / $denominator : 1.0;
        }

        if ($value > $peak) {
            $denominator = $right - $peak;
            return $denominator > 0 ? ($right - $value) / $denominator : 1.0;
        }

        return 1.0;
    }

    private function buildFuzzyDecision(float $gas, float $smoke, float $temperature, float $flame, float $flameThreshold, float $gasThreshold = 2500, float $smokeThreshold = 2000, float $tempThreshold = 45): array
    {
        // KY-026 active-low: lower value = more fire
        if ($flame < $flameThreshold) {
            return [
                'score' => 100.0,
                'fan_status' => 'HIGH',
                'fan_speed' => 100,
                'buzzer_action' => 'HIGH',
                'profile' => 'FLAME_OVERRIDE',
                'rules' => [['Flame override', 1.0, 100]],
                'reason' => 'Flame sensor crossed the emergency threshold'
            ];
        }

        // ESP32 12-bit ADC = 4095
        $adcMax = 4095;

        $gasLow    = $this->triangularMembership($gas, 0, 0, $gasThreshold);
        $gasMedium = $this->triangularMembership($gas, $gasThreshold * 0.8, $gasThreshold, $gasThreshold * 1.2);
        $gasHigh   = $this->triangularMembership($gas, $gasThreshold * 1.1, $gasThreshold * 1.5, $adcMax);

        $smokeLow    = $this->triangularMembership($smoke, 0, 0, $smokeThreshold);
        $smokeMedium = $this->triangularMembership($smoke, $smokeThreshold * 0.8, $smokeThreshold, $smokeThreshold * 1.2);
        $smokeHigh   = $this->triangularMembership($smoke, $smokeThreshold * 1.1, $smokeThreshold * 1.5, $adcMax);

        $tempNormal = $this->triangularMembership($temperature, 0, 0, $tempThreshold);
        $tempWarm   = $this->triangularMembership($temperature, $tempThreshold * 0.8, $tempThreshold, $tempThreshold * 1.2);
        $tempHot    = $this->triangularMembership($temperature, $tempThreshold * 1.1, $tempThreshold * 1.5, $tempThreshold * 2.5);

        // Sugeno 27 rules: output values SAFE=0, LOW=30, MEDIUM=60, HIGH=100
        $rules = [
            ['SAFE',   min($gasLow, $smokeLow,    $tempNormal),  0],    // R1:  all low/normal
            ['LOW',    min($gasLow, $smokeLow,    $tempWarm),   30],    // R2:  low gas, low smoke, warm
            ['HIGH',   min($gasLow, $smokeLow,    $tempHot),   100],    // R3:  low gas, low smoke, HOT

            ['LOW',    min($gasLow, $smokeMedium, $tempNormal), 30],    // R4:  low gas, medium smoke, normal temp
            ['MEDIUM', min($gasLow, $smokeMedium, $tempWarm),   60],    // R5:  low gas, medium smoke, warm
            ['HIGH',   min($gasLow, $smokeMedium, $tempHot),   100],    // R6:  low gas, medium smoke, HOT

            ['HIGH',   min($gasLow, $smokeHigh,   $tempNormal),100],    // R7:  low gas, HIGH smoke
            ['HIGH',   min($gasLow, $smokeHigh,   $tempWarm),  100],    // R8:  low gas, HIGH smoke, warm
            ['HIGH',   min($gasLow, $smokeHigh,   $tempHot),   100],    // R9

            ['LOW',    min($gasMedium, $smokeLow,    $tempNormal), 30], // R10
            ['MEDIUM', min($gasMedium, $smokeLow,    $tempWarm),   60], // R11: medium gas, low smoke, warm
            ['HIGH',   min($gasMedium, $smokeLow,    $tempHot),   100], // R12: medium gas, low smoke, HOT

            ['MEDIUM', min($gasMedium, $smokeMedium, $tempNormal), 60], // R13: medium gas, medium smoke, normal
            ['MEDIUM', min($gasMedium, $smokeMedium, $tempWarm),   60], // R14: medium gas, medium smoke, warm
            ['HIGH',   min($gasMedium, $smokeMedium, $tempHot),   100], // R15: medium gas, medium smoke, HOT

            ['HIGH',   min($gasMedium, $smokeHigh,   $tempNormal),100], // R16: medium gas, HIGH smoke
            ['HIGH',   min($gasMedium, $smokeHigh,   $tempWarm),  100], // R17: medium gas, HIGH smoke, warm
            ['HIGH',   min($gasMedium, $smokeHigh,   $tempHot),   100], // R18

            ['HIGH',   min($gasHigh, $smokeLow,    $tempNormal), 100],  // R19
            ['HIGH',   min($gasHigh, $smokeLow,    $tempWarm),   100],  // R20: HIGH gas, warm
            ['HIGH',   min($gasHigh, $smokeLow,    $tempHot),    100],  // R21: HIGH gas, HOT

            ['HIGH',   min($gasHigh, $smokeMedium, $tempNormal), 100],  // R22: HIGH gas, medium smoke
            ['HIGH',   min($gasHigh, $smokeMedium, $tempWarm),   100],  // R23: HIGH gas, medium smoke, warm
            ['HIGH',   min($gasHigh, $smokeMedium, $tempHot),    100],  // R24: HIGH gas, medium smoke, HOT

            ['HIGH',   min($gasHigh, $smokeHigh,   $tempNormal), 100],  // R25: HIGH gas, HIGH smoke
            ['HIGH',   min($gasHigh, $smokeHigh,   $tempWarm),   100],  // R26: HIGH gas, HIGH smoke, warm
            ['HIGH',   min($gasHigh, $smokeHigh,   $tempHot),    100],  // R27: HIGH gas, HIGH smoke, HOT
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
            $buzzerAction = 'HIGH';
            $profile = 'HIGH';
        } elseif ($score > 40) {
            $fanStatus = 'MEDIUM';
            $fanSpeed = 60;
            $buzzerAction = 'MEDIUM';
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
            'reason' => 'Sugeno weighted average on gas, smoke, and temperature (27 rules)',
        ];
    }

    private function syncActuatorCommands(int $deviceId, array $decision): void
    {
        $settings = SystemSettings::firstOrCreate(['id' => 1]);
        if ($settings->mode === 'manual') {
            if ($decision['profile'] === 'FLAME_OVERRIDE') {
                ActivityLog::create([
                    'device_id' => $deviceId,
                    'action_type' => 'EMERGENCY_OVERRIDE',
                    'status' => 'BAHAYA',
                    'description' => 'Flame detected in manual mode — emergency override activated',
                    'message' => 'Emergency override: flame detected'
                ]);
            } else {
                return;
            }
        }

        $fanStatus = $decision['fan_status'];
        $buzzerStatus = $decision['buzzer_action'] !== 'STOP' ? 'ON' : 'OFF';

        DeviceActuator::updateOrCreate(
            ['device_id' => $deviceId],
            [
                'fan_status' => $fanStatus,
                'alarm_status' => $buzzerStatus,
                'fan_speed' => $fanStatus === 'OFF' ? 0 : $decision['fan_speed'],
            ]
        );

        $lastFan = Command::where('device_id', $deviceId)
            ->where('target_device', 'exhaust_fan')
            ->where('status', 'pending')
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastFan || $lastFan->action !== $fanStatus) {
            Command::create([
                'device_id' => $deviceId,
                'target_device' => 'exhaust_fan',
                'action' => $fanStatus,
                'status' => 'pending'
            ]);
        }

        $lastBuzzer = Command::where('device_id', $deviceId)
            ->where('target_device', 'buzzer')
            ->where('status', 'pending')
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastBuzzer || $lastBuzzer->action !== $decision['buzzer_action']) {
            Command::create([
                'device_id' => $deviceId,
                'target_device' => 'buzzer',
                'action' => $decision['buzzer_action'],
                'status' => 'pending'
            ]);
        }
    }

    private function buildActivityMessage(int $deviceId, array $decision, float $gas, float $smoke, float $temperature, float $flame, float $gasTh, float $smokeTh, float $tempTh, float $flameTh): array
    {
        $alerts = [];
        $warnings = [];

        // Flame: active-low, lower = more dangerous
        if ($flame < $flameTh) {
            $alerts[] = "Flame {$flame}/{$flameTh}";
        } elseif ($flame < $flameTh * 1.2) {
            $warnings[] = "Flame {$flame}/{$flameTh}";
        }

        if ($gas > $gasTh) {
            $alerts[] = "Gas {$gas}/{$gasTh}";
        } elseif ($gas > $gasTh * 0.8) {
            $warnings[] = "Gas {$gas}/{$gasTh}";
        }

        if ($smoke > $smokeTh) {
            $alerts[] = "Smoke {$smoke}/{$smokeTh}";
        } elseif ($smoke > $smokeTh * 0.8) {
            $warnings[] = "Smoke {$smoke}/{$smokeTh}";
        }

        if ($temperature > $tempTh) {
            $alerts[] = "Temp {$temperature}C/{$tempTh}C";
        } elseif ($temperature > $tempTh * 0.85) {
            $warnings[] = "Temp {$temperature}C/{$tempTh}C";
        }

        $alertStr = implode(", ", $alerts);
        $warningStr = implode(", ", $warnings);

        if (($decision['profile'] ?? null) === 'FLAME_OVERRIDE') {
            return [
                'status' => 'BAHAYA',
                'message' => "Flame detected — emergency fan activated",
                'description' => "Triggered: {$alertStr} | Gas: {$gas}, Smoke: {$smoke}, Temp: {$temperature}C, Flame: {$flame}",
                'triggers' => $alerts,
                'warnings' => $warnings,
            ];
        }

        $status = ($decision['fan_status'] === 'OFF') ? 'AMAN' : 'BAHAYA';

        if ($status === 'BAHAYA') {
            return [
                'status' => $status,
                'message' => "Threshold exceeded — fan {$decision['fan_status']}",
                'description' => "Triggered: {$alertStr}" . ($warningStr ? " | Near limit: {$warningStr}" : "") . " | Gas: {$gas}, Smoke: {$smoke}, Temp: {$temperature}C, Flame: {$flame}",
                'triggers' => $alerts,
                'warnings' => $warnings,
            ];
        }

        $descParts = ["Gas: {$gas}/{$gasTh}", "Smoke: {$smoke}/{$smokeTh}", "Temp: {$temperature}C/{$tempTh}C", "Flame: {$flame}/{$flameTh}"];
        if ($warningStr) {
            return [
                'status' => 'AMAN',
                'message' => "All sensors normal — approaching limit",
                'description' => "Near limit: {$warningStr} | " . implode(", ", $descParts),
                'triggers' => [],
                'warnings' => $warnings,
            ];
        }

        return [
            'status' => 'AMAN',
            'message' => "All sensors normal — fan off",
            'description' => implode(", ", $descParts),
            'triggers' => [],
            'warnings' => [],
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

            // Auto-switch back to auto mode after 30s without manual command
            if ($settings->mode === 'manual' && $settings->last_manual_command) {
                if (now()->diffInSeconds($settings->last_manual_command) > 30) {
                    $settings->update(['mode' => 'auto']);
                    ActivityLog::create([
                        'device_id' => $request->device_id,
                        'action_type' => 'MODE_SWITCH',
                        'status' => 'AMAN',
                        'description' => 'Auto-switched back to AUTO mode after 30s inactivity',
                        'message' => 'Returned to AUTO mode'
                    ]);
                }
            }

            $gasThresh = Cache::get('gas_threshold', $settings->gas_threshold ?? 2500);
            $smokeThresh = Cache::get('smoke_threshold', $settings->smoke_threshold ?? 2000);
            $tempThresh = Cache::get('temperature_threshold', $settings->temperature_threshold ?? 45);
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

            $sensorData = DB::transaction(function () use ($request, $decision, $status_indikasi, $gasThresh, $smokeThresh, $tempThresh, $flameThresh) {
                $this->syncActuatorCommands($request->device_id, $decision);

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
                    (float) $gasThresh,
                    (float) $smokeThresh,
                    (float) $tempThresh,
                    (float) $flameThresh
                );

                ActivityLog::create([
                    'device_id' => $request->device_id,
                    'action_type' => 'SENSOR_DATA',
                    'status' => $activity['status'],
                    'description' => $activity['description'],
                    'message' => $activity['message']
                ]);

                return $sensorData;
            });

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

            $sensorData = SensorData::where('device_id', $deviceId)
                ->orderBy('id', 'desc')
                ->limit(20)
                ->get();

            $latestSensorData = $sensorData->first();

            $logs = ActivityLog::where(function ($q) use ($deviceId) {
                    $q->where('device_id', $deviceId)->orWhereNull('device_id');
                })
                ->orderBy('created_at', 'desc')
                ->limit(15)
                ->get();

            $worker = WorkerStatus::first();

            $latestCommand = Command::where('device_id', $deviceId)
                ->orderBy('updated_at', 'desc')
                ->select('id', 'device_id', 'target_device', 'action', 'status', 'updated_at')
                ->first();

            $latestActuator = DeviceActuator::where('device_id', $deviceId)
                ->orderBy('updated_at', 'desc')
                ->first();

            $isEmergency = $latestSensorData && $latestSensorData->status_indikasi === 'BAHAYA';
            $workerOnline = $worker && $worker->last_heartbeat ? now()->diffInSeconds($worker->last_heartbeat) <= 60 : false;

            $settings = SystemSettings::firstOrCreate(['id' => 1]);

            $response = [
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
                    'gas_threshold' => Cache::get('gas_threshold', $settings->gas_threshold ?? 2500),
                    'smoke_threshold' => Cache::get('smoke_threshold', $settings->smoke_threshold ?? 2000),
                    'humidity_threshold' => Cache::get('humidity_threshold', $settings->humidity_threshold ?? 70),
                    'temperature_threshold' => Cache::get('temperature_threshold', $settings->temperature_threshold ?? 45),
                    'flame_threshold' => Cache::get('flame_threshold', $settings->flame_threshold ?? 500)
                ]
            ];

            return response()->json($response);
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
                'humidity_threshold' => 'nullable|numeric',
                'temperature_threshold' => 'required|numeric',
                'flame_threshold' => 'required|numeric',
            ]);

            SystemSettings::updateOrCreate(
                ['id' => 1],
                [
                    'gas_threshold' => $request->gas_threshold,
                    'smoke_threshold' => $request->smoke_threshold,
                    'humidity_threshold' => $request->humidity_threshold ?? 70,
                    'temperature_threshold' => $request->temperature_threshold,
                    'flame_threshold' => $request->flame_threshold,
                ]
            );

            Cache::put('gas_threshold', $request->gas_threshold);
            Cache::put('smoke_threshold', $request->smoke_threshold);
            Cache::put('humidity_threshold', $request->humidity_threshold ?? 70);
            Cache::put('temperature_threshold', $request->temperature_threshold);
            Cache::put('flame_threshold', $request->flame_threshold);

            ActivityLog::create([
                'action_type' => 'SYSTEM_UPDATE',
                'status' => 'AMAN',
                'description' => "Gas: {$request->gas_threshold}, Smoke: {$request->smoke_threshold}, Humidity: {$request->humidity_threshold}%, Temp: {$request->temperature_threshold}C, Flame: {$request->flame_threshold}",
                'message' => "Threshold settings updated"
            ]);

            return response()->json(['status' => 'success', 'message' => 'Settings saved successfully']);
        } catch (\Exception $e) {
            Log::error("saveSettings error: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function devices()
    {
        $devices = Device::query()
            ->orderBy('id')
            ->get(['id', 'device_name', 'location', 'status', 'api_key']);

        return response()->json([
            'status' => 'success',
            'devices' => $devices,
        ]);
    }

    public function createDevice(Request $request)
    {
        $validated = $request->validate([
            'device_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'api_key' => 'required|string|max:255|unique:devices,api_key',
            'status' => 'nullable|in:online,offline',
        ]);

        $device = Device::create([
            'device_name' => $validated['device_name'],
            'location' => $validated['location'],
            'api_key' => $validated['api_key'],
            'status' => $validated['status'] ?? 'offline',
        ]);

        return response()->json([
            'status' => 'success',
            'device' => $device->only([
                'id',
                'device_name',
                'location',
                'status',
                'api_key',
            ]),
        ]);
    }

    public function updateDevice(Request $request, Device $device)
    {
        $validated = $request->validate([
            'device_name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:50',
        ]);

        $device->fill($validated);
        $device->save();

        return response()->json([
            'status' => 'success',
            'device' => $device->only([
                'id',
                'device_name',
                'location',
                'status',
                'api_key',
            ]),
        ]);
    }

    public function resetDevice(Device $device)
    {
        $device->status = 'offline';
        $device->save();

        ActivityLog::create([
            'action_type' => 'SYSTEM_UPDATE',
            'status' => 'AMAN',
            'description' => "Device {$device->id} reset",
            'message' => "Device {$device->device_name} reset to offline",
        ]);

        return response()->json([
            'status' => 'success',
            'device' => $device->only(['id', 'status']),
        ]);
    }

    public function getSettings()
    {
        $settings = SystemSettings::firstOrCreate(['id' => 1]);
        return response()->json([
            'status' => 'success',
            'settings' => [
                'gas_threshold' => (float) ($settings->gas_threshold ?? 2500),
                'smoke_threshold' => (float) ($settings->smoke_threshold ?? 2000),
                'humidity_threshold' => (float) ($settings->humidity_threshold ?? 70),
                'temperature_threshold' => (float) ($settings->temperature_threshold ?? 45),
                'flame_threshold' => (float) ($settings->flame_threshold ?? 500),
            ]
        ]);
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
            $allowedActions = ['START', 'STOP', 'MEDIUM', 'HIGH'];
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
        if ($request->target_device === 'buzzer' && $action === 'START') {
            $action = 'HIGH';
        }

        // Set manual mode BEFORE creating command to prevent race condition
        SystemSettings::firstOrCreate(['id' => 1])->update([
            'mode' => 'manual',
            'last_manual_command' => now(),
        ]);

        Command::create([
            'device_id' => $deviceId,
            'target_device' => $request->target_device,
            'action' => $action,
            'status' => 'pending'
        ]);

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
                    'alarm_status' => $action !== 'STOP' ? 'ON' : 'OFF',
                ]
            );
        }

        ActivityLog::create([
            'device_id' => $deviceId,
            'action_type' => 'MANUAL_COMMAND',
            'status' => 'AMAN',
            'description' => "Manual command: {$action} sent to {$request->target_device}",
            'message' => "Manual control: {$request->target_device} set to {$action}"
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
            'description' => "System mode changed to " . strtoupper($request->mode),
            'message' => "Switched to " . strtoupper($request->mode) . " mode"
        ]);

        return response()->json(['status' => 'success', 'mode' => $request->mode]);
    }

    public function emergency(Request $request)
    {
        $deviceId = $request->device_id ?? 1;
        $settings = SystemSettings::firstOrCreate(['id' => 1]);
        $actuator = DeviceActuator::where('device_id', $deviceId)->first();

        $isCurrentlyActive = $actuator && $actuator->fan_status !== 'OFF' && $actuator->alarm_status === 'ON';

        if ($isCurrentlyActive) {
            SystemSettings::firstOrCreate(['id' => 1])->update([
                'mode' => 'auto',
                'last_manual_command' => null,
            ]);

            DeviceActuator::updateOrCreate(
                ['device_id' => $deviceId],
                ['fan_status' => 'OFF', 'fan_speed' => 0, 'alarm_status' => 'OFF']
            );

            Command::create(['device_id' => $deviceId, 'target_device' => 'exhaust_fan', 'action' => 'OFF', 'status' => 'pending']);
            Command::create(['device_id' => $deviceId, 'target_device' => 'buzzer', 'action' => 'STOP', 'status' => 'pending']);

            ActivityLog::create([
                'device_id' => $deviceId,
                'action_type' => 'EMERGENCY',
                'status' => 'AMAN',
                'description' => 'Emergency deactivated — all actuators OFF',
                'message' => 'EMERGENCY OFF'
            ]);

            return response()->json(['status' => 'success', 'message' => 'Emergency deactivated', 'active' => false]);
        }

        SystemSettings::firstOrCreate(['id' => 1])->update([
            'mode' => 'manual',
            'last_manual_command' => now(),
        ]);

        DeviceActuator::updateOrCreate(
            ['device_id' => $deviceId],
            ['fan_status' => 'HIGH', 'fan_speed' => 100, 'alarm_status' => 'ON']
        );

        Command::create(['device_id' => $deviceId, 'target_device' => 'exhaust_fan', 'action' => 'HIGH', 'status' => 'pending']);
        Command::create(['device_id' => $deviceId, 'target_device' => 'buzzer', 'action' => 'HIGH', 'status' => 'pending']);

        ActivityLog::create([
            'device_id' => $deviceId,
            'action_type' => 'EMERGENCY',
            'status' => 'BAHAYA',
            'description' => 'Emergency activated — all actuators set to maximum',
            'message' => 'EMERGENCY ON: Fan HIGH + Buzzer HIGH'
        ]);

        return response()->json(['status' => 'success', 'message' => 'Emergency activated', 'active' => true]);
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
                'description' => "All worker status records cleared from database",
                'message' => "Worker statuses cleared"
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

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['status' => 'error', 'message' => 'Invalid credentials'], 401);
        }

        session()->put('user_id', $user->id);
        session()->put('user_name', $user->name);
        session()->put('user_email', $user->email);

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]
        ]);
    }

    public function logout(Request $request)
    {
        session()->forget(['user_id', 'user_name', 'user_email']);
        session()->flush();

        return response()->json(['status' => 'success', 'message' => 'Logout successful']);
    }

    public function getUser(Request $request)
    {
        $userId = session()->get('user_id');

        if (!$userId) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $user = User::find($userId);

        if (!$user) {
            session()->flush();
            return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email
            ]
        ]);
    }
}
