<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string|null $tagline
 * @property string|null $description
 * @property string|null $challenge
 * @property string|null $solution
 * @property string|null $metrics
 * @property array<string>|null $tech_stack
 * @property string|null $live_url
 * @property string|null $github_url
 * @property int|null $thumbnail_media_id
 * @property array<int>|null $gallery_media_ids
 * @property bool $is_featured
 * @property bool $is_visible
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Media|null $thumbnailMedia
 */
#[Fillable([
    'title',
    'slug',
    'tagline',
    'description',
    'challenge',
    'solution',
    'metrics',
    'tech_stack',
    'live_url',
    'github_url',
    'thumbnail_media_id',
    'gallery_media_ids',
    'is_featured',
    'is_visible',
    'sort_order',
])]
class Project extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'tech_stack' => 'array',
            'gallery_media_ids' => 'array',
            'is_featured' => 'boolean',
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Project $project): void {
            if (empty($project->slug) && ! empty($project->title)) {
                $project->slug = Str::slug($project->title);
            }
        });
    }

    public function thumbnailMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'thumbnail_media_id');
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->latest('id');
    }
}
