<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $title
 * @property string $issuer
 * @property string|null $description
 * @property Carbon|null $issued_at
 * @property string|null $credential_url
 * @property int|null $media_id
 * @property int $sort_order
 * @property bool $is_visible
 * @property-read Media|null $media
 */
#[Fillable(['title', 'issuer', 'description', 'issued_at', 'credential_url', 'media_id', 'sort_order', 'is_visible'])]
class Certificate extends Model
{
    /** @use HasFactory<Factory<static>> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'issued_at' => 'date:Y-m-d',
            'media_id' => 'integer',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Media, $this>
     */
    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
