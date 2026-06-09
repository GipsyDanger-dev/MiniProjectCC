<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\AuthController;

// Auth routes (public)
Route::post('/api/login', [AuthController::class, 'login']);
Route::post('/api/logout', [AuthController::class, 'logout']);
Route::get('/api/auth/user', [AuthController::class, 'user']);

// SPA routes (public — frontend handles auth check)
Route::get('/', [DashboardController::class, 'index']);
Route::get('/dashboard', [DashboardController::class, 'index']);

// Protected API routes (require auth session)
Route::middleware('auth')->group(function () {
    Route::post('/api/settings', [ApiController::class, 'saveSettings']);
    Route::post('/api/actuator', [ApiController::class, 'controlActuator']);
    Route::post('/api/mode', [ApiController::class, 'setMode']);
    Route::post('/api/emergency', [ApiController::class, 'emergency']);
    Route::post('/api/worker/clear', [ApiController::class, 'clearWorkerStatus']);
});