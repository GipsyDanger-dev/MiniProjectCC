<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SensorData;
use App\Models\Device;
use App\Models\WorkerStatus; 
use App\Models\Command;      
use App\Models\ActivityLog;  

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

        $status_indikasi = 'AMAN';

        if ($request->gas_value > 300 || $request->smoke_value > 200 || $request->temperature > 45) {
            $status_indikasi = 'BAHAYA';

            $cekExhaust = Command::where('target_device', 'exhaust_fan')
                                 ->where('status', 'pending')
                                 ->first();
            if (!$cekExhaust) {
                Command::create([
                    'target_device' => 'exhaust_fan',
                    'action' => 'START',
                    'status' => 'pending'
                ]);
            }

            $cekBuzzer = Command::where('target_device', 'buzzer')
                                ->where('status', 'pending')
                                ->first();
            if (!$cekBuzzer) {
                Command::create([
                    'target_device' => 'buzzer',
                    'action' => 'START',
                    'status' => 'pending'
                ]);
            }
        }


        $sensorData = SensorData::create([
            'device_id' => $request->device_id,
            'gas_value' => $request->gas_value,
            'smoke_value' => $request->smoke_value,
            'temperature' => $request->temperature,
            'status_indikasi' => $status_indikasi
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Data sensor mendarat dengan aman!',
            'data' => $sensorData
        ], 201);
    }


    public function getPendingCommand()
    {
        $command = Command::where('status', 'pending')->first();

        if ($command) {
            $command->update(['status' => 'processing']);

            return response()->json([
                'status' => 'success',
                'data' => $command
            ]);
        }

        return response()->json([
            'status' => 'empty',
            'message' => 'Tidak ada antrean perintah'
        ]);
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
                'description' => "Perangkat {$command->target_device} berhasil diubah statusnya menjadi {$command->action}"
            ]);

            return response()->json(['status' => 'success']);
        }

        return response()->json(['status' => 'error', 'message' => 'Command tidak ditemukan'], 404);
    }

public function workerHeartbeat(Request $request)
    {
        $request->validate([
            'component_name' => 'required|string',
            'current_state' => 'required|string',
        ]);


        WorkerStatus::updateOrCreate(
            ['component_name' => $request->component_name],
            [
                'current_state' => $request->current_state,
                'last_heartbeat' => now()
            ]
        );

        return response()->json(['status' => 'alive']);
    }

}