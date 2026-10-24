<?php

declare(strict_types=1);

namespace App\Data\Dashboard;

use Spatie\LaravelData\Attributes\Validation\Exists;
use Spatie\LaravelData\Attributes\Validation\IntegerType;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class SidebarItemData extends Data
{
    public function __construct(
        #[Required, Max(255)]
        public string $label,

        #[IntegerType, Exists('media', 'id')]
        public ?int $icon_media_id,

        #[Required, Max(255)]
        public string $url,

        public int $sort_order = 0,

        public bool $is_visible = true,
    ) {}
}