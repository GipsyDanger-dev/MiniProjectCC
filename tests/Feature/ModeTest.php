<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ModeTest extends TestCase
{
    use RefreshDatabase;

    public function test_set_mode_auto(): void
    {
        $response = $this->postJson('/api/mode', ['mode' => 'auto']);

        $response->assertOk();
        $response->assertJsonPath('mode', 'auto');

        $this->assertDatabaseHas('system_settings', [
            'id' => 1, 'mode' => 'auto',
        ]);
    }

    public function test_set_mode_manual(): void
    {
        $response = $this->postJson('/api/mode', ['mode' => 'manual']);

        $response->assertOk();
        $response->assertJsonPath('mode', 'manual');

        $this->assertDatabaseHas('system_settings', [
            'id' => 1, 'mode' => 'manual',
        ]);
    }

    public function test_invalid_mode_rejected(): void
    {
        $response = $this->postJson('/api/mode', ['mode' => 'invalid']);

        $response->assertStatus(422);
    }

    public function test_mode_switch_creates_activity_log(): void
    {
        $this->postJson('/api/mode', ['mode' => 'manual']);

        $this->assertDatabaseHas('activity_logs', [
            'action_type' => 'MODE_SWITCH',
        ]);
    }
}
