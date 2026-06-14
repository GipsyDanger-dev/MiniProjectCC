<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class IngestDataTest extends TestCase
{
    use RefreshDatabase;

    private function seedDevice(): void
    {
        DB::table('devices')->insert([
            'id' => 1,
            'device_name' => 'Main Hall',
            'location' => 'Main Hall',
            'api_key' => 'test-key-123',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function seedThresholds(): void
    {
        DB::table('system_settings')->insert([
            'id' => 1,
            'gas_threshold' => 250,
            'smoke_threshold' => 120,
            'temperature_threshold' => 40,
            'flame_threshold' => 500,
            'mode' => 'auto',
            'emergency_active' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_flame_below_threshold_triggers_override(): void
    {
        $this->seedDevice();
        $this->seedThresholds();

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 100,
                'smoke_value' => 50,
                'temperature' => 25,
                'flame_value' => 100,
            ]);

        $response->assertCreated();
        $response->assertJsonPath('decision.fan_status', 'HIGH');
        $response->assertJsonPath('decision.buzzer_action', 'HIGH');
        $response->assertJsonPath('decision.profile', 'FLAME_OVERRIDE');

        $this->assertDatabaseHas('sensor_data', [
            'device_id' => 1,
            'status_indikasi' => 'BAHAYA',
            'decision_profile' => 'FLAME_OVERRIDE',
        ]);

        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'fan_status' => 'HIGH',
            'alarm_status' => 'ON',
            'fan_speed' => 100,
        ]);
    }

    public function test_low_values_produce_safe_status(): void
    {
        $this->seedDevice();
        $this->seedThresholds();

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 10,
                'smoke_value' => 5,
                'temperature' => 20,
                'flame_value' => 800,
            ]);

        $response->assertCreated();
        $response->assertJsonPath('decision.fan_status', 'OFF');
        $response->assertJsonPath('decision.profile', 'SAFE');

        $this->assertDatabaseHas('sensor_data', [
            'device_id' => 1,
            'status_indikasi' => 'AMAN',
        ]);
    }

    public function test_ingest_requires_all_fields(): void
    {
        $this->seedDevice();

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', []);

        // ValidationException caught by try/catch → 500
        $response->assertStatus(500);
    }

    public function test_ingest_rejects_invalid_device_id(): void
    {
        $this->seedDevice();

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 999,
                'gas_value' => 100,
                'smoke_value' => 50,
                'temperature' => 25,
                'flame_value' => 800,
            ]);

        // ValidationException caught by try/catch → 500
        $response->assertStatus(500);
    }

    public function test_ingest_rejects_missing_api_key(): void
    {
        $this->seedDevice();

        $response = $this->postJson('/api/ingest', [
            'device_id' => 1,
            'gas_value' => 100,
            'smoke_value' => 50,
            'temperature' => 25,
            'flame_value' => 800,
        ]);

        $response->assertStatus(401);
    }

    public function test_ingest_accepts_optional_humidity(): void
    {
        $this->seedDevice();
        $this->seedThresholds();

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 10,
                'smoke_value' => 5,
                'temperature' => 20,
                'flame_value' => 800,
                'humidity' => 65,
            ]);

        $response->assertCreated();
        $this->assertDatabaseHas('sensor_data', [
            'device_id' => 1,
            'humidity' => 65,
        ]);
    }

    public function test_ingest_creates_activity_log(): void
    {
        $this->seedDevice();
        $this->seedThresholds();

        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 100,
                'smoke_value' => 50,
                'temperature' => 25,
                'flame_value' => 800,
            ]);

        $this->assertDatabaseHas('activity_logs', [
            'action_type' => 'SENSOR_DATA',
        ]);
    }

    public function test_ingest_creates_fan_command_on_danger(): void
    {
        $this->seedDevice();
        $this->seedThresholds();

        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 540,
                'smoke_value' => 320,
                'temperature' => 62,
                'flame_value' => 100,
            ]);

        $this->assertDatabaseHas('commands', [
            'device_id' => 1,
            'target_device' => 'exhaust_fan',
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('commands', [
            'device_id' => 1,
            'target_device' => 'buzzer',
            'action' => 'HIGH',
            'status' => 'pending',
        ]);
    }

    public function test_ingest_no_fan_command_when_safe(): void
    {
        $this->seedDevice();
        $this->seedThresholds();

        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/ingest', [
                'device_id' => 1,
                'gas_value' => 10,
                'smoke_value' => 5,
                'temperature' => 20,
                'flame_value' => 800,
            ]);

        $this->assertDatabaseMissing('commands', [
            'device_id' => 1,
            'target_device' => 'exhaust_fan',
        ]);
    }
}
