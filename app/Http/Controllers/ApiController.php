<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SensorData;
use App\Models\Device;
use App\Models\Command;      // Wajib ditambahkan untuk akses tabel commands
use App\Models\ActivityLog;  // Wajib ditambahkan untuk akses tabel activity_logs

class ApiController extends Controller
{
    // 1. Metode untuk menerima data dari Python Simulator
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

    // 2. Metode untuk mendistribusikan perintah kepada Worker (Polling)
    public function getPendingCommand()
    {
        // Mengambil antrean perintah pertama yang berstatus 'pending'
        $command = Command::where('status', 'pending')->first();

        if ($command) {
            // Mengubah status menjadi 'processing' untuk mencegah duplikasi eksekusi
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

    // 3. Metode untuk menerima log penyelesaian tugas dari Worker
    public function updateWorkerStatus(Request $request)
    {
        $request->validate([
            'command_id' => 'required|integer',
            'status' => 'required|in:completed,failed'
        ]);

        $command = Command::find($request->command_id);
        
        if ($command) {
            $command->update(['status' => $request->status]);

            // Pencatatan aktivitas untuk kebutuhan observability pada Dashboard
            ActivityLog::create([
                'action_type' => 'COMMAND_EXECUTED',
                'description' => "Perangkat {$command->target_device} berhasil diubah statusnya menjadi {$command->action}"
            ]);

            return response()->json(['status' => 'success']);
        }

        return response()->json(['status' => 'error', 'message' => 'Command tidak ditemukan'], 404);
    }
}