<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $table = 'devices';
    protected $fillable = ['device_name', 'location', 'status'];

    public function actuator()
    {
        return $this->hasOne(DeviceActuator::class);
    }
}