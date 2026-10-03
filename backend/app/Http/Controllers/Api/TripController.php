<?php

namespace App\Http\Controllers\Api;

use App\Enums\DriverStatus;
use App\Enums\TripEventEnum;
use App\Enums\TripStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTripRequest;
use App\Http\Requests\UpdateTripRequest;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use App\Services\TripPriceCalculator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;


class TripController extends Controller
{
    public function index(Request $request)
    {

        $request->validate(
            [
                'status' => ['sometimes', 'array'],
                'status.*' => [Rule::enum(TripStatus::class)],
                'sort' => 'sometimes|string|in:price,created_at,-price,-created_at',
                'search' => 'sometimes|string|max:255',
            ]
        );

        $query = Trip::with(['driver', 'vehicle']);

        $query->when($request->filled('status'), function ($query) use ($request) {
            $query->whereIn('status', $request->input('status'));
        });

        $query->when($request->filled('search'), function (Builder $query) use ($request) {
            $search = trim($request->input('search'));
            $normalizedSearch = mb_strtolower($search);

            $query->where(function (Builder $query) use ($search, $normalizedSearch) {
                $query->whereRaw('LOWER(title) LIKE ?', ["%{$normalizedSearch}%"]);

                if (ctype_digit($search)) {
                    $query->orWhere('id', (int) $search);
                }
            });
        });

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
        $data = $tripRequest->validated();

        $trip = DB::transaction(function () use ($data) {

            $driver = Driver::query()->lockForUpdate()->findOrFail($data['driver_id']);
            if ($driver->status !== DriverStatus::Available) {
                abort(422, 'Driver is not available.');
            }

            if ($driver->vehicles()->whereKey($data['vehicle_id'])->doesntExist()) {
                abort(422, 'Vehicle does not belong to this driver.');
            }

            $trip = Trip::create([
                ...$data,
                'status' => TripStatus::Planned,
            ]);

            $driver->update([
                'status' => DriverStatus::OnTrip,
            ]);

            $trip->events()->create([
                'type' => TripEventEnum::CREATED,
                'user_id' => Auth::id(),

                'data' => [
                    'vehicle_id' => $trip->vehicle_id,
                    'driver_id' => $trip->driver_id,
                    'status' => $trip->status,
                ],
            ]);

            return $trip;
        });


        return response()->json([
            'message' => 'Trip created successfully.',
            'trip' => $trip->load(['driver', 'vehicle']),
        ], 201);
    }

    public function show(Trip $trip)
    {

        $trip->load(['driver', 'vehicle']);

        return response()->json(
            [
                'trip' => $trip,
            ]
        );
    }

    public function update(UpdateTripRequest $request, int $id)
    {
        $newTripData = $request->validated();

        $trip = DB::transaction(function () use ($id, $newTripData) {
            $currentTrip = Trip::query()->lockForUpdate()->findOrFail($id);

            $currentDriverId = $currentTrip->driver_id;
            $currentVehicleId = $currentTrip->vehicle_id;
            $newDriverId = (int) ($newTripData['driver_id'] ?? $currentDriverId);
            $newVehicleId = (int) ($newTripData['vehicle_id'] ?? $currentVehicleId);

            $driverWasChanged = $newDriverId !== $currentDriverId;
            $vehicleWasChanged = $newVehicleId !== $currentVehicleId;
            $assignmentWasChanged = $driverWasChanged || $vehicleWasChanged;
            $tripIsPlanned = $currentTrip->status === TripStatus::Planned;

            if ($assignmentWasChanged && ! $tripIsPlanned) {
                $errors = [];

                if ($driverWasChanged) {
                    $errors['driver_id'] = ['Driver can be changed only for planned trips.'];
                }

                if ($vehicleWasChanged) {
                    $errors['vehicle_id'] = ['Vehicle can be changed only for planned trips.'];
                }

                throw \Illuminate\Validation\ValidationException::withMessages($errors);
            }

            $newVehicle = Vehicle::findOrFail($newVehicleId);

            if ($newVehicle->driver_id !== $newDriverId) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'vehicle_id' => ['Vehicle does not belong to this driver.'],
                ]);
            }

            if ($driverWasChanged) {
                $lockedDrivers = Driver::query()
                    ->whereIn('id', [$currentDriverId, $newDriverId])
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                $currentDriver = $lockedDrivers->get($currentDriverId);
                $newDriver = $lockedDrivers->get($newDriverId);

                if ($newDriver->status !== DriverStatus::Available) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'driver_id' => ['Driver is not available.'],
                    ]);
                }

                if ($currentDriver->status !== DriverStatus::OnTrip) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'driver_id' => ['Current driver is not assigned to this trip.'],
                    ]);
                }

                $currentDriver->update([
                    'status' => DriverStatus::Available,
                ]);

                $newDriver->update([
                    'status' => DriverStatus::OnTrip,
                ]);
            }

            $currentTrip->fill($newTripData);
            $updatedFields = [];

            foreach (array_keys($newTripData) as $field) {
                if ($field === 'driver_id' || !$currentTrip->isDirty($field)) {
                    continue;
                }

                $updatedFields[$field] = [
                    'old' => $currentTrip->getOriginal($field),
                    'new' => $currentTrip->getAttribute($field),
                ];
            }

            $currentTrip->save();

            if ($driverWasChanged) {
                $currentTrip->events()->create([
                    'type' => TripEventEnum::DRIVER_CHANGED,
                    'user_id' => Auth::id(),
                    'data' => [
                        'old_driver_id' => $currentDriverId,
                        'new_driver_id' => $newDriverId,
                    ],
                ]);
            }

            if ($updatedFields !== []) {
                $currentTrip->events()->create([
                    'type' => TripEventEnum::UPDATED,
                    'user_id' => Auth::id(),
                    'data' => [
                        'fields' => $updatedFields,
                    ],
                ]);
            }

            return $currentTrip;
        });

        return response()->json([
            'message' => 'Trip updated successfully.',
            'trip' => $trip->load(['driver', 'vehicle']),
        ]);
    }

    public function start(Trip $trip)
    {
        $driverIsAssigned = $trip->driver->status === DriverStatus::OnTrip;
        $tripIsPlanned = $trip->status === TripStatus::Planned;
        $reasons = [];
        $oldTripStatus = $trip->status;


        if (! $tripIsPlanned) {
            $reasons[] = 'trip is not planned';
        }

        if (! $driverIsAssigned) {
            $reasons[] = 'driver is not assigned';
        }

        if ($reasons) {
            return response()->json([
                'message' => 'Trip cannot be started because ' . implode(' and ', $reasons) . '.',
                'trip' => $trip,
            ], 422);
        }

        DB::transaction(function () use ($trip, $oldTripStatus) {
            $trip->update([
                'status' => TripStatus::Pending,
            ]);


            $trip->events()->create([
                'type' => TripEventEnum::STARTED,
                'user_id' => Auth::id(),
                'data' => [
                    'old_status' => $oldTripStatus,
                    'new_status' => TripStatus::Pending,
                ],
            ]);
        });

        return response()->json([
            'message' => 'Trip was started successfully.',
            'trip' => $trip,

        ]);
    }
    public function close(Trip $trip)
    {
        if ($trip->status !== TripStatus::Pending) {
            return response()->json([
                'message' => 'Trip cannot be closed because it is not in progress.',
            ], 422);
        }

        $userID = Auth::id();
        $currentTripStatus = $trip->status;

        DB::transaction(function () use ($trip, $userID, $currentTripStatus) {
            $trip->update([
                'status' => TripStatus::Closed,
                'completed_at' => now(),
            ]);

            $trip->driver->update([
                'status' => DriverStatus::Available,
            ]);

            $trip->events()->create([
                'type' => TripEventEnum::CLOSED,
                'user_id' => $userID,
                'data' => [
                    'old_status' => $currentTripStatus,
                    'new_status' => TripStatus::Closed,
                ],

            ]);
        });

        return response()->json([
            'message' => 'Trip closed successfully.',
            'trip' => $trip->load(['driver', 'vehicle']),
        ]);
    }

    public function cancel(Trip $trip)
    {
        if (!in_array($trip->status, [TripStatus::Planned, TripStatus::Pending], true)) {
            abort(422, 'Trip cannot be cancelled from its current status.');
        }

        if ($trip->driver->status !== DriverStatus::OnTrip) {
            abort(422, 'Driver is not assigned to this trip.');
        }

        $oldTripStatus = $trip->status;
        DB::transaction(function () use ($trip, $oldTripStatus) {
            $trip->update([
                'status' => TripStatus::Cancelled,
            ]);
            $trip->events()->create([
                'type' => TripEventEnum::CANCELLED,
                'user_id' => Auth::id(),
                'data' => [
                    'old_status' => $oldTripStatus,
                    'new_status' => TripStatus::Cancelled,
                ],
            ]);

            $trip->driver->update([
                'status' => DriverStatus::Available,
            ]);
        });
        return response()->json([
            'message' => 'Trip cancelled successfully.',
            'trip' => $trip->fresh(['driver', 'vehicle']),
        ]);
    }

    public function destroy(Trip $trip)
    {
        $result = DB::transaction(function () use ($trip) {
            $actualTrip = Trip::query()->lockForUpdate()->findOrFail($trip->id);

            if ($actualTrip->status === TripStatus::Pending) {
                return [
                    'error' => response()->json([
                        'message' => 'Trip cannot be deleted because it is already in use.',
                    ], 422),
                ];
            }

            if ($actualTrip->status === TripStatus::Planned) {
                $driver = Driver::query()->lockForUpdate()->findOrFail($actualTrip->driver_id);

                if ($driver->status !== DriverStatus::OnTrip) {
                    return [
                        'error' => response()->json([
                            'message' => 'Trip cannot be deleted because its driver is not assigned to this trip.',
                        ], 422),
                    ];
                }

                $driver->update([
                    'status' => DriverStatus::Available,
                ]);
            }

            $attachmentsToDelete = $actualTrip->attachments()
                ->get(['disk', 'path'])
                ->map(fn ($attachment) => [
                    'disk' => $attachment->disk,
                    'path' => $attachment->path,
                ])
                ->all();

            $actualTrip->delete();

            return [
                'attachments' => $attachmentsToDelete,
            ];
        });

        if (isset($result['error'])) {
            return $result['error'];
        }

        foreach ($result['attachments'] as $attachment) {
            $deleted = Storage::disk($attachment['disk'])->delete($attachment['path']);

            if (! $deleted) {
                throw new \RuntimeException("Trip was deleted, but attachment file [{$attachment['path']}] could not be deleted from disk [{$attachment['disk']}].");
            }
        }

        return response()->noContent();
    }

    public function calculatePrice(Request $request, TripPriceCalculator $calculator)
    {
        $data = $request->validate([
            'distance' => ['required', 'numeric', 'gt:0'],
        ]);

        return response()->json([
            'recommended_price' => $calculator->calculate($data['distance']),
        ]);
    }
}
