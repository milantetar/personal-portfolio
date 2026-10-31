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

        $homepage = Navbar::query()->where('location', 'homepage-header')->first();

        if (! $homepage) {
            return;
        }

        if ($homepage->items()->where('url', '#assistant')->exists()) {
            return;
        }

        $nextOrder = (int) $homepage->items()->max('order') + 1;

        $homepage->items()->create([
            'label' => 'ASK AI',
            'url' => '#assistant',
            'order' => $nextOrder,
        ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('navbar_items')) {
            return;
        }

        $homepage = Navbar::query()->where('location', 'homepage-header')->first();

        $homepage?->items()->where('url', '#assistant')->delete();
    }
};
