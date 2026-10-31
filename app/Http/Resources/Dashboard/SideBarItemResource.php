<?php

declare(strict_types=1);

namespace App\Http\Resources\Dashboard;

use App\Http\Resources\Media\MediaResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $label
 * @property int|null $icon_media_id
 * @property string $url
 * @property int $sort_order
 * @property bool $is_visible
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class SideBarItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'icon_media_id' => $this->icon_media_id,
            'icon_media' => MediaResource::make($this->whenLoaded('iconMedia')),
            'url' => $this->url,
            'sort_order' => $this->sort_order,
            'is_visible' => $this->is_visible,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
