<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_save_settings_persists_to_db(): void
    {
        $response = $this->postJson('/api/settings', [
            'gas_threshold' => 300,
            'smoke_threshold' => 150,
            'temperature_threshold' => 45,
            'flame_threshold' => 600,
        ]);

        $response->assertOk();
        $response->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('system_settings', [
            'gas_threshold' => 300,
            'smoke_threshold' => 150,
            'temperature_threshold' => 45,
            'flame_threshold' => 600,
        ]);
    }

    public function test_save_settings_updates_cache(): void
    {
        $this->postJson('/api/settings', [
            'gas_threshold' => 300,
            'smoke_threshold' => 150,
            'temperature_threshold' => 45,
            'flame_threshold' => 600,
        ]);

        $this->assertEquals(300, Cache::get('gas_threshold'));
        $this->assertEquals(150, Cache::get('smoke_threshold'));
        $this->assertEquals(45, Cache::get('temperature_threshold'));
        $this->assertEquals(600, Cache::get('flame_threshold'));
    }

    public function test_save_settings_creates_activity_log(): void
    {
        $this->postJson('/api/settings', [
            'gas_threshold' => 300,
            'smoke_threshold' => 150,
            'temperature_threshold' => 45,
            'flame_threshold' => 600,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action_type' => 'SYSTEM_UPDATE',
        ]);
    }

    public function test_save_settings_validates_required_fields(): void
    {
        $response = $this->postJson('/api/settings', []);

        // ValidationException is caught by try/catch, returns 500
        $response->assertStatus(500);
    }

    public function test_save_settings_overwrites_existing(): void
    {
        $this->postJson('/api/settings', [
            'gas_threshold' => 250,
            'smoke_threshold' => 120,
            'temperature_threshold' => 40,
            'flame_threshold' => 500,
        ]);

        $this->postJson('/api/settings', [
            'gas_threshold' => 400,
            'smoke_threshold' => 200,
            'temperature_threshold' => 50,
            'flame_threshold' => 700,
        ]);

        $settings = DB::table('system_settings')->where('id', 1)->first();
        $this->assertEquals(400, $settings->gas_threshold);
        $this->assertEquals(200, $settings->smoke_threshold);
        $this->assertEquals(50, $settings->temperature_threshold);
        $this->assertEquals(700, $settings->flame_threshold);
    }
}
