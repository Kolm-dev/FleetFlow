<?php

namespace App\Http\Requests;

use App\Enums\VehicleServiceType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateVehicleServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_date' => ['sometimes', 'date'],
            'mileage' => ['sometimes', 'integer', 'min:0'],
            'cost' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'type' => ['sometimes', new Enum(VehicleServiceType::class)],

        ];
    }
}
