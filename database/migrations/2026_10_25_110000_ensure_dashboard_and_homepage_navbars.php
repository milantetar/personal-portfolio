<?php

declare(strict_types=1);

use App\Models\Navbar;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('navbars') || ! Schema::hasTable('navbar_items')) {
            return;
        }

        $dashboard = Navbar::query()->updateOrCreate(
            ['location' => 'dashboard-header'],
            ['name' => 'Dashboard Navbar'],
        );
        $homepage = Navbar::query()->updateOrCreate(
            ['location' => 'homepage-header'],
            ['name' => 'Homepage Navbar'],
        );

        $dashboardItems = [
            ['label' => 'Home', 'url' => '/', 'order' => 1],
        ];
        $homepageItems = [
            ['label' => 'HOME', 'url' => '#hero', 'order' => 1],
            ['label' => 'ABOUT', 'url' => '#about', 'order' => 2],
            ['label' => 'SKILLS', 'url' => '#skills', 'order' => 3],
            ['label' => 'PROJECTS', 'url' => '#projects', 'order' => 4],
            ['label' => 'CERTIFICATES', 'url' => '#certifications', 'order' => 5],
            ['label' => 'CONTACT', 'url' => '#contact', 'order' => 6],
        ];

        foreach ($dashboardItems as $item) {
            $dashboard->items()->updateOrCreate(['label' => $item['label']], $item);
        }
        foreach ($homepageItems as $item) {
            $homepage->items()->updateOrCreate(['label' => $item['label']], $item);
        }
    }

    public function down(): void
    {
        Navbar::query()->whereIn('location', ['dashboard-header', 'homepage-header'])->delete();
    }
};
