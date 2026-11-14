<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Portfolio\PublicPortfolioSnapshot;
use Database\Seeders\PortfolioSeeder;
use Database\Seeders\PublicPortfolioSeeder;
use Database\Seeders\User\UserDataSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BootstrapDeployment extends Command
{
    protected $signature = 'portfolio:bootstrap-deployment';

    protected $description = 'Create missing starter content and the initial admin without resetting existing data';

    public function handle(): int
    {
        $email = strtolower(trim((string) config('admin.email', '')));
        if ($email === '' || (string) config('admin.password', '') === '') {
            $this->error('ADMIN_EMAIL and ADMIN_PASSWORD are required for deployment bootstrap.');

            return self::FAILURE;
        }

        if (! SiteSetting::query()->exists()) {
            $seeder = config('deployment-content.enabled') && is_file((string) config('deployment-content.path'))
                && in_array(DB::getDriverName(), ['sqlite', 'pgsql'], true)
                ? PublicPortfolioSeeder::class
                : PortfolioSeeder::class;
            if ($this->call('db:seed', ['--class' => $seeder, '--force' => true]) !== self::SUCCESS) {
                return self::FAILURE;
            }
        }

        if (config('deployment-content.enabled') && is_file((string) config('deployment-content.path'))) {
            app(PublicPortfolioSnapshot::class)->restoreBundledAssets((string) config('deployment-content.path'));
        }

        if (! User::query()->where('email_hash', hash('sha256', $email))->exists()) {
            $this->call('db:seed', ['--class' => UserDataSeeder::class, '--force' => true]);
        }

        return self::SUCCESS;
    }
}
