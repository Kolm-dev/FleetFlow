<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'license_plate' => 'sometimes|string|max:8|unique:vehicles,license_plate,'.$this->route('vehicle'),
            'driver_id' => 'sometimes|integer|exists:drivers,id',
            'year' => 'sometimes|integer|min:1900|max:'.date('Y'),
        ];
    }
}
