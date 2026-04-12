<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;
use App\Http\Middleware\CheckApiKey;


Route::middleware([CheckApiKey::class])->group(function () {
    Route::post('/ingest', [ApiController::class, 'ingestData']);
    Route::get('/command/get', [ApiController::class, 'getPendingCommand']);
    Route::post('/status/update', [ApiController::class, 'updateWorkerStatus']);
    Route::post('/worker/heartbeat', [ApiController::class, 'workerHeartbeat']);
});


Route::get('/dashboard/data', [ApiController::class, 'dashboard']);

Route::post('/settings', [ApiController::class, 'saveSettings']);

Route::post('/actuator', [ApiController::class, 'controlActuator']);