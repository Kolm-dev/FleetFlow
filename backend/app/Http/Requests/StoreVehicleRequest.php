<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\FuelType;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'license_plate' => 'required|string|max:8|unique:vehicles',
            'year' => 'sometimes|integer|min:1900|max:' . date('Y'),
            'driver_id' => 'required|integer|exists:drivers,id',
            'fuel_consumption' => 'required|numeric|gt:0',
            'fuel_type' => ['required', Rule::enum(FuelType::class)],

        ];
    }

    public function messages(): array
    {
        return [
            'brand.required' => 'The brand field is required.',
            'model.required' => 'The model field is required.',
            'license_plate.required' => 'The license plate field is required.',
            'license_plate.unique' => 'The license plate must be unique.',
            'driver_id.required' => 'The "driver_id" field is required.',
            'driver_id.exists' => 'Driver does not exist.',
            'fuel_type.enum' => 'The selected fuel type is invalid - it must be "diesel" or "gasoline".',
            'fuel_consumption.required' => 'The fuel consumption field is required.',
            'fuel_consumption.numeric' => 'The fuel consumption must be a number.',
            'fuel_consumption.gt' => 'The fuel consumption must be greater than zero.',
        ];
    }
}
