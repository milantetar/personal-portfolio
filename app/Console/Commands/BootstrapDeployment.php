<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\SiteSetting;
use App\Models\User;
use Database\Seeders\PortfolioSeeder;
use Database\Seeders\User\UserDataSeeder;
use Illuminate\Console\Command;

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
            $this->call('db:seed', ['--class' => PortfolioSeeder::class, '--force' => true]);
        }

        if (! User::query()->where('email_hash', hash('sha256', $email))->exists()) {
            $this->call('db:seed', ['--class' => UserDataSeeder::class, '--force' => true]);
        }

        return self::SUCCESS;
    }
}
