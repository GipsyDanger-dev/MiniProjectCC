<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SensorData extends Model
{
    use HasFactory;

    // Tabel yang digunakan
    protected $table = 'sensor_data';

    // WAJIB DAFTARKAN SEMUA KOLOM DI SINI
    protected $fillable = [
        'device_id',
        'gas_value',
        'smoke_value',
        'temperature',
        'flame_value', // <--- INI YANG BIKIN DATA KAMU JADI 0 TADI
        'status_indikasi'
    ];
}