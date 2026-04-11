<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;
use App\Http\Middleware\CheckApiKey;

/*
|--------------------------------------------------------------------------
| Jalur Komunikasi Mesin (Simulator & Worker) - WAJIB PAKAI API KEY
|--------------------------------------------------------------------------
*/
Route::middleware([CheckApiKey::class])->group(function () {
    // Simulator mengirim data
    Route::post('/ingest', [ApiController::class, 'ingestData']);

    // Worker mengambil perintah & lapor status
    Route::get('/command/get', [ApiController::class, 'getPendingCommand']);
    Route::post('/status/update', [ApiController::class, 'updateWorkerStatus']);
    
    // Worker mengirim detak jantung (Heartbeat)
    Route::post('/worker/heartbeat', [ApiController::class, 'workerHeartbeat']);
});

/*
|--------------------------------------------------------------------------
| Jalur Komunikasi Dashboard (Web Frontend) - TIDAK PERLU API KEY
|--------------------------------------------------------------------------
*/
// Mengambil data untuk tabel & log di web
Route::get('/dashboard/data', [ApiController::class, 'dashboard']);

// Menyimpan pengaturan batas sensor (Threshold)
Route::put('/settings', [ApiController::class, 'saveSettings']);

// Tombol manual START/STOP di web
Route::post('/actuator', [ApiController::class, 'controlActuator']);