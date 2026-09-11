<?php

namespace App\Http\Controllers\Api;

use App\Enums\DriverStatus;
use App\Enums\TripStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTripRequest;
use App\Http\Requests\UpdateTripRequest;
use App\Models\Driver;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TripController extends Controller
{
    public function index(Request $request)
    {

        $request->validate(
            [
                'status' => [
                    'sometimes',
                    Rule::enum(TripStatus::class),
                ],
                'sort' => 'sometimes|string|in:price,created_at,-price,-created_at',
            ]
        );

        $query = Trip::with(['driver', 'vehicle']);

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $this->sort($query, $request);

        $trips = $query->paginate(5);

        return response()->json($trips);
    }

    private function sort(Builder $query, Request $request)
    {
        if (! $request->has('sort')) {
            return;
        }

        $sort = $request->query('sort');

        $directionSort = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $whatSort = ltrim($sort, '-');

        $query->orderBy($whatSort, $directionSort);
    }

    public function store(StoreTripRequest $tripRequest)
    {
        $trip = DB::transaction(function () use ($tripRequest) {
            $trip = Trip::create($tripRequest->validated());

            $trip->driver->update([
                'status' => DriverStatus::OnTrip,
            ]);

            return $trip;
        });

        return response()->json($trip->load(['driver', 'vehicle']), 201);
    }

    public function show(int $id)
    {
        return response()->json(Trip::with(['driver', 'vehicle'])->findOrFail($id));
    }

    public function update(UpdateTripRequest $request, int $id)
    {
        $trip = Trip::findOrFail($id);


        $currentDriver = $trip->driver;

        $trip = DB::transaction(function () use ($request, $trip, $currentDriver) {
            $trip->update($request->validated());


            $driverWasChanged = $trip->driver_id !== $currentDriver->id;
            $tripIsClosed = $trip->status === TripStatus::Closed;

            //  закрыли-> освобождаем водителя
            if ($tripIsClosed) {
                $currentDriver->update([
                    'status' => DriverStatus::Available,
                ]);

                return $trip;
            }

            // меняем водителя: old -> available, new -> on trip
            if ($driverWasChanged) {
                $currentDriver->update([
                    'status' => DriverStatus::Available,
                ]);

                $newDriver = Driver::findOrFail($trip->driver_id);

                $newDriver->update([
                    'status' => DriverStatus::OnTrip,
                ]);
            }

            return $trip;
        });

        return response()->json(
            $trip->load(['driver', 'vehicle'])
        );
    }

    public function close(Trip $trip)
    {
        $trip->update([
            'status' => TripStatus::Closed,
        ]);

        $trip->driver->update([
            'status' => DriverStatus::Available,
        ]);

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
