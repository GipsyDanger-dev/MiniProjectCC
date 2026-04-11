<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SensorData;
use App\Models\Command;
use App\Models\ActivityLog;
use App\Models\WorkerStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ApiController extends Controller
{
    // ingestData, getPendingCommand, dll tetap sama seperti sebelumnya...
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

            $gasThresh = 250;
            $smokeThresh = 120;
            $tempThresh = 40;
            $flameThresh = 500;
            $mode = 'auto';

            $status_indikasi = 'AMAN';
            $triggers = [];

            if ($request->gas_value > $gasThresh) $triggers[] = "Gas Tinggi";
            if ($request->smoke_value > $smokeThresh) $triggers[] = "Asap Pekat";
            if ($request->temperature > $tempThresh) $triggers[] = "Suhu Panas";
            if ($request->flame_value < $flameThresh) $triggers[] = "Api Terdeteksi";

            if (!empty($triggers)) {
                $status_indikasi = 'BAHAYA';

                if ($mode === 'auto') {
                    Command::updateOrCreate(
                        ['target_device' => 'exhaust_fan'],
                        ['action' => 'START', 'status' => 'pending']
                    );
                    Command::updateOrCreate(
                        ['target_device' => 'buzzer'],
                        ['action' => 'START', 'status' => 'pending']
                    );
                }
            } else {
                $lastFan = Command::where('target_device', 'exhaust_fan')->latest()->first();
                if ($lastFan && $lastFan->action === 'START') {
                    Command::create([
                        'target_device' => 'exhaust_fan',
                        'action' => 'STOP',
                        'status' => 'pending'
                    ]);
                }
            }

            // Simpan sensor data
            $sensorData = SensorData::create([
                'device_id' => $request->device_id,
                'gas_value' => $request->gas_value,
                'smoke_value' => $request->smoke_value,
                'temperature' => $request->temperature,
                'flame_value' => $request->flame_value,
                'status_indikasi' => $status_indikasi
            ]);

            // Log Activity - tetap log meski ada error, jangan hentikan respons
            if ($status_indikasi === 'BAHAYA') {
                $sensorDetails = [];
                if ($request->gas_value > $gasThresh) 
                    $sensorDetails[] = "Gas={$request->gas_value}ppm (threshold={$gasThresh})";
                if ($request->smoke_value > $smokeThresh) 
                    $sensorDetails[] = "Smoke={$request->smoke_value}ppm (threshold={$smokeThresh})";
                if ($request->temperature > $tempThresh) 
                    $sensorDetails[] = "Temp={$request->temperature}°C (threshold={$tempThresh})";
                if ($request->flame_value < $flameThresh) 
                    $sensorDetails[] = "Flame={$request->flame_value} (threshold={$flameThresh})";
                $triggerDetails = implode(" | ", $sensorDetails);
                $message = "[🔴 BAHAYA] Device {$request->device_id} | Sensors: {$triggerDetails}";
            } else {
                $message = "[🟢 AMAN] Device {$request->device_id} | All sensors within safe range";
            }

            ActivityLog::create([
                'action_type' => 'SENSOR_DATA',
                'status' => $status_indikasi,
                'description' => "Device {$request->device_id}: G={$request->gas_value}, S={$request->smoke_value}, T={$request->temperature}, F={$request->flame_value}",
                'message' => $message
            ]);

            return response()->json(['status' => 'success', 'data' => $sensorData], 201);
            
        } catch (\Exception $e) {
            \Log::error("ingestData error: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function dashboard(Request $request)
    {
        try {
            // Ambil device_id dari request, default ke 1
            $deviceId = $request->query('device_id', 1);

            // Filter data sensor berdasarkan device_id
            $sensorData = DB::table('sensor_data')
                ->leftJoin('devices', 'sensor_data.device_id', '=', 'devices.id')
                ->select('sensor_data.*', 'devices.device_name')
                ->where('sensor_data.device_id', $deviceId)
                ->orderBy('sensor_data.created_at', 'desc')
                ->take(20)
                ->get();

            $logs = ActivityLog::orderBy('created_at', 'desc')->take(15)->get();
            $worker = WorkerStatus::first();
            
            $isEmergency = collect($sensorData)->contains('status_indikasi', 'BAHAYA');
            $workerOnline = $worker && $worker->last_heartbeat ? now()->diffInSeconds($worker->last_heartbeat) <= 60 : false;

            return response()->json([
                'status' => 'success',
                'device_id' => $deviceId,
                'sensor_data' => $sensorData,
                'activity_logs' => $logs,
                'worker_status' => $worker,
                'worker_online' => $workerOnline,
                'emergency_status' => $isEmergency ? 'BAHAYA' : 'AMAN',
                'settings' => [
                    'gas_threshold' => Cache::get('gas_threshold', 250),
                    'smoke_threshold' => Cache::get('smoke_threshold', 120),
                    'temperature_threshold' => Cache::get('temperature_threshold', 40),
                    'flame_threshold' => Cache::get('flame_threshold', 500)
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }


  public function saveSettings(Request $request)
    {
        $request->validate([
            'gas_threshold' => 'required|numeric',
            'smoke_threshold' => 'required|numeric',
            'temperature_threshold' => 'required|numeric',
            'flame_threshold' => 'required|numeric', // Validasi flame
        ]);

        Cache::put('gas_threshold', $request->gas_threshold);
        Cache::put('smoke_threshold', $request->smoke_threshold);
        Cache::put('temperature_threshold', $request->temperature_threshold);
        Cache::put('flame_threshold', $request->flame_threshold);

        // PERBAIKAN DI SINI: Sertakan kolom 'message' agar database tidak menolak
        ActivityLog::create([
            'action_type' => 'SYSTEM_UPDATE',
            'status' => 'AMAN',
            'description' => "Pengaturan batas sensor disimpan.",
            'message' => "User memperbarui ambang batas sensor melalui dashboard." 
        ]);

        return response()->json(['status' => 'success']);
    }

    public function controlActuator(Request $request)
    {
        $request->validate([
            'target_device' => 'required|in:exhaust_fan,buzzer',
            'action' => 'required|in:START,STOP'
        ]);

        Command::create([
            'target_device' => $request->target_device,
            'action' => $request->action,
            'status' => 'pending'
        ]);

        ActivityLog::create([
            'action_type' => 'MANUAL_COMMAND',
            'status' => 'AMAN',
            'description' => "Perintah manual {$request->action} dikirim ke {$request->target_device}",
            'message' => "Manual: {$request->action} → {$request->target_device}"
        ]);

        return response()->json(['status' => 'success']);
    }

    // ============ WORKER METHODS ============

    public function getPendingCommand()
    {
        $command = Command::where('status', 'pending')->first();

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

            ActivityLog::create([
                'action_type' => 'COMMAND_EXECUTED',
                'status' => 'AMAN',
                'description' => "Perintah {$command->target_device} - {$command->action} berhasil di-{$request->status}",
                'message' => "Worker: {$command->target_device} {$request->status}"
            ]);

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
}