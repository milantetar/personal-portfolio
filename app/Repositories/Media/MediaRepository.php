<?php

declare(strict_types=1);

namespace App\Repositories\Media;

use App\Models\Media;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MediaRepository
{
    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, Media>
     */
    public function getAllMedia(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Media::query()->filter($filters);

        match ($filters['sort'] ?? 'latest') {
            'oldest' => $query->oldest(),
            'largest' => $query->orderByDesc('size'),
            default => $query->latest(),
        };

        return $query->paginate($perPage)->withQueryString();
    }

    public function getMediaById(int $id): ?Media
    {
        return Media::find($id);
    }
}
