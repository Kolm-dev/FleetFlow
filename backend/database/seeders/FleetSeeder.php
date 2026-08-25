<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class FleetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $drivers = Driver::factory(10)->create();

        foreach ($drivers as $driver) {
            Vehicle::factory(rand(1, 3))->create([
                'driver_id' => $driver->id,
            ]);
        }

        Vehicle::all()->each(function ($vehicle) {
            Trip::factory(rand(0, 2))->create([
                'driver_id' => $vehicle->driver_id,
                'vehicle_id' => $vehicle->id,
            ]);
        });
    }
}
