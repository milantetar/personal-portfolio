<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SiteSettingsUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'site_name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'is_available' => ['boolean'],
            'theme_preset' => ['required', 'string', 'in:instagram,ocean,midnight,forest'],
            'glass_blur' => ['required', 'string', 'in:none,sm,md,lg,xl'],
            'glass_opacity' => ['required', 'string', 'in:25,50,75,90'],
            'settings_icon_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'resume_media_id' => ['nullable', 'integer', 'exists:media,id'],
        ];
    }
}
