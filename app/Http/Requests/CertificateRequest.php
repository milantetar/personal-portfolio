<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CertificateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'issuer' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:3000'],
            'issued_at' => ['nullable', 'date'],
            'credential_url' => ['nullable', 'url', 'max:500'],
            'media_id' => ['nullable', 'integer', 'exists:media,id'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:9999'],
            'is_visible' => ['boolean'],
        ];
    }
}
