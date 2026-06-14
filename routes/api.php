<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;
use App\Http\Middleware\CheckApiKey;

// Machine-to-machine routes (require API key)
Route::middleware([CheckApiKey::class])->group(function () {
    Route::post('/ingest', [ApiController::class, 'ingestData']);
    Route::get('/command/get', [ApiController::class, 'getPendingCommand']);
    Route::post('/status/update', [ApiController::class, 'updateWorkerStatus']);
    Route::post('/worker/heartbeat', [ApiController::class, 'workerHeartbeat']);
});

// Public dashboard data
Route::get('/dashboard/data', [ApiController::class, 'dashboard']);
Route::get('/sensor/flame', [ApiController::class, 'flameSensor']);

// Mode & emergency
Route::post('/mode', [ApiController::class, 'setMode']);
Route::post('/emergency', [ApiController::class, 'emergency']);

// Device management
Route::get('/devices', [ApiController::class, 'devices']);
Route::post('/devices', [ApiController::class, 'createDevice']);
Route::put('/devices/{device}', [ApiController::class, 'updateDevice']);
Route::post('/devices/{device}/reset', [ApiController::class, 'resetDevice']);
