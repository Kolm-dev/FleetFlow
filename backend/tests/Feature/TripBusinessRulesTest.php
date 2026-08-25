<?php

namespace Tests\Feature;

use App\Enums\DriverStatus;
use App\Enums\TripStatus;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TripBusinessRulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_trip_with_available_driver_and_his_vehicle(): void
    {
        $driver = Driver::factory()->create(['status' => DriverStatus::Available]);
        $vehicle = Vehicle::factory()->create(['driver_id' => $driver->id]);

        $response = $this->postJson('/api/trips', [
            'title' => 'Valid create trip',
            'distance' => 120,
            'price' => 500,
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
            'status' => TripStatus::Planned->value,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('trips', [
            'title' => 'Valid create trip',
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
        ]);
    }

    public function test_can_update_trip_title_without_changing_driver_or_vehicle(): void
    {
        $driver = Driver::factory()->create(['status' => DriverStatus::OnTrip]);
        $vehicle = Vehicle::factory()->create(['driver_id' => $driver->id]);
        $trip = Trip::factory()->create([
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
            'status' => TripStatus::Pending,
        ]);

        $response = $this->patchJson("/api/trips/{$trip->id}", [
            'title' => 'Updated title',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('trips', [
            'id' => $trip->id,
            'title' => 'Updated title',
        ]);
    }

    public function test_can_reassign_trip_to_available_driver_with_his_vehicle(): void
    {
        $oldDriver = Driver::factory()->create(['status' => DriverStatus::OnTrip]);
        $oldVehicle = Vehicle::factory()->create(['driver_id' => $oldDriver->id]);
        $trip = Trip::factory()->create([
            'driver_id' => $oldDriver->id,
            'vehicle_id' => $oldVehicle->id,
            'status' => TripStatus::Pending,
        ]);

        $newDriver = Driver::factory()->create(['status' => DriverStatus::Available]);
        $newVehicle = Vehicle::factory()->create(['driver_id' => $newDriver->id]);

        $response = $this->patchJson("/api/trips/{$trip->id}", [
            'driver_id' => $newDriver->id,
            'vehicle_id' => $newVehicle->id,
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('trips', [
            'id' => $trip->id,
            'driver_id' => $newDriver->id,
            'vehicle_id' => $newVehicle->id,
        ]);
    }

    public function test_cannot_create_trip_with_unavailable_driver(): void
    {
        $driver = Driver::factory()->create(['status' => DriverStatus::Unavailable]);
        $vehicle = Vehicle::factory()->create(['driver_id' => $driver->id]);

        $response = $this->postJson('/api/trips', [
            'title' => 'Invalid unavailable driver',
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('driver_id');
    }

    public function test_cannot_create_trip_with_vehicle_that_belongs_to_another_driver(): void
    {
        $driver = Driver::factory()->create(['status' => DriverStatus::Available]);
        $anotherDriver = Driver::factory()->create(['status' => DriverStatus::Available]);
        $vehicle = Vehicle::factory()->create(['driver_id' => $anotherDriver->id]);

        $response = $this->postJson('/api/trips', [
            'title' => 'Invalid vehicle owner',
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('vehicle_id');
    }

    public function test_cannot_reassign_trip_to_busy_driver(): void
    {
        $oldDriver = Driver::factory()->create(['status' => DriverStatus::OnTrip]);
        $oldVehicle = Vehicle::factory()->create(['driver_id' => $oldDriver->id]);
        $trip = Trip::factory()->create([
            'driver_id' => $oldDriver->id,
            'vehicle_id' => $oldVehicle->id,
            'status' => TripStatus::Pending,
        ]);

        $busyDriver = Driver::factory()->create(['status' => DriverStatus::OnTrip]);
        $busyDriverVehicle = Vehicle::factory()->create(['driver_id' => $busyDriver->id]);

        $response = $this->patchJson("/api/trips/{$trip->id}", [
            'driver_id' => $busyDriver->id,
            'vehicle_id' => $busyDriverVehicle->id,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('driver_id');
    }

    public function test_can_close_trip_and_make_driver_available(): void
    {
        $driver = Driver::factory()->create(['status' => DriverStatus::OnTrip]);
        $vehicle = Vehicle::factory()->create(['driver_id' => $driver->id]);
        $trip = Trip::factory()->create([
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
            'status' => TripStatus::Pending,
        ]);

        $response = $this->patchJson("/api/trips/{$trip->id}/close");

        $response->assertOk();
        $this->assertDatabaseHas('trips', [
            'id' => $trip->id,
            'status' => TripStatus::Closed->value,
        ]);
        $this->assertDatabaseHas('drivers', [
            'id' => $driver->id,
            'status' => DriverStatus::Available->value,
        ]);
    }
}
