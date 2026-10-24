<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'issuer', 'description', 'issued_at', 'credential_url', 'media_id', 'sort_order', 'is_visible'])]
class Certificate extends Model
{
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

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
