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
        'flame_value', 
        'status_indikasi',
        'fuzzy_score',
        'fan_status',
        'fan_speed',
        'decision_profile',
    ];
}