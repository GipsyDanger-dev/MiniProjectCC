<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ManualOverrideTest extends TestCase
{
    use RefreshDatabase;

    private function seedDevice(): void
    {
        DB::table('devices')->insert([
            'id' => 1, 'device_name' => 'Main Hall', 'location' => 'Main Hall',
            'api_key' => 'test-key-123', 'status' => 'active',
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    private function seedSettings(string $mode = 'auto'): void
    {
        DB::table('system_settings')->insert([
            'id' => 1, 'gas_threshold' => 250, 'smoke_threshold' => 120,
            'temperature_threshold' => 40, 'flame_threshold' => 500,
            'mode' => $mode, 'emergency_active' => false,
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    public function test_manual_mode_prevents_fuzzy_override(): void
    {
        $this->seedDevice();
        $this->seedSettings('manual');

        // Set manual fan ON
        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan', 'action' => 'HIGH',
        ]);

        // Ingest data that would normally trigger fuzzy logic
        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 100,
                'smoke_value' => 50,
                'temperature' => 25,
                'flame_value' => 800,
            ]);

        // Actuator should still be HIGH from manual, not overridden by fuzzy
        $actuator = DB::table('device_actuators')->where('device_id', 1)->first();
        $this->assertEquals('HIGH', $actuator->fan_status);
    }

    public function test_manual_stop_fan_not_overridden_by_fuzzy(): void
    {
        $this->seedDevice();
        $this->seedSettings('manual');

        // Stop fan manually
        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan', 'action' => 'STOP',
        ]);

        // Ingest moderate danger data
        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 300,
                'smoke_value' => 200,
                'temperature' => 35,
                'flame_value' => 800,
            ]);

        // Fan should still be OFF from manual stop
        $actuator = DB::table('device_actuators')->where('device_id', 1)->first();
        $this->assertEquals('OFF', $actuator->fan_status);
    }

    public function test_switching_to_auto_resumes_fuzzy(): void
    {
        $this->seedDevice();
        $this->seedSettings('manual');

        // Stop fan manually
        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan', 'action' => 'STOP',
        ]);

        // Switch to auto
        $this->postJson('/api/mode', ['mode' => 'auto']);

        // Now ingest danger data - fuzzy should take over
        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 540,
                'smoke_value' => 320,
                'temperature' => 62,
                'flame_value' => 100,
            ]);

        // Fan should now be HIGH from fuzzy logic
        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'fan_status' => 'HIGH',
        ]);
    }
}
