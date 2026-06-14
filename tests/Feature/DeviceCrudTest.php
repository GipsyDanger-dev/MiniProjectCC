<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DeviceCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_devices_returns_list(): void
    {
        DB::table('devices')->insert([
            'id' => 1, 'device_name' => 'Main Hall', 'location' => 'Main Hall',
            'api_key' => 'key-1', 'status' => 'active',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/devices');

        $response->assertOk();
        $response->assertJsonCount(1, 'devices');
    }

    public function test_create_device(): void
    {
        $response = $this->postJson('/api/devices', [
            'device_name' => 'New Sensor',
            'location' => 'Room C',
            'api_key' => 'new-key-456',
        ]);

        $response->assertOk();
        $response->assertJsonPath('device.device_name', 'New Sensor');

        $this->assertDatabaseHas('devices', [
            'device_name' => 'New Sensor',
            'location' => 'Room C',
            'api_key' => 'new-key-456',
        ]);
    }

    public function test_create_device_validates_required(): void
    {
        $response = $this->postJson('/api/devices', []);

        $response->assertStatus(422);
    }

    public function test_update_device(): void
    {
        DB::table('devices')->insert([
            'id' => 1, 'device_name' => 'Old Name', 'location' => 'Old Location',
            'api_key' => 'key-1', 'status' => 'active',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->putJson('/api/devices/1', [
            'device_name' => 'New Name',
            'location' => 'New Location',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('devices', [
            'id' => 1, 'device_name' => 'New Name',
        ]);
    }

    public function test_update_nonexistent_device_returns_404(): void
    {
        $response = $this->putJson('/api/devices/999', [
            'device_name' => 'Ghost',
        ]);

        $response->assertStatus(404);
    }

    public function test_reset_device_clears_data(): void
    {
        DB::table('devices')->insert([
            'id' => 1, 'device_name' => 'Main Hall', 'location' => 'Main Hall',
            'api_key' => 'key-1', 'status' => 'active',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('sensor_data')->insert([
            'device_id' => 1, 'gas_value' => 100, 'smoke_value' => 50,
            'temperature' => 25, 'humidity' => 0, 'flame_value' => 800,
            'status_indikasi' => 'AMAN', 'fuzzy_score' => 0,
            'fan_status' => 'OFF', 'fan_speed' => 0, 'decision_profile' => 'SAFE',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('commands')->insert([
            'device_id' => 1, 'target_device' => 'exhaust_fan',
            'action' => 'HIGH', 'status' => 'pending',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('device_actuators')->insert([
            'device_id' => 1, 'fan_status' => 'HIGH', 'alarm_status' => 'ON',
            'fan_speed' => 100, 'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->postJson('/api/devices/1/reset');

        $response->assertOk();

        $this->assertDatabaseHas('devices', ['id' => 1, 'status' => 'offline']);
        $this->assertDatabaseMissing('sensor_data', ['device_id' => 1]);
        $this->assertDatabaseMissing('commands', ['device_id' => 1]);
        $this->assertDatabaseMissing('device_actuators', ['device_id' => 1]);
    }

    public function test_reset_nonexistent_device_returns_404(): void
    {
        $response = $this->postJson('/api/devices/999/reset');

        $response->assertStatus(404);
    }
}
