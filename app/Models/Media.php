<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $disk
 * @property string $path
 * @property string $original_name
 * @property string $mime_type
 * @property int $size
 * @property string|null $alt_text
 * @property string|null $title
 * @property int|null $uploaded_by
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string $url
 * @method static Builder|self filter(array $filters)
 */
#[Fillable([
    'disk',
    'path',
    'original_name',
    'mime_type',
    'size',
    'alt_text',
    'title',
    'uploaded_by',
])]
class Media extends Model
{
    use HasFactory;

    protected $appends = ['url'];
    
    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'uploaded_by' => 'integer',
        ];
    }

    protected function url(): Attribute
    {
        return Attribute::make(
            get: fn () => Storage::disk($this->disk)->url($this->path),
        )->shouldCache();
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Scope to filter media by search, mime_type, and size.
     * Note: Pagination is handled in the Repository, not here.
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        return $query
            ->when(
                !empty($filters['search']),
                fn (Builder $q) => $q->where(function (Builder $sub) use ($filters): void {
                    $sub->where('title', 'like', '%' . $filters['search'] . '%')
                        ->orWhere('original_name', 'like', '%' . $filters['search'] . '%');
                })
            )
            ->when(
                !empty($filters['mime_type']),
                fn (Builder $q) => $q->where('mime_type', 'like', '%' . $filters['mime_type'] . '%')
            )
            ->when(
                isset($filters['min_size']),
                fn (Builder $q) => $q->where('size', '>=', $filters['min_size'])
            )
            ->when(
                isset($filters['max_size']),
                fn (Builder $q) => $q->where('size', '<=', $filters['max_size'])
            );
    }
}