<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

DB::table('devices')->insert([
    ['device_name' => 'Device 1 - Server Room', 'location' => 'Ruangan A', 'api_key' => 'key-servernih-121', 'status' => 'online'],
    ['device_name' => 'Device 2 - Dapur', 'location' => 'Dapur', 'api_key' => 'key-dapurnih-212', 'status' => 'online'],
    ['device_name' => 'Device 3 - Arsip', 'location' => 'Arsip', 'api_key' => 'key-arsipnih-311', 'status' => 'online'],
    ['device_name' => 'Device 4 - Koridor', 'location' => 'Koridor', 'api_key' => 'key-koridornih-441', 'status' => 'online']
]);

echo "✅ Devices inserted successfully!\n";
