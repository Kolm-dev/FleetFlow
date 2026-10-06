<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateClientRequest extends FormRequest
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

            'email' => ['sometimes', 'nullable', 'email'],
            'address' => ['sometimes', 'required', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],

            'phones' => ['sometimes', 'required', 'array', 'min:1'],
            'phones.*.phone_number' => ['required_with:phones', 'string'],
            'phones.*.label' => ['nullable', 'string'],

        ];
    }
}
