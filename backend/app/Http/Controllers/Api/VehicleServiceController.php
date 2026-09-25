<?php

namespace App\Http\Controllers\Api;

use App\Enums\VehicleServiceType;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleServiceRequest;
use App\Http\Requests\UpdateVehicleServiceRequest;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class VehicleServiceController extends Controller
{

    public function index(Vehicle $vehicle, Request $request)
    {
        $query = $vehicle->vehicleServices();

        $validated = $request->validate(
            [
                'types' => ['sometimes', 'array'],
                'types.*' => [new Enum(VehicleServiceType::class)],

                'sort' => ['sometimes', 'array'],
                'sort.*' => [
                    Rule::in([
                        'service_date',
                        '-service_date',
                        'mileage',
                        '-mileage',
                        'cost',
                        '-cost',
                    ]),
                ],
            ],
        );

        $validatedSorts = $validated['sort'] ?? [];

        $validatedTypes = $validated['types'] ?? [];

        $query->when(! empty($validatedTypes), function ($query) use ($validatedTypes) {

            if ($validatedTypes !== []) {
                $query->whereIn('type', $validatedTypes);

            }
        });

        $this->sort($query, $validatedSorts);

        $services = $query->paginate(10);

        return response()->json($services);
    }


    public function store(StoreVehicleServiceRequest $request, Vehicle $vehicle)
    {
        $validated = $request->validated();

        $service = $vehicle->vehicleServices()->create($validated);

        return response()->json($service, 201);
    }

    private function sort(HasMany $query, array $sorts): void
    {
        if (empty($sorts)) {
            $query->orderByDesc('service_date');

        } else {

            foreach ($sorts as $sort) {
                $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
                $column = ltrim($sort, '-');

                $query->orderBy($column, $direction);
            }
        }
        $query->orderBy('id');
    }

   // /api/vehicles/{vehicle}/services/{service}


    public function show(Vehicle $vehicle, $serviceId)
    {
        return $vehicle->vehicleServices()->findOrFail($serviceId);
    }

    public function update(UpdateVehicleServiceRequest $request, Vehicle $vehicle, $serviceId)
    {
        $validated = $request->validated();
        $service = $vehicle->vehicleServices()->findOrFail($serviceId);
        $service->update($validated);

        return response()->json([
            'message' => 'Vehicle service updated successfully.',
            'service' => $service,
        ]);
    }

    public function destroy(Vehicle $vehicle, $serviceId)
    {
        $service = $vehicle->vehicleServices()->findOrFail($serviceId);
        $service->delete();

        return response()->noContent();
    }
}
