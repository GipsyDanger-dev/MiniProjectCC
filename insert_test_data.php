<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Inserting Test Data ===\n";

// Insert test sensor data - BAHAYA
$sensorBahaya = DB::table('sensor_data')->insertGetId([
    'device_id' => 2,
    'gas_value' => 280,
    'smoke_value' => 150,
    'temperature' => 46,
    'flame_value' => 300,
    'status_indikasi' => 'BAHAYA',
    'created_at' => now(),
    'updated_at' => now()
]);

// Insert test sensor data - AMAN
$sensorAman = DB::table('sensor_data')->insertGetId([
    'device_id' => 3,
    'gas_value' => 100,
    'smoke_value' => 50,
    'temperature' => 30,
    'flame_value' => 900,
    'status_indikasi' => 'AMAN',
    'created_at' => now(),
    'updated_at' => now()
]);

// Insert activity logs
DB::table('activity_logs')->insert([
    [
        'action_type' => 'SENSOR_DATA',
        'status' => 'BAHAYA',
        'description' => 'Device 2: G=280, S=150, T=46, F=300',
        'message' => '[🔴 BAHAYA] Device 2 | Sensors: Gas=280ppm (threshold=250) | Smoke=150ppm (threshold=120) | Temp=46°C (threshold=40)',
        'created_at' => now(),
        'updated_at' => now()
    ],
    [
        'action_type' => 'SENSOR_DATA',
        'status' => 'AMAN',
        'description' => 'Device 3: G=100, S=50, T=30, F=900',
        'message' => '[🟢 AMAN] Device 3 | All sensors within safe range',
        'created_at' => now(),
        'updated_at' => now()
    ]
]);

echo "✅ Test data inserted successfully!\n";
echo "   - Sensor BAHAYA record ID: $sensorBahaya\n";
echo "   - Sensor AMAN record ID: $sensorAman\n";
echo "\nNow check dashboard at http://127.0.0.1:8000/api/dashboard/data\n";
