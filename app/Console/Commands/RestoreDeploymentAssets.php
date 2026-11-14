<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\SiteSetting;
use App\Services\Portfolio\PublicPortfolioSnapshot;
use Illuminate\Console\Command;

class RestoreDeploymentAssets extends Command
{
    protected $signature = 'portfolio:restore-deployment-assets';

    protected $description = 'Restore bundled public files without changing portfolio database records';

    public function handle(PublicPortfolioSnapshot $snapshot): int
    {
        if (! SiteSetting::query()->exists()) {
            $this->error('Portfolio content is missing. Enable SEED_ON_DEPLOY for the first deployment.');

            return self::FAILURE;
        }

        if (config('deployment-content.enabled') && is_file((string) config('deployment-content.path'))) {
            $snapshot->restoreBundledAssets((string) config('deployment-content.path'));
        }

        return self::SUCCESS;
    }
}
