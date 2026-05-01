<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Device API Keys ===\n";
$devices = DB::table('devices')->get();
foreach ($devices as $d) {
    echo "Device {$d->id}: {$d->api_key}\n";
}
