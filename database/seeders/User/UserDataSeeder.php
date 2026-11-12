<?php

declare(strict_types=1);

namespace Database\Seeders\User;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class UserDataSeeder extends Seeder
{
    /**
     * Create the initial admin user from environment variables.
     *
     * Run with:
     *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' php artisan db:seed --class=UserDataSeeder
     */
    public function run(): void
    {
        $email = strtolower(trim((string) config('admin.email', '')));
        $password = (string) config('admin.password', '');

        if ($email === '' || $password === '') {
            $this->command->warn('ADMIN_EMAIL and ADMIN_PASSWORD are required; skipping the admin seeder.');
            Log::notice('Admin seeder skipped because ADMIN_EMAIL or ADMIN_PASSWORD is not configured.');

            return;
        }

        $role = Role::findOrCreate('admin', 'web');

        $user = User::query()->updateOrCreate(
            ['email_hash' => hash('sha256', $email)],
            [
                'name' => (string) config('admin.name', 'Portfolio Admin'),
                'email' => $email,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ],
        );

        if (! $user->hasRole($role)) {
            $user->assignRole($role);
        }

        $this->command->info("Admin user ready for {$email}.");
    }
}
