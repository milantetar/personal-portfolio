<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $title
 * @property string $slug
 * @property string|null $excerpt
 * @property string $content
 * @property int|null $cover_media_id
 * @property array<string>|null $tags
 * @property int $read_time_minutes
 * @property bool $is_published
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Media|null $coverMedia
 */
#[Fillable([
    'title',
    'slug',
    'excerpt',
    'content',
    'cover_media_id',
    'tags',
    'read_time_minutes',
    'is_published',
    'published_at',
])]
class Post extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'read_time_minutes' => 'integer',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Post $post): void {
            if (empty($post->slug) && ! empty($post->title)) {
                $post->slug = Str::slug($post->title);
            }
            if (empty($post->read_time_minutes)) {
                $wordCount = str_word_count(strip_tags($post->content ?? ''));
                $post->read_time_minutes = max(1, (int) ceil($wordCount / 200));
            }
        });

        static::updating(function (Post $post): void {
            if ($post->isDirty('content')) {
                $wordCount = str_word_count(strip_tags($post->content ?? ''));
                $post->read_time_minutes = max(1, (int) ceil($wordCount / 200));
            }
        });
    }

    /**
     * @return BelongsTo<Media, $this>
     */
    public function coverMedia(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_media_id');
    }

    /**
     * @param  Builder<Post>  $query
     * @return Builder<Post>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)->whereNotNull('published_at');
    }
}
