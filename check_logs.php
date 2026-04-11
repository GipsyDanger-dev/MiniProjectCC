<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "╔════════════════════════════════════════════════════════════════════╗\n";
echo "║              ACTIVITY LOG - SENSOR MONITORING REPORT               ║\n";
echo "╚════════════════════════════════════════════════════════════════════╝\n\n";

$logs = DB::table('activity_logs')->orderBy('created_at', 'desc')->limit(20)->get();
echo "Total Logs: " . count($logs) . "\n";
echo "───────────────────────────────────────────────────────────────────\n\n";

foreach ($logs as $log) {
    $statusEmoji = $log->status === 'BAHAYA' ? '🔴' : '🟢';
    
    echo "📋 LOG ID: {$log->id}\n";
    echo "   Status: {$statusEmoji} {$log->status}\n";
    echo "   Type: {$log->action_type}\n";
    echo "   ────────────────────────────────────────────────────────────\n";
    echo "   📝 Message: {$log->message}\n";
    echo "   📊 Sensor Data: {$log->description}\n";
    echo "   🕐 Time: {$log->created_at}\n";
    echo "───────────────────────────────────────────────────────────────\n\n";
}
