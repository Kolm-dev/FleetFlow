<?php

namespace App\Http\Controllers\Api;

use App\Enums\DriverStatus;
use App\Enums\TripStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDriverRequest;
use App\Http\Requests\UpdateDriverRequest;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DriverController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['sometimes', Rule::enum(DriverStatus::class)],
            'search' => ['sometimes', 'string'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $query = Driver::with('vehicles');

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                    ->orWhere('phone_number', 'ILIKE', "%{$search}%");

                if (ctype_digit($search)) {
                    $q->orWhere('id', (int) $search);
                }
            });
        }

        $drivers = $query->orderBy('id')->paginate(15);

        return response()->json([
            'total' => $drivers->total(),
            'drivers' => $drivers->items(),
            'current_page' => $drivers->currentPage(),
            'last_page' => $drivers->lastPage(),
            'per_page' => $drivers->perPage(),
        ]);
    }

    public function show(Driver $driver)
    {

        $closedTripsBuilder = $driver->trips()->where('status', TripStatus::Closed);

        $closedTripsCount = $closedTripsBuilder->count();
        $totalEarnings = $closedTripsBuilder->sum('price');
        $totalDistance = $closedTripsBuilder->sum('distance');
        $allClosedTrips = $closedTripsBuilder->orderByDesc('created_at')->paginate(5);

        return response()->json([
            'driver' => $driver->load('vehicles'),
            'statistics' => [
                'closed_trips_count' => $closedTripsCount,
                'total_earnings' => $totalEarnings,
                'total_distance' => $totalDistance,
            ],
            'closed_trips' => $allClosedTrips,

        ]);
    }

    public function destroy(Driver $driver)
    {
        $driver->delete();

        return response()->noContent();
    }

    public function update(UpdateDriverRequest $request, int $id)
    {
        $driver = Driver::findOrFail($id);

        $driver->update($request->validated());

        return response()->json([
            'message' => 'Driver updated successfully.',
            'driver' => $driver->load('vehicles'),
        ]);
    }

    public function store(StoreDriverRequest $request)
    {
        $driver = Driver::create($request->validated());

        return response()->json([
            'message' => 'Driver created successfully.',
            'driver' => $driver->load('vehicles'),
        ], 201);
    }
}
