<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Devices in Database ===\n";
$devices = DB::table('devices')->get();
foreach ($devices as $d) {
    echo "ID: {$d->id} | Name: {$d->device_name} | API Key: {$d->api_key}\n";
}
