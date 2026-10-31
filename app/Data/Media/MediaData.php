<?php

declare(strict_types=1);

namespace App\Data\Media;

use Illuminate\Http\UploadedFile;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Mimes;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class MediaData extends Data
{
    public function __construct(
        #[Required]
        #[Mimes('jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'ico', 'pdf', 'mp3')]
        #[Max(20480)] // Max size in kilobytes (20MB to support audio/PDFs)
        public UploadedFile $file,

        #[Max(255)]
        public ?string $alt_text = null,

        #[Max(255)]
        public ?string $title = null,

        public ?string $usage = 'none',
    ) {}
}
