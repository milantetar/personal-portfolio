<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class AnalyticsVisit extends Model
{
    use Prunable;

    public $timestamps = false;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['viewed_at' => 'immutable_datetime'];
    }

    public function prunable(): Builder
    {
        return static::query()->where('viewed_at', '<', now()->subDays(90));
    }
}
