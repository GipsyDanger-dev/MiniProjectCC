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
        $request->validate([
            'device_id' => 'required|integer',
            'gas_value' => 'required|numeric',
            'smoke_value' => 'required|numeric',
            'temperature' => 'required|numeric',
            'flame_value' => 'required|numeric'
        ]);

        $gasThresh = Cache::get('gas_threshold', 300);
        $smokeThresh = Cache::get('smoke_threshold', 200);
        $tempThresh = Cache::get('temperature_threshold', 45);
        $flameThresh = Cache::get('flame_threshold', 500);
        $mode = Cache::get('system_mode', 'auto');

        $status_indikasi = 'AMAN';
        $pemicuBahaya = [];

        if ($request->gas_value > $gasThresh) $pemicuBahaya[] = "Gas Tinggi";
        if ($request->smoke_value > $smokeThresh) $pemicuBahaya[] = "Asap Pekat";
        if ($request->temperature > $tempThresh) $pemicuBahaya[] = "Suhu Panas";
        if ($request->flame_value < $flameThresh) $pemicuBahaya[] = "Api Terdeteksi";

        if (!empty($pemicuBahaya)) {
            $status_indikasi = 'BAHAYA';
            ActivityLog::create([
                'action_type' => 'SENSOR_ALERT',
                'description' => "Device $request->device_id: " . implode(", ", $pemicuBahaya),
                'message' => "Detail: G:$request->gas_value S:$request->temperature"
            ]);

            if ($mode === 'auto') {
                Command::firstOrCreate(['target_device' => 'exhaust_fan', 'action' => 'START', 'status' => 'pending']);
                Command::firstOrCreate(['target_device' => 'buzzer', 'action' => 'START', 'status' => 'pending']);
            }
        }

        $sensorData = SensorData::create([
            'device_id' => $request->device_id,
            'gas_value' => $request->gas_value,
            'smoke_value' => $request->smoke_value,
            'temperature' => $request->temperature,
            'flame_value' => $request->flame_value,
            'status_indikasi' => $status_indikasi
        ]);

        return response()->json(['status' => 'success', 'data' => $sensorData], 201);
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
                .get();

            $logs = ActivityLog::orderBy('created_at', 'desc')->take(15)->get();
            $worker = WorkerStatus::first();
            
            $isEmergency = $sensorData->contains('status_indikasi', 'BAHAYA');
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
                    'gas_threshold' => Cache::get('gas_threshold', 300),
                    'smoke_threshold' => Cache::get('smoke_threshold', 200),
                    'temperature_threshold' => Cache::get('temperature_threshold', 45),
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
            'description' => "Perintah manual {$request->action} dikirim ke {$request->target_device}"
        ]);

        return response()->json(['status' => 'success']);
    }
}