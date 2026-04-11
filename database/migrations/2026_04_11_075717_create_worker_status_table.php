<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
    {
        Schema::create('worker_status', function (Blueprint $table) {
            $table->id();
            $table->string('component_name')->unique(); // Nama worker (contoh: Main Python Worker)
            $table->string('current_state');            // Status saat ini (Active / Executing)
            $table->timestamp('last_heartbeat')->nullable(); // Waktu detak jantung terakhir
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('worker_status');
    }
};
