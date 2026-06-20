<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class FlameEmergencyTest extends TestCase
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

    public function test_flame_auto_switches_from_manual_to_auto(): void
    {
        $this->seedDevice();
        $this->seedSettings('manual');

        // Flame detected while in manual mode
        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 100,
                'smoke_value' => 50,
                'temperature' => 25,
                'flame_value' => 100,
            ]);

        // Mode should be switched to auto
        $this->assertDatabaseHas('system_settings', [
            'id' => 1, 'mode' => 'auto',
        ]);
    }

    public function test_flame_emergency_executes_immediately_no_delay(): void
    {
        $this->seedDevice();
        $this->seedSettings('manual');

        // Flame detected
        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 100,
                'smoke_value' => 50,
                'temperature' => 25,
                'flame_value' => 100,
            ]);

        // Should return FLAME_OVERRIDE decision immediately
        $response->assertCreated();
        $response->assertJsonPath('decision.profile', 'FLAME_OVERRIDE');

        // Actuator should be updated IMMEDIATELY (same cycle)
        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'fan_status' => 'HIGH',
            'alarm_status' => 'ON',
            'fan_speed' => 100,
        ]);
    }

    public function test_flame_creates_mode_switch_log(): void
    {
        $this->seedDevice();
        $this->seedSettings('manual');

        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 100,
                'smoke_value' => 50,
                'temperature' => 25,
                'flame_value' => 100,
            ]);

        $this->assertDatabaseHas('activity_logs', [
            'action_type' => 'MODE_SWITCH',
            'status' => 'BAHAYA',
        ]);
    }

    public function test_flame_emergency_overrides_stopped_fan(): void
    {
        $this->seedDevice();
        $this->seedSettings('manual');

        // User manually stops fan
        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan', 'action' => 'STOP',
        ]);

        // Flame detected — should override the stopped fan
        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 100,
                'smoke_value' => 50,
                'temperature' => 25,
                'flame_value' => 100,
            ]);

        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'fan_status' => 'HIGH',
        ]);
    }

    public function test_no_flame_normal_data_does_not_auto_switch(): void
    {
        $this->seedDevice();
        $this->seedSettings('manual');

        // Normal data, no flame
        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 100,
                'smoke_value' => 50,
                'temperature' => 25,
                'flame_value' => 800,
            ]);

        // Mode should stay manual
        $this->assertDatabaseHas('system_settings', [
            'id' => 1, 'mode' => 'manual',
        ]);
    }
}
