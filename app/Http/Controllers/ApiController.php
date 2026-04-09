<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SensorData;
use App\Models\Device;

class ApiController extends Controller
{
    public function ingestData(Request $request)
    {
        // 1. Validasi request JSON yang masuk
        $request->validate([
            'device_id' => 'required|integer',
            'gas_value' => 'required|numeric',
            'smoke_value' => 'required|numeric',
            'temperature' => 'required|numeric',
        ]);

        // 2. Logika Deteksi Dini (Threshold)
        // Sesuai projectmu: kalau ada yang di atas batas, status jadi BAHAYA
        $status_indikasi = 'AMAN';
        if ($request->gas_value > 300 || $request->smoke_value > 200 || $request->temperature > 45) {
            $status_indikasi = 'BAHAYA';
        }

        // 3. Simpan data sensor ke tabel database Ubuntu
        $sensorData = SensorData::create([
            'device_id' => $request->device_id,
            'gas_value' => $request->gas_value,
            'smoke_value' => $request->smoke_value,
            'temperature' => $request->temperature,
            'status_indikasi' => $status_indikasi
        ]);

        // 4. Balas dengan format JSON (Syarat Wajib Mini Project)
        return response()->json([
            'status' => 'success',
            'message' => 'Data sensor mendarat dengan aman!',
            'data' => $sensorData
        ], 201);
    }
}