<?php

namespace App\Http\Requests;

use App\Enums\ClientType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
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
            'type' => ['required', Rule::enum(ClientType::class)],
            'name' => ['required', 'string'],
            'email' => ['nullable', 'email'],
            'address' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'phones' => ['required', 'array', 'min:1'],
            'phones.*.phone_number' => ['required', 'string'],
            'phones.*.label' => ['nullable', 'string'],
        ];
    }
}
