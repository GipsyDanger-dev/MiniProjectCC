<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SensorData;
use App\Models\Device;
use App\Models\ActivityLog;
use App\Models\SystemSettings;
use App\Models\DeviceActuator;
use App\Models\Command;

class ApiController extends Controller
{
    public function ingestData(Request $request)
    {
        // 1. VALIDASI
        $request->validate([
            'device_id' => 'required|integer',
            'gas_value' => 'required|numeric',
            'smoke_value' => 'required|numeric',
            'temperature' => 'required|numeric',
        ]);

        // 2. CEK DEVICE (biar valid)
        $device = Device::find($request->device_id);

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device tidak ditemukan'
            ], 404);
        }

        // 3. LOGIKA STATUS - Ambil dari SystemSettings yang bisa di-update
        $settings = SystemSettings::first();
        if (!$settings) {
            $settings = SystemSettings::create([
                'gas_threshold' => 300,
                'smoke_threshold' => 200,
                'temperature_threshold' => 45,
                'mode' => 'auto',
                'emergency_active' => false
            ]);
        }

        $status_indikasi = 'AMAN';

        if (
            $request->gas_value > $settings->gas_threshold ||
            $request->smoke_value > $settings->smoke_threshold ||
            $request->temperature > $settings->temperature_threshold
        ) {
            $status_indikasi = 'BAHAYA';
        }

        // 4. SIMPAN DATA SENSOR
        $sensorData = SensorData::create([
            'device_id' => $request->device_id,
            'gas_value' => $request->gas_value,
            'smoke_value' => $request->smoke_value,
            'temperature' => $request->temperature,
            'status_indikasi' => $status_indikasi
        ]);

        // 5. UPDATE STATUS DEVICE (optional tapi bagus)
        $device->status = 'online';
        $device->save();

        // 6. SIMPAN LOG AKTIVITAS
        ActivityLog::create([
            'message' => "Device {$request->device_id} | Gas: {$request->gas_value} | Smoke: {$request->smoke_value} | Temp: {$request->temperature} | Status: {$status_indikasi}"
        ]);

        // 7. RESPONSE JSON
        return response()->json([
            'status' => 'success',
            'message' => 'Data sensor masuk',
            'data' => [
                'device_id' => $sensorData->device_id,
                'gas' => $sensorData->gas_value,
                'smoke' => $sensorData->smoke_value,
                'temperature' => $sensorData->temperature,
                'status' => $sensorData->status_indikasi,
                'time' => $sensorData->created_at
            ]
        ], 201);
    }

    public function testData()
    {
        $settings = SystemSettings::first();
        if (!$settings) {
            $settings = SystemSettings::create([
                'gas_threshold' => 300,
                'smoke_threshold' => 200,
                'temperature_threshold' => 45,
                'mode' => 'auto',
                'emergency_active' => false
            ]);
        }

        $devices = [1, 2, 3];
        $results = [];

        foreach ($devices as $devId) {
            $gas = rand(50, 350);
            $smoke = rand(20, 220);
            $temp = rand(25, 50);
            
            $status = ($gas > $settings->gas_threshold || 
                      $smoke > $settings->smoke_threshold || 
                      $temp > $settings->temperature_threshold) ? 'BAHAYA' : 'AMAN';
            
            $sensorData = SensorData::create([
                'device_id' => $devId,
                'gas_value' => $gas,
                'smoke_value' => $smoke,
                'temperature' => $temp,
                'status_indikasi' => $status
            ]);

            $device = Device::find($devId);
            $device->status = 'online';
            $device->save();

            $results[] = [
                'device_id' => $sensorData->device_id,
                'status' => $sensorData->status_indikasi,
                'timestamp' => $sensorData->created_at
            ];
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Test data inserted',
            'data' => $results
        ]);
    }

    public function getDashboard()
    {
        $settings = SystemSettings::first() ?? SystemSettings::create([
            'gas_threshold' => 300,
            'smoke_threshold' => 200,
            'temperature_threshold' => 45,
            'mode' => 'auto',
            'emergency_active' => false
        ]);

        $devices = Device::with('actuator')->get();
        
        // Ambil data terbaru per device (latest 10 per device)
        $latestData = [];
        for ($devId = 1; $devId <= 3; $devId++) {
            $data = SensorData::where('device_id', $devId)
                ->latest('created_at')
                ->take(10)
                ->get();
            if ($data->count() > 0) {
                $latestData[$devId] = $data;
            }
        }
        
        $logs = ActivityLog::latest()->take(20)->get();
        $commands = Command::latest()->take(10)->get();

        return response()->json([
            'settings' => $settings,
            'devices' => $devices,
            'latest_data' => $latestData,
            'logs' => $logs,
            'commands' => $commands
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'gas_threshold' => 'numeric|min:0',
            'smoke_threshold' => 'numeric|min:0',
            'temperature_threshold' => 'numeric|min:0',
            'mode' => 'in:auto,manual',
            'emergency_active' => 'boolean'
        ]);

        $settings = SystemSettings::first();
        $settings->update($validated);

        ActivityLog::create([
            'message' => 'System settings updated'
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    public function controlActuator(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|integer|exists:devices,id',
            'action' => 'required|in:FAN_ON,FAN_OFF,FAN_LOW,FAN_MEDIUM,FAN_HIGH,ALARM_ON,ALARM_OFF,EMERGENCY,RESET'
        ]);

        $device = Device::find($validated['device_id']);
        $actuator = DeviceActuator::firstOrCreate(['device_id' => $validated['device_id']]);

        switch ($validated['action']) {
            case 'FAN_ON':
                $actuator->fan_status = 'ON';
                $actuator->fan_speed = 100;
                break;
            case 'FAN_OFF':
                $actuator->fan_status = 'OFF';
                $actuator->fan_speed = 0;
                break;
            case 'FAN_LOW':
                $actuator->fan_status = 'LOW';
                $actuator->fan_speed = 33;
                break;
            case 'FAN_MEDIUM':
                $actuator->fan_status = 'MEDIUM';
                $actuator->fan_speed = 66;
                break;
            case 'FAN_HIGH':
                $actuator->fan_status = 'HIGH';
                $actuator->fan_speed = 100;
                break;
            case 'ALARM_ON':
                $actuator->alarm_status = 'ON';
                break;
            case 'ALARM_OFF':
                $actuator->alarm_status = 'OFF';
                break;
            case 'EMERGENCY':
                $settings = SystemSettings::first();
                $settings->emergency_active = true;
                $settings->save();
                $actuator->fan_status = 'HIGH';
                $actuator->fan_speed = 100;
                $actuator->alarm_status = 'ON';
                break;
            case 'RESET':
                $actuator->fan_status = 'OFF';
                $actuator->fan_speed = 0;
                $actuator->alarm_status = 'OFF';
                $settings = SystemSettings::first();
                $settings->emergency_active = false;
                $settings->save();
                break;
        }

        $actuator->save();

        Command::create([
            'device_id' => $validated['device_id'],
            'command' => $validated['action']
        ]);

        ActivityLog::create([
            'message' => "Command: {$validated['action']} sent to Device {$validated['device_id']}"
        ]);

        return response()->json([
            'status' => 'success',
            'action' => $validated['action'],
            'actuator' => $actuator
        ]);
    }
}