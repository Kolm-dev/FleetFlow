<?php

namespace Tests\Feature;

use App\Enums\DriverStatus;
use App\Enums\TripStatus;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FilterTest extends TestCase
{
    use RefreshDatabase;

    public function test_drivers_can_be_filtered_by_status(): void
    {
        $availableDriver = Driver::factory()->create([
            'status' => DriverStatus::Available,
        ]);

        $busyDriver = Driver::factory()->create([
            'status' => DriverStatus::OnTrip,
        ]);

        $response = $this->getJson('/api/drivers?status=available');

        $response->assertOk();
        $response->assertJsonPath('total', 1);
        $response->assertJsonFragment([
            'id' => $availableDriver->id,
        ]);
        $response->assertJsonMissing([
            'id' => $busyDriver->id,
        ]);
    }

    public function test_drivers_filter_rejects_invalid_status(): void
    {
        $response = $this->getJson('/api/drivers?status=busy');

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('status');
    }

    public function test_trips_can_be_filtered_by_status(): void
    {
        $driver = Driver::factory()->create();
        $vehicle = Vehicle::factory()->create(['driver_id' => $driver->id]);

        $plannedTrip = Trip::factory()->create([
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
            'status' => TripStatus::Planned,
        ]);

        $closedTrip = Trip::factory()->create([
            'driver_id' => $driver->id,
            'vehicle_id' => $vehicle->id,
            'status' => TripStatus::Closed,
        ]);

        $response = $this->getJson('/api/trips?status=planned');

        $response->assertOk();
        $response->assertJsonPath('total', 1);
        $response->assertJsonFragment([
            'id' => $plannedTrip->id,
        ]);
        $response->assertJsonMissing([
            'id' => $closedTrip->id,
        ]);
    }

    public function test_trips_filter_rejects_invalid_status(): void
    {
        $response = $this->getJson('/api/trips?status=wrong');

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('status');
    }
}
