<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

class GrantAdminRole extends Command
{
    protected $signature = 'portfolio:grant-admin {email : Email address of the existing user}';

    protected $description = 'Grant the admin role to an existing portfolio user';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        $user = User::query()
            ->where('email_hash', hash('sha256', $email))
            ->first();

        if (! $user) {
            $this->error("No user found for {$email}.");

            return self::FAILURE;
        }

        $role = Role::findOrCreate('admin', 'web');

        if (! $user->hasRole($role)) {
            $user->assignRole($role);
        }

        $this->info("Granted the admin role to {$email}.");

        return self::SUCCESS;
    }
}
