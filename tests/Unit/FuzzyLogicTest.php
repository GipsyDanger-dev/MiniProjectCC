<?php

namespace Tests\Unit;

use App\Http\Controllers\ApiController;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

class FuzzyLogicTest extends TestCase
{
    private ApiController $controller;
    private ReflectionMethod $fuzzyMethod;
    private ReflectionMethod $membershipMethod;

    protected function setUp(): void
    {
        parent::setUp();
        $this->controller = new ApiController();
        $this->fuzzyMethod = new ReflectionMethod(ApiController::class, 'buildFuzzyDecision');
        $this->membershipMethod = new ReflectionMethod(ApiController::class, 'triangularMembership');
    }

    private function fuzzy(float $gas, float $smoke, float $temp, float $flame, float $flameTh = 500, float $gasTh = 250, float $smokeTh = 120, float $tempTh = 40): array
    {
        return $this->fuzzyMethod->invoke($this->controller, $gas, $smoke, $temp, $flame, $flameTh, $gasTh, $smokeTh, $tempTh);
    }

    private function membership(float $value, float $left, float $peak, float $right): float
    {
        return $this->membershipMethod->invoke($this->controller, $value, $left, $peak, $right);
    }

    // ── Triangular Membership ───────────────────────────────────

    public function test_membership_at_peak_returns_1(): void
    {
        $this->assertEquals(1.0, $this->membership(50, 0, 50, 100));
    }

    public function test_membership_at_left_boundary_returns_0(): void
    {
        $this->assertEquals(0.0, $this->membership(0, 0, 50, 100));
    }

    public function test_membership_at_right_boundary_returns_0(): void
    {
        $this->assertEquals(0.0, $this->membership(100, 0, 50, 100));
    }

    public function test_membership_below_range_returns_0(): void
    {
        $this->assertEquals(0.0, $this->membership(-10, 0, 50, 100));
    }

    public function test_membership_above_range_returns_0(): void
    {
        $this->assertEquals(0.0, $this->membership(150, 0, 50, 100));
    }

    public function test_membership_midpoint_returns_0_5(): void
    {
        $this->assertEqualsWithDelta(0.5, $this->membership(25, 0, 50, 100), 0.01);
        $this->assertEqualsWithDelta(0.5, $this->membership(75, 0, 50, 100), 0.01);
    }

    // ── Flame Override ──────────────────────────────────────────

    public function test_flame_below_threshold_returns_override(): void
    {
        $result = $this->fuzzy(100, 50, 25, 100);

        $this->assertEquals('FLAME_OVERRIDE', $result['profile']);
        $this->assertEquals('HIGH', $result['fan_status']);
        $this->assertEquals(100, $result['fan_speed']);
        $this->assertEquals('START', $result['buzzer_action']);
        $this->assertEquals(100.0, $result['score']);
    }

    public function test_flame_above_threshold_no_override(): void
    {
        $result = $this->fuzzy(100, 50, 25, 800);

        $this->assertNotEquals('FLAME_OVERRIDE', $result['profile']);
    }

    public function test_flame_at_threshold_no_override(): void
    {
        $result = $this->fuzzy(100, 50, 25, 500);

        $this->assertNotEquals('FLAME_OVERRIDE', $result['profile']);
    }

    public function test_custom_flame_threshold(): void
    {
        // flame_value=200, threshold=300 → 200 < 300 → override
        $result = $this->fuzzy(100, 50, 25, 200, 300);

        $this->assertEquals('FLAME_OVERRIDE', $result['profile']);
    }

    // ── Safe Zone ───────────────────────────────────────────────

    public function test_all_low_values_returns_safe(): void
    {
        $result = $this->fuzzy(0, 0, 15, 800);

        $this->assertEquals('SAFE', $result['profile']);
        $this->assertEquals('OFF', $result['fan_status']);
        $this->assertEquals(0, $result['fan_speed']);
        $this->assertEquals('STOP', $result['buzzer_action']);
    }

    // ── HIGH Zone ───────────────────────────────────────────────

    public function test_high_gas_returns_high(): void
    {
        $result = $this->fuzzy(600, 50, 25, 800);

        $this->assertEquals('HIGH', $result['fan_status']);
        $this->assertEquals(100, $result['fan_speed']);
    }

    public function test_high_smoke_returns_high(): void
    {
        // smoke=300 with threshold=120 triggers smokeHigh rule
        $result = $this->fuzzy(10, 300, 25, 800);

        $this->assertEquals('HIGH', $result['fan_status']);
    }

    public function test_high_temperature_returns_high(): void
    {
        $result = $this->fuzzy(10, 5, 70, 800);

        $this->assertEquals('HIGH', $result['fan_status']);
    }

    // ── MEDIUM Zone ─────────────────────────────────────────────

    public function test_moderate_gas_smoke_returns_medium(): void
    {
        // gas=350 (gasMedium) + temp=60 (tempWarm) → score ≈ 59 → MEDIUM
        $result = $this->fuzzy(350, 50, 60, 800);

        $this->assertEquals('MEDIUM', $result['fan_status']);
        $this->assertEquals(60, $result['fan_speed']);
        $this->assertEquals('START', $result['buzzer_action']);
    }

    // ── LOW Zone ────────────────────────────────────────────────

    public function test_slightly_elevated_returns_low(): void
    {
        $result = $this->fuzzy(200, 100, 25, 800);

        $this->assertEquals('LOW', $result['fan_status']);
        $this->assertEquals(30, $result['fan_speed']);
        $this->assertEquals('STOP', $result['buzzer_action']);
    }

    // ── Score Range ─────────────────────────────────────────────

    public function test_score_between_0_and_100(): void
    {
        $scenarios = [
            [0, 0, 15, 800],      // safe
            [100, 50, 25, 800],    // low
            [300, 180, 25, 800],   // medium
            [600, 400, 70, 800],   // high
            [100, 50, 25, 100],    // flame override
        ];

        foreach ($scenarios as [$gas, $smoke, $temp, $flame]) {
            $result = $this->fuzzy($gas, $smoke, $temp, $flame);
            $this->assertGreaterThanOrEqual(0, $result['score'], "Score below 0 for gas=$gas smoke=$smoke temp=$temp");
            $this->assertLessThanOrEqual(100, $result['score'], "Score above 100 for gas=$gas smoke=$smoke temp=$temp");
        }
    }

    // ── Decision Structure ──────────────────────────────────────

    public function test_decision_has_all_required_fields(): void
    {
        $result = $this->fuzzy(100, 50, 25, 800);

        $this->assertArrayHasKey('score', $result);
        $this->assertArrayHasKey('fan_status', $result);
        $this->assertArrayHasKey('fan_speed', $result);
        $this->assertArrayHasKey('buzzer_action', $result);
        $this->assertArrayHasKey('profile', $result);
        $this->assertArrayHasKey('rules', $result);
        $this->assertArrayHasKey('reason', $result);
    }

    // ── Buzzer Behavior ─────────────────────────────────────────

    public function test_buzzer_starts_on_high_danger(): void
    {
        $result = $this->fuzzy(500, 300, 50, 800);
        $this->assertEquals('START', $result['buzzer_action']);
    }

    public function test_buzzer_stops_when_safe(): void
    {
        $result = $this->fuzzy(0, 0, 15, 800);
        $this->assertEquals('STOP', $result['buzzer_action']);
    }

    // ── Custom Thresholds ───────────────────────────────────────

    public function test_custom_gas_threshold_changes_sensitivity(): void
    {
        // With threshold 100, gas=200 should be HIGH
        $result = $this->fuzzy(200, 0, 20, 800, 500, 100, 120, 40);
        $this->assertNotEquals('SAFE', $result['profile']);
    }
}
