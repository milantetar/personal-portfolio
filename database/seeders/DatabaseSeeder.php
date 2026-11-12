<?php

declare(strict_types=1);

namespace Database\Seeders;

use Database\Seeders\User\UserDataSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with starter portfolio content and initial admin.
     */
    public function run(): void
    {
        $this->call([
            PortfolioSeeder::class,
            UserDataSeeder::class,
        ]);
    }
}
