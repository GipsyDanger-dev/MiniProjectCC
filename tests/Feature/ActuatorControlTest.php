<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ActuatorControlTest extends TestCase
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

    // ── Fan Control ─────────────────────────────────────────────

    public function test_activate_fan_creates_command(): void
    {
        $this->seedDevice();

        $response = $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan',
            'action' => 'START',
        ]);

        $response->assertOk();
        $response->assertJsonPath('mode', 'manual');

        $this->assertDatabaseHas('commands', [
            'device_id' => 1,
            'target_device' => 'exhaust_fan',
            'action' => 'HIGH',
            'status' => 'pending',
        ]);
    }

    public function test_stop_fan_sets_off(): void
    {
        $this->seedDevice();

        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan',
            'action' => 'STOP',
        ]);

        $this->assertDatabaseHas('commands', [
            'device_id' => 1,
            'target_device' => 'exhaust_fan',
            'action' => 'OFF',
        ]);

        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'fan_status' => 'OFF',
            'fan_speed' => 0,
        ]);
    }

    public function test_fan_low_maps_to_speed_30(): void
    {
        $this->seedDevice();

        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan',
            'action' => 'LOW',
        ]);

        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'fan_status' => 'LOW',
            'fan_speed' => 30,
        ]);
    }

    public function test_fan_medium_maps_to_speed_60(): void
    {
        $this->seedDevice();

        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan',
            'action' => 'MEDIUM',
        ]);

        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'fan_status' => 'MEDIUM',
            'fan_speed' => 60,
        ]);
    }

    public function test_fan_high_maps_to_speed_100(): void
    {
        $this->seedDevice();

        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan',
            'action' => 'HIGH',
        ]);

        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'fan_status' => 'HIGH',
            'fan_speed' => 100,
        ]);
    }

    // ── Buzzer Control ──────────────────────────────────────────

    public function test_start_buzzer(): void
    {
        $this->seedDevice();

        $response = $this->postJson('/api/actuator', [
            'target_device' => 'buzzer',
            'action' => 'START',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('commands', [
            'device_id' => 1,
            'target_device' => 'buzzer',
            'action' => 'START',
        ]);

        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'alarm_status' => 'ON',
        ]);
    }

    public function test_stop_buzzer(): void
    {
        $this->seedDevice();

        $this->postJson('/api/actuator', [
            'target_device' => 'buzzer',
            'action' => 'STOP',
        ]);

        $this->assertDatabaseHas('device_actuators', [
            'device_id' => 1,
            'alarm_status' => 'OFF',
        ]);
    }

    // ── Mode Switch ─────────────────────────────────────────────

    public function test_manual_control_sets_manual_mode(): void
    {
        $this->seedDevice();

        $response = $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan',
            'action' => 'START',
        ]);

        $response->assertOk();
        $response->assertJsonPath('mode', 'manual');

        $this->assertDatabaseHas('system_settings', [
            'id' => 1,
            'mode' => 'manual',
        ]);
    }

    // ── Validation ──────────────────────────────────────────────

    public function test_invalid_target_device_rejected(): void
    {
        $response = $this->postJson('/api/actuator', [
            'target_device' => 'invalid',
            'action' => 'START',
        ]);

        $response->assertStatus(422);
    }

    public function test_invalid_fan_action_rejected(): void
    {
        $response = $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan',
            'action' => 'INVALID',
        ]);

        $response->assertStatus(422);
    }

    public function test_invalid_buzzer_action_rejected(): void
    {
        $response = $this->postJson('/api/actuator', [
            'target_device' => 'buzzer',
            'action' => 'INVALID',
        ]);

        $response->assertStatus(422);
    }

    // ── Activity Log ────────────────────────────────────────────

    public function test_manual_command_creates_activity_log(): void
    {
        $this->seedDevice();

        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan',
            'action' => 'START',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action_type' => 'MANUAL_COMMAND',
        ]);
    }

    // ── Custom Device ID ────────────────────────────────────────

    public function test_manual_command_with_custom_device_id(): void
    {
        DB::table('devices')->insert([
            'id' => 2, 'device_name' => 'Room B', 'location' => 'Room B',
            'api_key' => 'key-2', 'status' => 'active',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->postJson('/api/actuator', [
            'target_device' => 'exhaust_fan',
            'action' => 'HIGH',
            'device_id' => 2,
        ]);

        $this->assertDatabaseHas('commands', [
            'device_id' => 2,
            'target_device' => 'exhaust_fan',
        ]);
    }
}
