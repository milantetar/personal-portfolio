<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('navbars') || Schema::hasColumn('navbars', 'brand_title')) {
            return;
        }

        Schema::table('navbars', function (Blueprint $table): void {
            $table->string('brand_title', 100)->nullable();
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('navbars') && Schema::hasColumn('navbars', 'brand_title')) {
            Schema::table('navbars', function (Blueprint $table): void {
                $table->dropColumn('brand_title');
            });
        }
    }
};
