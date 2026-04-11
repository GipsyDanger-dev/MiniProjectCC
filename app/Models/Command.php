<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Command extends Model
{
    protected $table = 'commands';

    protected $fillable = [
        'device_id',
        'target_device', 
        'action', 
        'status'
    ];

    public function device()
    {
        return $this->belongsTo(Device::class, 'device_id');
    }
}