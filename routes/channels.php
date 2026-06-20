<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('device.{id}', function () {
    return true; // Public channel, no auth needed for IoT dashboard
});
