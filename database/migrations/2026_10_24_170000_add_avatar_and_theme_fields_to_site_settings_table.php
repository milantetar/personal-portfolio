<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            if (! Schema::hasColumn('site_settings', 'avatar_media_id')) {
                $table->foreignId('avatar_media_id')->nullable()->after('background_media_id')->constrained('media')->nullOnDelete();
            }
            if (! Schema::hasColumn('site_settings', 'theme_preset')) {
                $table->string('theme_preset')->nullable()->default('instagram')->after('avatar_media_id');
            }
            if (! Schema::hasColumn('site_settings', 'glass_blur')) {
                $table->string('glass_blur')->default('xl')->after('theme_preset');
            }
            if (! Schema::hasColumn('site_settings', 'glass_opacity')) {
                $table->string('glass_opacity')->default('75')->after('glass_blur');
            }
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            if (Schema::hasColumn('site_settings', 'avatar_media_id')) {
                $table->dropForeign(['avatar_media_id']);
                $table->dropColumn('avatar_media_id');
            }
            $columnsToDrop = array_filter(
                ['theme_preset', 'glass_blur', 'glass_opacity'],
                fn (string $col) => Schema::hasColumn('site_settings', $col)
            );
            if ($columnsToDrop !== []) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};

