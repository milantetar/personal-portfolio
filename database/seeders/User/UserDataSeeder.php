<?php

declare(strict_types=1);

namespace Database\Seeders\User;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create or update your primary admin user securely using the email hash lookup
        User::firstOrCreate(
            ['email_hash' => hash('sha256', strtolower(trim('yourmail@gmail.com')))],
            [
                'name' => 'yourmail',
                'email' => 'yourmail@gmail.com', // Securely encrypted at rest via model cast
                'password' => 'your_passsword',      // Securely hashed via model cast ('password' => 'hashed')
                'email_verified_at' => now(),
                'roles' => ['admin'], // Assign roles if using Spatie's package
            ]
        );
    }
}