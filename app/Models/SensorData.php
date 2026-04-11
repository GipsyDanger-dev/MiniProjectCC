<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class SensorData extends Model
{
    protected $table = 'sensor_data'; 
    protected $fillable = [
        'device_id', 'gas_value', 'smoke_value', 'temperature', 'flame_value', 'status_indikasi'
    ];
}