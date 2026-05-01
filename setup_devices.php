<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Setting up IoT Devices ===\n\n";

$devices = [
    [
        'id' => 1,
        'device_name' => 'Main Hall',
        'location' => 'Main Hall',
        'api_key' => 'key-servernih-121',
        'status' => 'active'
    ],
    [
        'id' => 2,
        'device_name' => 'Kitchen',
        'location' => 'Kitchen',
        'api_key' => 'key-dapurnih-212',
        'status' => 'active'
    ],
    [
        'id' => 3,
        'device_name' => 'Warehouse',
        'location' => 'Warehouse',
        'api_key' => 'key-arsipnih-311',
        'status' => 'active'
    ],
    [
        'id' => 4,
        'device_name' => 'Server Room',
        'location' => 'Server Room',
        'api_key' => 'key-koridornih-441',
        'status' => 'active'
    ]
];

// Delete existing devices
DB::table('devices')->truncate();
echo "✓ Cleared existing devices\n";

// Insert new devices
foreach ($devices as $device) {
    DB::table('devices')->insert([
        'id' => $device['id'],
        'device_name' => $device['device_name'],
        'location' => $device['location'],
        'api_key' => $device['api_key'],
        'status' => $device['status'],
        'created_at' => now(),
        'updated_at' => now()
    ]);
    echo "✓ Device {$device['id']}: {$device['device_name']} (Key: {$device['api_key']})\n";
}

echo "\n=== Device Setup Complete ===\n";
echo "Total devices: " . count($devices) . "\n\n";

// Verify
echo "=== Verification ===\n";
$all = DB::table('devices')->get();
foreach ($all as $d) {
    echo "Device {$d->id}: {$d->device_name} | Key: {$d->api_key}\n";
}
