<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_vehicle_created_successfully()
    {
        $driver = Driver::factory()->create();

        $response = $this->postJson('/api/vehicles', [
            'brand' => 'Toyota',
            'model' => 'Camry',
            'license_plate' => 'ABC1234',
            'year' => 2023,
            'driver_id' => $driver->id,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('vehicles', ['license_plate' => 'ABC1234']);
    }

    public function test_vehicle_requires_valid_driver()
    {
        $response = $this->postJson('/api/vehicles', [
            'brand' => 'Toyota',
            'model' => 'Camry',
            'license_plate' => 'ABC1234',
            'driver_id' => 999,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('driver_id');
    }

    public function test_one_driver_can_have_multiple_vehicles()
    {
        $driver = Driver::factory()->create();

        Vehicle::create([
            'brand' => 'Toyota',
            'model' => 'Camry',
            'license_plate' => 'ABC1234',
            'driver_id' => $driver->id,
        ]);

        Vehicle::create([
            'brand' => 'Honda',
            'model' => 'Accord',
            'license_plate' => 'XYZ5678',
            'driver_id' => $driver->id,
        ]);

        $this->assertEquals(2, $driver->vehicles()->count());
    }

    public function test_vehicle_belongs_to_one_driver()
    {
        $driver = Driver::factory()->create();
        $vehicle = Vehicle::factory()->create(['driver_id' => $driver->id]);

        $this->assertEquals($driver->id, $vehicle->driver()->first()->id);
    }

    public function test_license_plate_converted_to_uppercase()
    {
        $driver = Driver::factory()->create();

        $vehicle = Vehicle::create([
            'brand' => 'Toyota',
            'model' => 'Camry',
            'license_plate' => 'abc1234',
            'driver_id' => $driver->id,
        ]);

        $this->assertEquals('ABC1234', $vehicle->license_plate);
    }

    public function test_license_plate_must_be_unique()
    {
        $driver = Driver::factory()->create();

        Vehicle::create([
            'brand' => 'Toyota',
            'model' => 'Camry',
            'license_plate' => 'ABC1234',
            'driver_id' => $driver->id,
        ]);

        $response = $this->postJson('/api/vehicles', [
            'brand' => 'Honda',
            'model' => 'Accord',
            'license_plate' => 'ABC1234',
            'driver_id' => $driver->id,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('license_plate');
    }
}
