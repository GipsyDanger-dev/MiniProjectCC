<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Seed IoT Devices with API Keys
        DB::table('devices')->insert([
            [
                'id' => 1,
                'device_name' => 'Main Hall',
                'location' => 'Main Hall',
                'api_key' => 'key-servernih-121',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'device_name' => 'Kitchen',
                'location' => 'Kitchen',
                'api_key' => 'key-dapurnih-212',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'device_name' => 'Warehouse',
                'location' => 'Warehouse',
                'api_key' => 'key-arsipnih-311',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 4,
                'device_name' => 'Server Room',
                'location' => 'Server Room',
                'api_key' => 'key-koridornih-441',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
