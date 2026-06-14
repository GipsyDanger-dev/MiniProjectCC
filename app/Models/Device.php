<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $table = 'devices';
    protected $fillable = ['device_name', 'location', 'api_key', 'status'];

    // ── Relasi ──────────────────────────────────────────────

    /** Satu device punya satu aktuator (fan/buzzer) */
    public function actuator()
    {
        return $this->hasOne(DeviceActuator::class);
    }

    /** Satu device punya banyak data sensor (time-series) */
    public function sensorData()
    {
        return $this->hasMany(SensorData::class);
    }

    /** Satu device punya banyak perintah (commands) */
    public function commands()
    {
        return $this->hasMany(Command::class);
    }

    /** Satu device punya banyak log aktivitas */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}