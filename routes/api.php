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
    
    Route::post('/ingest', [ApiController::class, 'ingestData']);

   
    Route::get('/command/get', [ApiController::class, 'getPendingCommand']);
    Route::post('/status/update', [ApiController::class, 'updateWorkerStatus']);
    
    
    Route::post('/worker/heartbeat', [ApiController::class, 'workerHeartbeat']);
});


Route::get('/dashboard/data', [ApiController::class, 'dashboard']);
Route::get('/sensor/flame', [ApiController::class, 'flameSensor']);