<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckApiKey
{
 
public function handle(Request $request, Closure $next)
    {
        $apiKey = $request->header('x-api-key');

       
        if ($apiKey === env('WORKER_API_KEY', 'apa-hayo-kuncinya-99')) {
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