<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SensorData extends Model
{
    use HasFactory;

    protected $table = 'sensor_data';

    protected $fillable = [
        'device_id',
        'gas_value',
        'smoke_value',
        'temperature',
        'humidity',
        'flame_value',
        'status_indikasi',
        'fuzzy_score',
        'fan_status',
        'fan_speed',
        'decision_profile',
    ];

    protected $casts = [
        'gas_value' => 'float',
        'smoke_value' => 'float',
        'temperature' => 'float',
        'humidity' => 'float',
        'flame_value' => 'float',
        'fuzzy_score' => 'float',
        'fan_speed' => 'integer',
    ];

    // ── Relasi ──────────────────────────────────────────────

    /** Data sensor ini milik satu device */
    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}