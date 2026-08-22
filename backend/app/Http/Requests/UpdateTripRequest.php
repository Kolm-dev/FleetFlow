<?php

namespace App\Http\Requests;

use App\Enums\DriverStatus;
use App\Enums\TripStatus;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {

        $status = Rule::enum(TripStatus::class);

        return [
            'title' => 'sometimes|string|max:255',
            'distance' => 'sometimes|nullable|integer|min:0',
            'driver_id' => 'sometimes|integer|exists:drivers,id',
            'vehicle_id' => 'sometimes|integer|exists:vehicles,id',
            'price' => 'nullable|numeric|min:0',
            'status' => ['sometimes|string', $status],
        ];
    }

    public function after(): array
    {

        return [

            function ($validator) {
                $trip = Trip::find($this->route('trip'));

                $driverId = $this->input('driver_id', $trip->driver_id);
                $vehicleId = $this->input('vehicle_id', $trip->vehicle_id);

                $driver = Driver::find($driverId);
                $vehicle = Vehicle::find($vehicleId);

                if (! $driver || ! $vehicle) {
                    return;
                }

                if ($this->has('driver_id') && (int) $driverId !== $trip->driver_id && $driver->status !== DriverStatus::Available) {
                    $validator->errors()->add(
                        'driver_id',
                        'Driver is not available.'
                    );
                }

                if ($vehicle->driver_id !== (int) $driverId) {
                    $validator->errors()->add(
                        'vehicle_id',
                        'Vehicle doesn\'t not belong to this driver.'
                    );
                }
            },

        ];
    }
}
