<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckApiKey
{
    /**
     * Menangani permintaan yang masuk.
     */
public function handle(Request $request, Closure $next)
    {
        // Allow requests from frontend (same origin with session cookie)
        $hasSession = $request->hasCookie('XSRF-TOKEN') || $request->cookie('laravel_session');
        if ($hasSession) {
            return $next($request);
        }

        $apiKey = $request->header('x-api-key');

        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak! API Key tidak ditemukan.'
            ], 401);
        }

        $workerKey = config('app.worker_api_key', 'apa-hayo-kuncinya-99');
        if ($apiKey === $workerKey) {
            return $next($request);
        }

        $deviceExists = \Illuminate\Support\Facades\DB::table('devices')
                            ->where('api_key', $apiKey)
                            ->exists();

        if ($deviceExists) {
            return $next($request);
        }

        return response()->json([
            'status' => 'error',
            'message' => '⛔ Akses Ditolak! API Key tidak valid untuk device manapun.'
        ], 401);
    }
}