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
    public function ingestData(Request $request)
    {
        $request->validate([
            'device_id' => 'required|integer',
            'gas_value' => 'required|numeric',
            'smoke_value' => 'required|numeric',
            'temperature' => 'required|numeric',
        ]);

        $gasThresh = Cache::get('gas_threshold', 300);
        $smokeThresh = Cache::get('smoke_threshold', 200);
        $tempThresh = Cache::get('temperature_threshold', 45);
        $mode = Cache::get('system_mode', 'auto');

        $status_indikasi = 'AMAN';

        if ($request->gas_value > $gasThresh || $request->smoke_value > $smokeThresh || $request->temperature > $tempThresh) {
            $status_indikasi = 'BAHAYA';
            if ($mode === 'auto') {
                $lastExhaust = Command::where('target_device', 'exhaust_fan')->latest()->first();
                if (!$lastExhaust || $lastExhaust->action !== 'START') {
                    Command::create(['target_device' => 'exhaust_fan', 'action' => 'START', 'status' => 'pending']);
                }
                $lastBuzzer = Command::where('target_device', 'buzzer')->latest()->first();
                if (!$lastBuzzer || $lastBuzzer->action !== 'START') {
                    Command::create(['target_device' => 'buzzer', 'action' => 'START', 'status' => 'pending']);
                }
            }
        } else {
            if ($mode === 'auto') {
                $lastExhaust = Command::where('target_device', 'exhaust_fan')->latest()->first();
                if ($lastExhaust && $lastExhaust->action === 'START') {
                    Command::create(['target_device' => 'exhaust_fan', 'action' => 'STOP', 'status' => 'pending']);
                }
                $lastBuzzer = Command::where('target_device', 'buzzer')->latest()->first();
                if ($lastBuzzer && $lastBuzzer->action === 'START') {
                    Command::create(['target_device' => 'buzzer', 'action' => 'STOP', 'status' => 'pending']);
                }
            }
        }

        $sensorData = SensorData::create([
            'device_id' => $request->device_id,
            'gas_value' => $request->gas_value,
            'smoke_value' => $request->smoke_value,
            'temperature' => $request->temperature,
            'status_indikasi' => $status_indikasi
        ]);

        return response()->json(['status' => 'success', 'data' => $sensorData], 201);
    }

    public function getPendingCommand()
    {
        $command = Command::where('status', 'pending')->first();
        if ($command) {
            $command->update(['status' => 'processing']);
            return response()->json(['status' => 'success', 'data' => $command]);
        }
        return response()->json(['status' => 'empty']);
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
                'description' => "Perangkat {$command->target_device} diubah menjadi {$command->action}"
            ]);
            return response()->json(['status' => 'success']);
        }
        return response()->json(['status' => 'error'], 404);
    }

    public function workerHeartbeat(Request $request)
    {
        $request->validate([
            'component_name' => 'required|string',
            'current_state' => 'required|string',
        ]);
        WorkerStatus::updateOrCreate(
            ['component_name' => $request->component_name],
            ['current_state' => $request->current_state, 'last_heartbeat' => now()]
        );
        return response()->json(['status' => 'alive']);
    }

    public function dashboard()
    {
        $sensorData = DB::table('sensor_data')
            ->join('devices', 'sensor_data.device_id', '=', 'devices.id')
            ->select('sensor_data.*', 'devices.device_name')
            ->orderBy('sensor_data.created_at', 'desc')
            ->take(15)
            ->get();

        $logs = ActivityLog::orderBy('created_at', 'desc')->take(10)->get();
        $worker = WorkerStatus::first();
        $isEmergency = $sensorData->contains('status_indikasi', 'BAHAYA');

        return response()->json([
            'status' => 'success',
            'sensor_data' => $sensorData,
            'activity_logs' => $logs,
            'worker_status' => $worker,
            'emergency_status' => $isEmergency ? 'BAHAYA' : 'AMAN',
            'settings' => [
                'mode' => Cache::get('system_mode', 'auto'),
                'gas_threshold' => Cache::get('gas_threshold', 300),
                'smoke_threshold' => Cache::get('smoke_threshold', 200),
                'temperature_threshold' => Cache::get('temperature_threshold', 45)
            ]
        ]);
    }

    public function saveSettings(Request $request)
    {
        $request->validate([
            'gas_threshold' => 'required|numeric|min:1',
            'smoke_threshold' => 'required|numeric|min:1',
            'temperature_threshold' => 'required|numeric|min:1',
            'mode' => 'required|in:auto,manual'
        ]);

        Cache::put('gas_threshold', $request->gas_threshold);
        Cache::put('smoke_threshold', $request->smoke_threshold);
        Cache::put('temperature_threshold', $request->temperature_threshold);
        Cache::put('system_mode', $request->mode);

        ActivityLog::create([
            'action_type' => 'SYSTEM_UPDATE',
            'description' => "Pengaturan batas sensor & mode {$request->mode} disimpan."
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