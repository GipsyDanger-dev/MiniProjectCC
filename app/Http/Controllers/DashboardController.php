<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // SPA handles auth check via /api/auth/user
        return view('app');
    }
}