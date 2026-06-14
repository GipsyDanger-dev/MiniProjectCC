<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $table = 'activity_logs';

    protected $fillable = [
        'device_id',
        'action_type',
        'status',
        'description',
        'message'
    ];

    // ── Relasi ──────────────────────────────────────────────

    /** Log aktivitas ini milik satu device */
    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}