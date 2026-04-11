<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SystemSettings extends Model
{
    protected $fillable = [
        'gas_threshold',
        'smoke_threshold', 
        'temperature_threshold',
        'mode',
        'emergency_active'
    ];
}
