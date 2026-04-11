<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->float('gas_threshold')->default(300);
            $table->float('smoke_threshold')->default(200);
            $table->float('temperature_threshold')->default(45);
            $table->string('mode')->default('auto'); // auto/manual
            $table->boolean('emergency_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
