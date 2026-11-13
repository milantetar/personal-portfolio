<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Services\Portfolio\PublicPortfolioSnapshot;
use Illuminate\Database\Seeder;

class PublicPortfolioSeeder extends Seeder
{
    public function run(PublicPortfolioSnapshot $snapshot): void
    {
        $snapshot->restore((string) config('deployment-content.path'));
        $this->command?->info('Public portfolio restored; analytics and runtime data were not imported.');
    }
}
