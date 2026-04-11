<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class DeviceActuator extends Model
{
    protected $fillable = [
        'device_id',
        'fan_status',
        'alarm_status',
        'fan_speed'
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
