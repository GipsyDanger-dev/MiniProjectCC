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
        $apiKey = $request->header('x-api-key');

        // 1. Cek apakah ini Worker (Worker tetap pakai Master Key dari .env)
        if ($apiKey === env('WORKER_API_KEY', 'apa-hayo-kuncinya-99')) {
            return $next($request);
        }

        // 2. Cek apakah kunci cocok dengan salah satu Device di database
        $deviceExists = \Illuminate\Support\Facades\DB::table('devices')
                            ->where('api_key', $apiKey)
                            ->exists();

        if ($deviceExists) {
            return $next($request);
        }

        // Jika kunci tidak ada di .env maupun di database, tolak!
        return response()->json([
            'status' => 'error',
            'message' => '⛔ Akses Ditolak! API Key tidak valid untuk device manapun.'
        ], 401);
    }
}