<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;

Route::get('/', function () {
    return view('login');
});

Route::get('/login', function () {
    return view('login');
});

Route::get('/dashboard', function () {
    $userId = session()->get('user_id');
    if (!$userId) {
        return redirect('/login');
    }
    return view('app');
});

// Menyimpan pengaturan batas sensor (Threshold)
Route::post('/api/settings', [ApiController::class, 'saveSettings']);

// Tombol manual START/STOP di web
Route::post('/api/actuator', [ApiController::class, 'controlActuator']);

// Clear worker status
Route::post('/api/worker/clear', [ApiController::class, 'clearWorkerStatus']);

// Auth routes
Route::post('/api/login', [ApiController::class, 'login']);
Route::post('/api/logout', [ApiController::class, 'logout']);
Route::get('/api/user', [ApiController::class, 'getUser']);
