<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkerStatus extends Model
{
    protected $table = 'worker_status';

    protected $fillable = [
        'component_name', 
        'current_state', 
        'last_heartbeat'
    ];
}