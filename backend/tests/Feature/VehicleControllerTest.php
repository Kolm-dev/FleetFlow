<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VehicleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $user = User::create([
            'name' => 'name',
            "password" => bcrypt('password')
        ]);

        $this->actingAs($user);
    }

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

    public function test_vehicles_are_paginated_by_fifteen(): void
    {
        Vehicle::factory()->count(16)->create();

        $response = $this->getJson('/api/vehicles');

        $response->assertOk();
        $response->assertJsonCount(15, 'vehicles');
        $response->assertJsonPath('total', 16);
        $response->assertJsonPath('current_page', 1);
        $response->assertJsonPath('last_page', 2);
        $response->assertJsonPath('per_page', 15);
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
