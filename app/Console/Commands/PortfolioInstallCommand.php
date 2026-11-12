<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\SiteSetting;
use App\Models\User;
use Database\Seeders\PortfolioSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class PortfolioInstallCommand extends Command
{
    protected $signature = 'portfolio:install {--force : Overwrite existing starter data}';

    protected $description = 'Set up and configure the portfolio CMS for first-time use';

    public function handle(): int
    {
        $this->newLine();
        $this->info('=========================================');
        $this->info('  🚀 Personal Portfolio CMS Setup Wizard  ');
        $this->info('=========================================');
        $this->newLine();

        // 1. Ensure .env exists
        if (! File::exists(base_path('.env'))) {
            File::copy(base_path('.env.example'), base_path('.env'));
            $this->info('✓ Created .env file from .env.example.');
            $this->call('key:generate');
        }

        // 2. Prepare SQLite file if using SQLite
        if (config('database.default') === 'sqlite') {
            $sqlitePath = database_path('database.sqlite');
            if (! File::exists($sqlitePath)) {
                File::put($sqlitePath, '');
                $this->info('✓ Created SQLite database file.');
            }
        }

        // 3. Run database migrations
        $this->info('⏳ Running migrations...');
        $this->call('migrate', ['--force' => true]);

        // 4. Ensure storage link
        if (! File::exists(public_path('storage'))) {
            $this->call('storage:link');
        }

        // 5. Seed starter portfolio content
        $this->info('⏳ Seeding initial portfolio sections and settings...');
        $this->call('db:seed', ['--class' => PortfolioSeeder::class, '--force' => true]);

        // 6. Admin Account Setup
        $this->newLine();
        $this->info('👤 Set up your Admin Account:');

        $defaultEmail = config('admin.email') ?: 'admin@example.com';
        $defaultName = config('admin.name') ?: 'Portfolio Owner';

        if ($this->input->isInteractive()) {
            $name = $this->ask('Admin Name', $defaultName);
            $email = $this->ask('Admin Email', $defaultEmail);
            $password = $this->secret('Admin Password (min 8 characters)');

            while (blank($password) || strlen($password) < 8) {
                $this->error('Password must be at least 8 characters.');
                $password = $this->secret('Admin Password (min 8 characters)');
            }

            $githubUser = $this->ask('Your GitHub Username (optional for public repositories)');
            if (filled($githubUser)) {
                $setting = SiteSetting::query()->first();
                if ($setting) {
                    $setting->update([
                        'github_url' => 'https://github.com/'.trim($githubUser),
                    ]);
                    $this->info("✓ Linked GitHub profile: https://github.com/{$githubUser}");
                }
            }
        } else {
            $name = $defaultName;
            $email = $defaultEmail;
            $password = config('admin.password') ?: 'password';
        }

        $emailClean = strtolower(trim((string) $email));
        $role = Role::findOrCreate('admin', 'web');

        $user = User::query()->updateOrCreate(
            ['email_hash' => hash('sha256', $emailClean)],
            [
                'name' => $name,
                'email' => $emailClean,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ]
        );

        if (! $user->hasRole($role)) {
            $user->assignRole($role);
        }

        $this->info("✓ Admin account created for {$emailClean}.");
        $this->newLine();
        $this->info('=========================================');
        $this->info('  🎉 Installation Complete! Next steps:  ');
        $this->info('=========================================');
        $this->line('  1. Build assets:  pnpm build (or pnpm dev)');
        $this->line('  2. Start server:  php artisan serve');
        $this->line('  3. Log in to CMS: http://localhost:8000/dashboard');
        $this->line("     Email:         {$emailClean}");
        $this->newLine();

        return self::SUCCESS;
    }
}
