<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SystemSettings extends Model
{
    protected $fillable = [
        'gas_threshold',
        'smoke_threshold',
        'humidity_threshold',
        'temperature_threshold',
        'flame_threshold',
        'mode',
        'emergency_active',
        'last_manual_command'
    ];

    protected $casts = [
        'last_manual_command' => 'datetime',
    ];
}
