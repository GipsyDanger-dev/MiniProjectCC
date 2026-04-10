<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SensorData;
use App\Models\Device;
use App\Models\Command;      // Wajib untuk akses tabel commands
use App\Models\ActivityLog;  // Wajib untuk akses tabel activity_logs

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
        
        // --- LOGIKA OTOMATISASI (HYBRID CONTROL DENGAN ANTI-SPAM) ---
        if ($request->gas_value > 300 || $request->smoke_value > 200 || $request->temperature > 45) {
            $status_indikasi = 'BAHAYA';

            // Cek apakah belum ada antrean untuk exhaust_fan supaya database tidak jebol (spam)
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

            // Cek apakah belum ada antrean untuk buzzer
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
        // --- BATAS LOGIKA OTOMATISASI ---

        // Simpan data sensor ke database
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

            ActivityLog::create([
                'action_type' => 'COMMAND_EXECUTED',
                'description' => "Perangkat {$command->target_device} berhasil diubah statusnya menjadi {$command->action}"
            ]);

            return response()->json(['status' => 'success']);
        }

        return response()->json(['status' => 'error', 'message' => 'Command tidak ditemukan'], 404);
    }
}