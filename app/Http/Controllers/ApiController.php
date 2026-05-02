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
use Illuminate\Support\Facades\Log;

class ApiController extends Controller
{
    private function triangularMembership(float $value, float $left, float $peak, float $right): float
    {
        if ($value <= $left || $value >= $right) {
            return 0.0;
        }

        if ($value === $peak) {
            return 1.0;
        }

        if ($value < $peak) {
            $denominator = $peak - $left;
            return $denominator > 0 ? max(0.0, min(1.0, ($value - $left) / $denominator)) : 1.0;
        }

        $denominator = $right - $peak;
        return $denominator > 0 ? max(0.0, min(1.0, ($right - $value) / $denominator)) : 1.0;
    }

    private function buildFuzzyDecision(float $gas, float $smoke, float $temperature, float $flame, float $flameThreshold): array
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

        $gasLow = $this->triangularMembership($gas, 0, 0, 200);
        $gasMedium = $this->triangularMembership($gas, 150, 275, 400);
        $gasHigh = $this->triangularMembership($gas, 350, 600, 600);

        $smokeLow = $this->triangularMembership($smoke, 0, 0, 100);
        $smokeMedium = $this->triangularMembership($smoke, 80, 165, 250);
        $smokeHigh = $this->triangularMembership($smoke, 200, 400, 400);

        $tempNormal = $this->triangularMembership($temperature, 20, 20, 35);
        $tempWarm = $this->triangularMembership($temperature, 30, 40, 50);
        $tempHot = $this->triangularMembership($temperature, 45, 70, 70);

        $rules = [
            ['SAFE', min($gasLow, $smokeLow, $tempNormal), 0],
            ['LOW', min($gasLow, $smokeMedium), 30],
            ['LOW', min($gasMedium, $smokeLow), 30],
            ['LOW', min($gasLow, $tempWarm), 30],
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
        DeviceActuator::updateOrCreate(
            ['device_id' => $deviceId],
            [
                'fan_status' => $decision['fan_status'],
                'alarm_status' => $decision['buzzer_action'] === 'START' ? 'ON' : 'OFF',
                'fan_speed' => $decision['fan_speed'],
            ]
        );

        Command::updateOrCreate(
            ['target_device' => 'exhaust_fan', 'device_id' => $deviceId],
            ['action' => $decision['fan_status'], 'status' => 'pending']
        );

        Command::updateOrCreate(
            ['target_device' => 'buzzer', 'device_id' => $deviceId],
            ['action' => $decision['buzzer_action'], 'status' => 'pending']
        );
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
                'device_id' => 'required|integer',
                'gas_value' => 'required|numeric',
                'smoke_value' => 'required|numeric',
                'temperature' => 'required|numeric',
                'flame_value' => 'required|numeric'
            ]);

            $gasThresh = Cache::get('gas_threshold', 250);
            $smokeThresh = Cache::get('smoke_threshold', 120);
            $tempThresh = Cache::get('temperature_threshold', 40);
            $flameThresh = Cache::get('flame_threshold', 500);

            $decision = $this->buildFuzzyDecision(
                (float) $request->gas_value,
                (float) $request->smoke_value,
                (float) $request->temperature,
                (float) $request->flame_value,
                (float) $flameThresh
            );

            $status_indikasi = $decision['fan_status'] === 'OFF' ? 'AMAN' : 'BAHAYA';

            $this->syncActuatorCommands($request->device_id, $decision);

            //nyimpen data sensor
            $sensorData = SensorData::create([
                'device_id' => $request->device_id,
                'gas_value' => $request->gas_value,
                'smoke_value' => $request->smoke_value,
                'temperature' => $request->temperature,
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
                'settings' => [
                    'gas_threshold' => Cache::get('gas_threshold', 250),
                    'smoke_threshold' => Cache::get('smoke_threshold', 120),
                    'temp_threshold' => Cache::get('temperature_threshold', 40),
                    'flame_threshold' => Cache::get('flame_threshold', 500)
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
            'device_id' => $request->device_id,
            'target_device' => $request->target_device,
            'action' => $action,
            'status' => 'pending'
        ]);

        ActivityLog::create([
            'action_type' => 'MANUAL_COMMAND',
            'status' => 'AMAN',
            'description' => "Perintah manual {$action} dikirim ke {$request->target_device}",
            'message' => "Manual: {$action} → {$request->target_device}"
        ]);

        return response()->json(['status' => 'success']);
    }


    public function getPendingCommand(Request $request)
    {
        $request->validate([
            'device_id' => 'required|integer'
        ]);

        $command = Command::where('status', 'pending')
            ->where('device_id', $request->device_id)
            ->first();

        if ($command) {
            $command->update(['status' => 'processing']);
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

            Cache::forget('worker_status');

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
}