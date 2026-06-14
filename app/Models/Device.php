<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $table = 'devices';
    protected $fillable = ['device_name', 'location', 'api_key', 'status'];

    public function actuator()
    {
        return $this->hasOne(DeviceActuator::class);
    }

    public function sensorData()
    {
        return $this->hasMany(SensorData::class);
    }

    public function commands()
    {
        return $this->hasMany(Command::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }
}