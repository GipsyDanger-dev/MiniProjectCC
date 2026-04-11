<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ApiController;

Route::get('/', [DashboardController::class, 'index']);
Route::get('/dashboard', [DashboardController::class, 'index']);

// Menyimpan pengaturan batas sensor (Threshold)
Route::post('/api/settings', [ApiController::class, 'saveSettings']);

// Tombol manual START/STOP di web
Route::post('/api/actuator', [ApiController::class, 'controlActuator']);

// Clear worker status
Route::post('/api/worker/clear', [ApiController::class, 'clearWorkerStatus']);