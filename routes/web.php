<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ApiController;

Route::get('/', [DashboardController::class, 'index']);
Route::get('/dashboard', [DashboardController::class, 'index']);

// Frontend calls these without API key — must stay in web.php (no CheckApiKey middleware)
Route::post('/api/settings', [ApiController::class, 'saveSettings']);
Route::post('/api/actuator', [ApiController::class, 'controlActuator']);
Route::post('/api/mode', [ApiController::class, 'setMode']);
Route::post('/api/worker/clear', [ApiController::class, 'clearWorkerStatus']);