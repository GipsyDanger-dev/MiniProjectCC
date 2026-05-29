<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CommandPollingTest extends TestCase
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

    public function test_get_pending_command_returns_oldest(): void
    {
        $this->seedDevice();

        DB::table('commands')->insert([
            'device_id' => 1, 'target_device' => 'exhaust_fan',
            'action' => 'HIGH', 'status' => 'pending',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->getJson('/api/command/get?device_id=1');

        $response->assertOk();
        $response->assertJsonPath('status', 'success');
        $response->assertJsonPath('data.target_device', 'exhaust_fan');
        $response->assertJsonPath('data.status', 'processing');
    }

    public function test_get_pending_command_returns_empty_when_none(): void
    {
        $this->seedDevice();

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->getJson('/api/command/get?device_id=1');

        $response->assertOk();
        $response->assertJsonPath('status', 'empty');
    }

    public function test_pending_command_becomes_processing(): void
    {
        $this->seedDevice();

        DB::table('commands')->insert([
            'id' => 100, 'device_id' => 1, 'target_device' => 'buzzer',
            'action' => 'START', 'status' => 'pending',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->withHeader('x-api-key', 'test-key-123')
            ->getJson('/api/command/get?device_id=1');

        $this->assertDatabaseHas('commands', [
            'id' => 100, 'status' => 'processing',
        ]);
    }

    public function test_only_pending_commands_polled(): void
    {
        $this->seedDevice();

        DB::table('commands')->insert([
            'device_id' => 1, 'target_device' => 'exhaust_fan',
            'action' => 'HIGH', 'status' => 'completed',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->getJson('/api/command/get?device_id=1');

        $response->assertJsonPath('status', 'empty');
    }

    public function test_command_polling_requires_api_key(): void
    {
        $response = $this->getJson('/api/command/get?device_id=1');

        $response->assertStatus(401);
    }
}
