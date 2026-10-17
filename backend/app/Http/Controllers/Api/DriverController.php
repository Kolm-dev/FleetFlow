<?php

namespace App\Http\Controllers\Api;

use App\Enums\DriverStatus;
use App\Enums\TripStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Drivers\StoreDriverRequest;
use App\Http\Requests\Drivers\UpdateDriverRequest;
use App\Models\Drivers\Driver;
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
            $search = trim($request->input('search'));

            if (preg_match('/^#\d+$/', $search)) {
                $query->whereKey((int) substr($search, 1));
            } else {
                $query->where(function ($q) use ($search) {
                    $q->whereLike('name', "%{$search}%")
                        ->orWhereLike('phone_number', "%{$search}%");
                });
            }
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

    public function show(Driver $driver, Request $request)
    {
        $validated = $request->validate([
            'from' => ['sometimes', 'date'],
            'to' => ['sometimes', 'date', 'after_or_equal:from'],
        ]);
        $closedTripsBuilder = $driver->trips()
            ->with('vehicle')
            ->where('status', TripStatus::Closed);
        $currentTrip = $driver->trips()
            ->with('vehicle')
            ->whereIn('status', [TripStatus::Planned, TripStatus::Pending])
            ->latest('updated_at')
            ->first();

        if (isset($validated['from'])) {
            $closedTripsBuilder->whereDate('completed_at', '>=', $validated['from']);
        }

        if (isset($validated['to'])) {
            $closedTripsBuilder->whereDate('completed_at', '<=', $validated['to']);
        }

        $closedTripsCount = $closedTripsBuilder->count();
        $totalEarnings = $closedTripsBuilder->sum('price');
        $totalDistance = $closedTripsBuilder->sum('distance');
        $allClosedTrips = $closedTripsBuilder
            ->orderByDesc('completed_at')
            ->paginate(5);

        return response()->json([
            'driver' => $driver->load('vehicles'),
            'statistics' => [
                'closed_trips_count' => $closedTripsCount,
                'total_earnings' => $totalEarnings,
                'total_distance' => $totalDistance,
            ],
            'closed_trips' => $allClosedTrips,
            'current_trip' => $currentTrip,

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
