<?php

namespace App\Http\Requests;

use App\Enums\DriverStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDriverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $driverStatus = Rule::enum(DriverStatus::class);

        return [
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'status' => ['sometimes', $driverStatus],
        ];
    }
}
