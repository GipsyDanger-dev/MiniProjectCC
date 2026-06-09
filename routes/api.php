<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;
use App\Http\Middleware\CheckApiKey;


Route::middleware([CheckApiKey::class])->group(function () {
    // Sensor ingest & command pipeline
    Route::post('/ingest', [ApiController::class, 'ingestData']);
    Route::get('/command/get', [ApiController::class, 'getPendingCommand']);
    Route::post('/status/update', [ApiController::class, 'updateWorkerStatus']);
    Route::post('/worker/heartbeat', [ApiController::class, 'workerHeartbeat']);

    // Settings
    Route::get('/settings', [ApiController::class, 'getSettings']);
    Route::post('/settings', [ApiController::class, 'saveSettings']);

    // Dashboard
    Route::get('/dashboard/data', [ApiController::class, 'dashboard']);

    // Device CRUD
    Route::get('/devices', [ApiController::class, 'getDevices']);
    Route::post('/devices', [ApiController::class, 'createDevice']);
    Route::put('/devices/{id}', [ApiController::class, 'updateDevice']);
    Route::post('/devices/{id}/reset', [ApiController::class, 'resetDevice']);

    // Actuator & mode control
    Route::post('/actuator', [ApiController::class, 'controlActuator']);
    Route::post('/mode', [ApiController::class, 'setMode']);
    Route::post('/worker/clear', [ApiController::class, 'clearWorkerStatus']);

    // User & Auth
    Route::get('/user', [ApiController::class, 'getUser']);
    Route::post('/logout', [ApiController::class, 'logout']);
});