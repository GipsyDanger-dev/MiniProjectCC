<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

DB::table('devices')->updateOrInsert(
    ['id' => 1],
    ['device_name' => 'Warehouse Gateway', 'location' => 'Warehouse', 'api_key' => 'key-warehouse-001', 'status' => 'online']
);
DB::table('devices')->updateOrInsert(
    ['id' => 2],
    ['device_name' => 'Ruang Server Gateway', 'location' => 'Ruang Server', 'api_key' => 'key-server-002', 'status' => 'online']
);
DB::table('devices')->updateOrInsert(
    ['id' => 3],
    ['device_name' => 'Ruang Genset Gateway', 'location' => 'Ruang Genset', 'api_key' => 'key-genset-003', 'status' => 'online']
);
DB::table('devices')->updateOrInsert(
    ['id' => 4],
    ['device_name' => 'Workshop Gateway', 'location' => 'Workshop', 'api_key' => 'key-workshop-004', 'status' => 'online']
);

echo "✅ Devices inserted successfully!\n";
