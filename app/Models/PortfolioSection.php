<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['slug', 'type', 'title', 'eyebrow', 'content', 'sort_order', 'is_visible'])]
class PortfolioSection extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ];
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_visible', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('id');
    }
}
