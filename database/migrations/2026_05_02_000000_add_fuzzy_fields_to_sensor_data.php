<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sensor_data', function (Blueprint $table) {
            $table->float('fuzzy_score')->nullable()->after('flame_value');
            $table->string('fan_status')->nullable()->after('status_indikasi');
            $table->integer('fan_speed')->nullable()->after('fan_status');
            $table->string('decision_profile')->nullable()->after('fan_speed');
        });
    }

    public function down(): void
    {
        Schema::table('sensor_data', function (Blueprint $table) {
            $table->dropColumn(['fuzzy_score', 'fan_status', 'fan_speed', 'decision_profile']);
        });
    }
};