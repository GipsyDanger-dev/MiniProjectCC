<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('device.{id}', function () {
    return true;
});
