<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

class VehicleController extends Controller
{
    public function store(StoreVehicleRequest $request)
    {

        $vehicle = Vehicle::create($request->validated())->load('driver');

        return response()->json([
            'message' => 'Vehicle created successfully.',
            'vehicle' => $vehicle,
        ], 201);
    }

    public function index(Request $request)
    {
        $request->validate(
            [
                'driver_id' => 'sometimes|integer|exists:drivers,id',
                'license_plate' => 'sometimes|string|max:8',
                'search' => 'sometimes|string|max:50',
                'page' => 'sometimes|integer|min:1',

            ]
        );

        $query = Vehicle::with('driver');

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($q) use ($search) {
                $q->where('license_plate', 'ILIKE', "%{$search}%")
                    ->orWhere('brand', 'ILIKE', "%{$search}%")
                    ->orWhere('model', 'ILIKE', "%{$search}%");

                if (ctype_digit($search)) {
                    $q->orWhere('id', (int) $search);
                }
            });
        }
        $vehicles = $query->orderBy('id')->paginate(15);

        return response()->json(
            [
                'total' => $vehicles->total(),
                'vehicles' => $vehicles->items(),
                'current_page' => $vehicles->currentPage(),
                'last_page' => $vehicles->lastPage(),
                'per_page' => $vehicles->perPage(),
            ],
            200
        );
    }

    public function show(Vehicle $vehicle)
    {
        $serviceCount = $vehicle->vehicleServices()->count();
        $totalCostServices = (float) $vehicle->vehicleServices()->sum('cost');

        $lastService = $vehicle->vehicleServices()
            ->orderByDesc('service_date')
            ->first();


        $averageServiceCost = $vehicle->vehicleServices()->avg('cost');

        $averageServiceCost = $averageServiceCost !== null
            ? round((float) $averageServiceCost, 2)
            : null;


        return response()->json([
            'vehicle' => $vehicle->load('driver'),

            'service_statistics' => [
                'total_services' => $serviceCount,
                'total_service_cost' => $totalCostServices,
                'last_service_date' => $lastService?->service_date?->format('Y-m-d'),
                'last_service_cost' => $lastService?->cost,
                'last_service_mileage' => $lastService?->mileage,
                'average_service_cost' => $averageServiceCost,
            ],
        ]);
    }

    public function update(int $id, UpdateVehicleRequest $request)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update($request->validated());

        return response()->json([
            'message' => 'Vehicle updated successfully.',
            'vehicle' => $vehicle->load('driver'),
        ]);
    }

    public function destroy(Vehicle $vehicle)
    {

        $vehicle->delete();

        return response()->noContent();
    }
}
