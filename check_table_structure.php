<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Activity Logs Table Structure ===\n";
$columns = DB::select("DESCRIBE activity_logs");
foreach ($columns as $col) {
    echo "{$col->Field} ({$col->Type}) - " . ($col->Null === 'YES' ? 'nullable' : 'required') . "\n";
}
