<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Models\Vehicle;

class VehicleController extends Controller
{
    public function store(StoreVehicleRequest $request)
    {
        $vehicle = Vehicle::create($request->validated())->load('driver');

        return response()->json([
            'message' => 'Vehicle created.',
            'vehicle' => $vehicle,
        ], 201);

    }

    public function index()
    {

        $count = Vehicle::count();
        $vehicles = Vehicle::with('driver')->get();

        return response()->json(['total' => $count, 'vehicles' => $vehicles], 200);
    }

    public function show(int $id)
    {
        return response()->json(Vehicle::with('driver')->findOrFail($id));
    }

    public function update(int $id, UpdateVehicleRequest $request)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update($request->validated());

        return response()->json([
            'message' => 'Vehicle updated',
            'vehicle' => $vehicle,
        ]);
    }

    public function destroy(int $id)
    {

        $vehicle = Vehicle::findOrFail($id);

        $deleted = [
            'id' => $vehicle->id,
            'brand' => $vehicle->brand,
            'model' => $vehicle->model,
            'license_plate' => $vehicle->license_plate,
        ];

        $vehicle->delete();

        return response()->json([
            'message' => 'Vehicle deleted',
            'deleted_vehicle' => $deleted,
        ]);

    }
}
