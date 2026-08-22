<?php

namespace App\Http\Controllers\Api;

use App\Enums\DriverStatus;
use App\Enums\TripStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTripRequest;
use App\Http\Requests\UpdateTripRequest;
use App\Models\Trip;

class TripController extends Controller
{
    public function index()
    {
        $trips = Trip::with(['driver', 'vehicle'])->paginate(5);

        return response()->json($trips);

    }

    public function store(StoreTripRequest $tripRequest)
    {

        $trip = Trip::create($tripRequest->validated());

        $trip->driver->update([
            'status' => DriverStatus::OnTrip,
        ]);

        return response()->json($trip->load(['driver', 'vehicle']), 201);

    }

    public function show(int $id)
    {
        return response()->json(Trip::with(['driver', 'vehicle'])->findOrFail($id));
    }

    public function update(UpdateTripRequest $request, int $id)
    {
        $trip = Trip::findOrFail($id);
        $trip->update($request->validated());

        if ($trip->status === TripStatus::Closed) {
            $trip->driver->update([
                'status' => DriverStatus::Available,
            ]);

        }

        return response()->json($trip->load(['driver', 'vehicle']));
    }

    public function destroy(int $id)
    {
        $trip = Trip::findOrFail($id);

        $returnDeletedTrip = [
            'id' => $trip->id,
            'title' => $trip->title,
            'created_at' => $trip->created_at,
        ];

        $trip->delete();

        return response()->json([
            'message' => 'Trip was deleted',
            'trip' => $returnDeletedTrip,
        ], 200);

    }
}
