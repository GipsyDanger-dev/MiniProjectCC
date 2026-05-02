<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class FuzzySugenoIngestTest extends TestCase
{
    use RefreshDatabase;

    public function test_ingest_data_generates_high_fan_command_from_fuzzy_output(): void
    {
        DB::table('devices')->insert([
            'id' => 1,
            'device_name' => 'Main Hall',
            'location' => 'Main Hall',
            'api_key' => 'key-servernih-121',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Cache::put('gas_threshold', 250);
        Cache::put('smoke_threshold', 120);
        Cache::put('temperature_threshold', 40);
        Cache::put('flame_threshold', 500);

        $response = $this->withHeader('x-api-key', 'key-servernih-121')->postJson('/api/ingest', [
            'device_id' => 1,
            'gas_value' => 540,
            'smoke_value' => 320,
            'temperature' => 62,
            'flame_value' => 100,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('decision.fan_status', 'HIGH');
        $response->assertJsonPath('decision.buzzer_action', 'START');

        $this->assertDatabaseHas('sensor_data', [
            'device_id' => 1,
            'status_indikasi' => 'BAHAYA',
            'fuzzy_score' => 100,
            'fan_status' => 'HIGH',
            'fan_speed' => 100,
            'decision_profile' => 'FLAME_OVERRIDE',
        ]);

        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'fan_status' => 'HIGH',
            'alarm_status' => 'ON',
            'fan_speed' => 100,
        ]);

        $this->assertDatabaseHas('commands', [
            'device_id' => 1,
            'target_device' => 'exhaust_fan',
            'action' => 'HIGH',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('commands', [
            'device_id' => 1,
            'target_device' => 'buzzer',
            'action' => 'START',
            'status' => 'pending',
        ]);
    }
}