<?php

declare(strict_types=1);

namespace App\Data\Media;

use Illuminate\Http\UploadedFile;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Mimes;
use Spatie\LaravelData\Attributes\Validation\Nullable;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Data;

class MediaUpdateData extends Data
{
    public function __construct(
        #[Nullable]
        #[Mimes('jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'pdf', 'mp3')]
        #[Max(20480)]
        public ?UploadedFile $file = null,

        #[Max(255)]
        public ?string $alt_text = null,

        #[Max(255)]
        public ?string $title = null,

        #[In('none', 'logo', 'background', 'avatar')]
        public string $usage = 'none',
    ) {
    }
}
