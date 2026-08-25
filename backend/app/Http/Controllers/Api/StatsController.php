<?php

namespace App\Http\Controllers\Api;

use App\Enums\DriverStatus;
use App\Enums\TripStatus;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;

class StatsController extends Controller
{
    public function index()
    {
        // dd([
        //     'drivers' => $this->driversStats(),
        //     'vehicles' => $this->vehiclesStats(),
        //     'trips' => $this->tripsStats(),
        // ]);

        return response()->json([
            'drivers' => $this->driversStats(),
            'vehicles' => $this->vehiclesStats(),
            'trips' => $this->tripsStats(),
        ]);
    }

    private function tripsStats()
    {
        return [
            'total' => Trip::count(),
            'planned' => Trip::where('status', TripStatus::Planned)->count(),
            'pending' => Trip::where('status', TripStatus::Pending)->count(),
            'closed' => Trip::where('status', TripStatus::Closed)->count(),
        ];
    }

    private function vehiclesStats()
    {
        return [
            'total' => Vehicle::count(),
        ];
    }

    private function driversStats()
    {
        return [
            'total' => Driver::count(),
            'available' => Driver::where('status', DriverStatus::Available)->count(),
            'on_trip' => Driver::where('status', DriverStatus::OnTrip)->count(),
            'unavailable' => Driver::where('status', DriverStatus::Unavailable)->count(),

        ];
    }
}
