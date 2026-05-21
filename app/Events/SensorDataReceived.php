<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SensorDataReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $sensorData,
        public array $decision,
        public string $emergencyStatus,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('device.' . $this->sensorData['device_id']),
        ];
    }

    public function broadcastAs(): string
    {
        return 'SensorDataReceived';
    }

    public function broadcastWith(): array
    {
        return [
            'sensor_data' => $this->sensorData,
            'decision' => $this->decision,
            'emergency_status' => $this->emergencyStatus,
        ];
    }
}
