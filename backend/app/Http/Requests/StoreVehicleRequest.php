<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'driver_id' => 'required|integer|exists:drivers,id',

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
        ];
    }
}
