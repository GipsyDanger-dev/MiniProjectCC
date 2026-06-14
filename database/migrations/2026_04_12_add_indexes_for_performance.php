<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Index untuk activity_logs ORDER BY created_at
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index('created_at');
        });

        // Composite index untuk sensor_data: device_id + created_at
        // Ini mempercepat WHERE device_id + ORDER BY created_at
        Schema::table('sensor_data', function (Blueprint $table) {
            $table->index(['device_id', 'created_at']);
        });

        // Index untuk commands perlu device_id + updated_at juga
        Schema::table('commands', function (Blueprint $table) {
            $table->index(['device_id', 'updated_at']);
        });
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
        });

        Schema::table('sensor_data', function (Blueprint $table) {
            $table->dropIndex(['device_id', 'created_at']);
        });

        Schema::table('commands', function (Blueprint $table) {
            $table->dropIndex(['device_id', 'updated_at']);
        });
    }
};
