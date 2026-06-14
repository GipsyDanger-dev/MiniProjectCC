<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DashboardTest extends TestCase
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

    private function seedSettings(): void
    {
        DB::table('system_settings')->insert([
            'id' => 1, 'gas_threshold' => 250, 'smoke_threshold' => 120,
            'temperature_threshold' => 40, 'flame_threshold' => 500,
            'mode' => 'auto', 'emergency_active' => false,
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    public function test_dashboard_returns_success(): void
    {
        $this->seedDevice();
        $this->seedSettings();

        $response = $this->getJson('/api/dashboard/data');

        $response->assertOk();
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('device_id', 1);
    }

    public function test_dashboard_returns_settings(): void
    {
        $this->seedDevice();
        $this->seedSettings();

        $response = $this->getJson('/api/dashboard/data');

        $response->assertOk();
        $response->assertJsonPath('settings.gas_threshold', 250);
        $response->assertJsonPath('settings.smoke_threshold', 120);
        $response->assertJsonPath('settings.temp_threshold', 40);
        $response->assertJsonPath('settings.flame_threshold', 500);
    }

    public function test_dashboard_returns_emergency_status(): void
    {
        $this->seedDevice();
        $this->seedSettings();

        // Insert BAHAYA sensor data
        DB::table('sensor_data')->insert([
            'device_id' => 1, 'gas_value' => 500, 'smoke_value' => 300,
            'temperature' => 60, 'humidity' => 0, 'flame_value' => 100,
            'status_indikasi' => 'BAHAYA', 'fuzzy_score' => 100,
            'fan_status' => 'HIGH', 'fan_speed' => 100,
            'decision_profile' => 'FLAME_OVERRIDE',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/dashboard/data');

        $response->assertOk();
        $response->assertJsonPath('emergency_status', 'BAHAYA');
    }

    public function test_dashboard_returns_aman_when_no_danger(): void
    {
        $this->seedDevice();
        $this->seedSettings();

        $response = $this->getJson('/api/dashboard/data');

        $response->assertOk();
        $response->assertJsonPath('emergency_status', 'AMAN');
    }

    public function test_dashboard_returns_system_mode(): void
    {
        $this->seedDevice();
        $this->seedSettings();

        $response = $this->getJson('/api/dashboard/data');

        $response->assertOk();
        $response->assertJsonPath('system_mode', 'auto');
    }

    public function test_dashboard_returns_device_actuator(): void
    {
        $this->seedDevice();
        $this->seedSettings();

        DB::table('device_actuators')->insert([
            'device_id' => 1, 'fan_status' => 'HIGH', 'alarm_status' => 'ON',
            'fan_speed' => 100, 'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/dashboard/data');

        $response->assertOk();
        $response->assertJsonPath('device_actuator.fan_status', 'HIGH');
        $response->assertJsonPath('device_actuator.alarm_status', 'ON');
        $response->assertJsonPath('device_actuator.fan_speed', 100);
    }

    public function test_dashboard_returns_sensor_data_list(): void
    {
        $this->seedDevice();
        $this->seedSettings();

        DB::table('sensor_data')->insert([
            'device_id' => 1, 'gas_value' => 100, 'smoke_value' => 50,
            'temperature' => 25, 'humidity' => 60, 'flame_value' => 800,
            'status_indikasi' => 'AMAN', 'fuzzy_score' => 0,
            'fan_status' => 'OFF', 'fan_speed' => 0,
            'decision_profile' => 'SAFE',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/dashboard/data');

        $response->assertOk();
        $response->assertJsonCount(1, 'sensor_data');
    }

    public function test_dashboard_custom_device_id(): void
    {
        DB::table('devices')->insert([
            'id' => 2, 'device_name' => 'Room B', 'location' => 'Room B',
            'api_key' => 'key-2', 'status' => 'active',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->seedSettings();

        $response = $this->getJson('/api/dashboard/data?device_id=2');

        $response->assertOk();
        $response->assertJsonPath('device_id', '2');
    }
}
