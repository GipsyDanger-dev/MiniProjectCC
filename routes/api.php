<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Log;

Route::post('/ingest', [ApiController::class, 'ingestData']);

// ambil data terbaru
Route::get('/latest', function () {
    return SensorData::latest()->take(10)->get();
});

// kirim command dari dashboard
Route::post('/command', function (Request $request) {
    return Command::create($request->all());
});

// route untuk testing (simulasi data tanpa Python)
Route::get('/test', [ApiController::class, 'testData']);

// Dashboard API endpoints
Route::get('/dashboard', [ApiController::class, 'getDashboard']);
Route::put('/settings', [ApiController::class, 'updateSettings']);
Route::post('/actuator', [ApiController::class, 'controlActuator']);