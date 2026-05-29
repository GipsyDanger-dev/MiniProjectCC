<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class WorkerStatusTest extends TestCase
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

    public function test_worker_heartbeat_creates_status(): void
    {
        $this->seedDevice();

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/worker/heartbeat', [
                'component_name' => 'sensor_reader',
                'current_state' => 'running',
            ]);

        $response->assertOk();
        $response->assertJsonPath('status', 'alive');

        $this->assertDatabaseHas('worker_status', [
            'component_name' => 'sensor_reader',
            'current_state' => 'running',
        ]);
    }

    public function test_worker_heartbeat_updates_existing(): void
    {
        $this->seedDevice();

        DB::table('worker_status')->insert([
            'component_name' => 'sensor_reader',
            'current_state' => 'idle',
            'last_heartbeat' => now()->subMinutes(5),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/worker/heartbeat', [
                'component_name' => 'sensor_reader',
                'current_state' => 'running',
            ]);

        $this->assertDatabaseHas('worker_status', [
            'component_name' => 'sensor_reader',
            'current_state' => 'running',
        ]);
    }

    public function test_update_command_status(): void
    {
        $this->seedDevice();

        DB::table('commands')->insert([
            'id' => 50, 'device_id' => 1, 'target_device' => 'exhaust_fan',
            'action' => 'HIGH', 'status' => 'processing',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/status/update', [
                'command_id' => 50,
                'status' => 'completed',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('commands', [
            'id' => 50, 'status' => 'completed',
        ]);
    }

    public function test_update_command_status_failed(): void
    {
        $this->seedDevice();

        DB::table('commands')->insert([
            'id' => 51, 'device_id' => 1, 'target_device' => 'buzzer',
            'action' => 'START', 'status' => 'processing',
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/status/update', [
                'command_id' => 51,
                'status' => 'failed',
            ]);

        $this->assertDatabaseHas('commands', [
            'id' => 51, 'status' => 'failed',
        ]);
    }

    public function test_update_nonexistent_command_returns_404(): void
    {
        $this->seedDevice();

        $response = $this->withHeader('x-api-key', 'test-key-123')
            ->postJson('/api/status/update', [
                'command_id' => 999,
                'status' => 'completed',
            ]);

        $response->assertStatus(404);
    }

    public function test_clear_worker_status(): void
    {
        DB::table('worker_status')->insert([
            'component_name' => 'sensor_reader', 'current_state' => 'running',
            'last_heartbeat' => now(), 'created_at' => now(), 'updated_at' => now(),
        ]);

        $response = $this->postJson('/api/worker/clear');

        $response->assertOk();
        $this->assertDatabaseCount('worker_status', 0);
    }
}
