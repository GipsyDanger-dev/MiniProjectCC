<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ApiController;

Route::get('/', [DashboardController::class, 'index']);
Route::get('/dashboard', [DashboardController::class, 'index']);

Route::post('/api/settings', [ApiController::class, 'saveSettings']);

Route::post('/api/actuator', [ApiController::class, 'controlActuator']);

Route::post('/api/worker/clear', [ApiController::class, 'clearWorkerStatus']);