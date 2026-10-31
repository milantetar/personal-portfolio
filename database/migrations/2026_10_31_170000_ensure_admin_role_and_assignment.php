<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        $role = Role::query()->firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web']
        );

        // Assign admin role to first user if one exists
        $user = User::query()->first();
        if ($user && ! $user->hasRole('admin')) {
            $user->assignRole($role);
        }
    }

    public function down(): void
    {
        // Keep role in place on rollback to avoid breaking permissions
    }
};
