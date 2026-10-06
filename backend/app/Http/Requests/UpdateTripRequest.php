<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTripRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {

        return [
            'title' => 'sometimes|string|max:255',
            'distance' => 'sometimes|nullable|integer|min:0',
            'driver_id' => 'sometimes|integer|exists:drivers,id',
            'vehicle_id' => 'sometimes|integer|exists:vehicles,id',
            'client_id' => 'sometimes|integer|exists:clients,id',
            'price' => 'sometimes|nullable|numeric|min:0',
            'status' => ['prohibited']

        ];
    }

}
