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
    public function handle(Request $request, Closure $next): Response
    {

        $apiKey = $request->header('x-api-key');

        if ($apiKey !== env('IOT_API_KEY')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses Ditolak! API Key tidak valid.'
            ], 401);
        }

        return $next($request);
    }
}