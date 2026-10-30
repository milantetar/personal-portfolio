<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'site_name',
    'logo_media_id',
    'background_media_id',
    'avatar_media_id',
    'resume_media_id',
    'theme_preset',
    'glass_blur',
    'glass_opacity',
    'hero_title',
    'hero_subtitle',
    'hero_description',
    'about_title',
    'about_description',
    'skills_content',
    'projects_content',
    'experience_content',
    'contact_content',
    'primary_cta_label',
    'primary_cta_url',
    'secondary_cta_label',
    'secondary_cta_url',
    'email',
    'github_url',
    'linkedin_url',
    'is_available',
])]
class SiteSetting extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'logo_media_id' => 'integer',
            'background_media_id' => 'integer',
            'avatar_media_id' => 'integer',
            'resume_media_id' => 'integer',
            'is_available' => 'boolean',
        ];
    }

    public function logoMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'logo_media_id');
    }

    public function backgroundMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'background_media_id');
    }

    public function avatarMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'avatar_media_id');
    }

    public function resumeMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'resume_media_id');
    }
}
