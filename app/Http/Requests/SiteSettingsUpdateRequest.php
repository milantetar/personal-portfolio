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
            'hero_title' => ['nullable', 'string', 'max:150'],
            'hero_subtitle' => ['nullable', 'string', 'max:255'],
            'hero_description' => ['nullable', 'string', 'max:2000'],
            'about_title' => ['required', 'string', 'max:100'],
            'about_description' => ['nullable', 'string', 'max:5000'],
            'skills_content' => ['nullable', 'string', 'max:5000'],
            'projects_content' => ['nullable', 'string', 'max:5000'],
            'experience_content' => ['nullable', 'string', 'max:5000'],
            'contact_content' => ['nullable', 'string', 'max:5000'],
            'primary_cta_label' => ['required', 'string', 'max:50'],
            'primary_cta_url' => ['required', 'string', 'max:255'],
            'secondary_cta_label' => ['required', 'string', 'max:50'],
            'secondary_cta_url' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'is_available' => ['boolean'],
            'theme_preset' => ['required', 'string', 'in:instagram,ocean,midnight,forest'],
            'glass_blur' => ['required', 'string', 'in:none,sm,md,lg,xl'],
            'glass_opacity' => ['required', 'string', 'in:25,50,75,90'],
            'settings_icon_media_id' => ['nullable', 'integer', 'exists:media,id'],
        ];
    }
}
