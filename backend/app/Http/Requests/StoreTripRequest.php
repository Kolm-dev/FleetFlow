<?php

namespace App\Http\Requests;

use App\Enums\DriverStatus;
use App\Enums\TripStatus;
use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $status = Rule::enum(TripStatus::class);

        return [
            'title' => 'required|string|max:255',
            'distance' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'driver_id' => 'required|integer|exists:drivers,id',
            'vehicle_id' => 'required|integer|exists:vehicles,id',
            'status' => ['sometimes', $status],

        ];
    }

    public function after(): array
    {
        return [
            function ($validator) {
                $driver = Driver::find($this->input('driver_id'));
                $vehicle = Vehicle::find($this->input('vehicle_id'));

                if (! $driver || ! $vehicle) {
                    return;
                }

                if ($driver->status !== DriverStatus::Available) {
                    $validator->errors()->add(
                        'driver_id',
                        'Driver is not available.'
                    );
                }

                if ($vehicle->driver_id !== $driver->id) {
                    $validator->errors()->add(
                        'vehicle_id',
                        'Vehicle does not belong to this driver.'
                    );
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'driver_id.exists' => 'Driver does not exist.',
            'vehicle_id.exists' => 'Vehicle does not exist.',
        ];
    }
}
