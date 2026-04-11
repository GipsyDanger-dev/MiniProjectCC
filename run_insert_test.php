<?php
require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

// Clear old test data
DB::table('activity_logs')->where('description', 'like', '%Device 2:%')->orWhere('description', 'like', '%Device 3:%')->delete();

// Insert activity logs with new message format
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

echo "✅ Test data updated successfully!\n";
echo "Check logs with: php check_logs.php\n";
