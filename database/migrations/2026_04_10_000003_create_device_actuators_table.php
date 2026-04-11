<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_actuators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices');
            $table->string('fan_status')->default('OFF'); // OFF/LOW/MEDIUM/HIGH
            $table->string('alarm_status')->default('OFF');
            $table->integer('fan_speed')->default(0); // 0-100
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_actuators');
    }
};
