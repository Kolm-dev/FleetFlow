<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;
use Override;

class StoreTripAttachmentRequest extends FormRequest
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
            'files' => ['required', 'array', 'max:5'],
            'files.*' => [
                'required',
                File::types(['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'])->max('10mb')
            ],
        ];
    }

    #[Override]
    public function messages()
    {
        return [
            'files.required' => 'At least one file must be attached.',
            'files.array' => 'Files must be provided as a list.',
            'files.max' => 'No more than 5 files can be attached.',
            'files.*.required' => 'The file cannot be empty.',
            'files.*.file' => 'Each item must be a file.',
            'files.*.mimes' => 'Invalid file format. Allowed: jpg, jpeg, png, webp, pdf, doc, docx, xls, xlsx, txt, csv.',
            'files.*.max' => 'The file size must not exceed 10 MB.',
        ];
    }
}
