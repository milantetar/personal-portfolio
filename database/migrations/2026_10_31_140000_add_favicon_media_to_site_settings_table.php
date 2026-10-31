<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('site_settings') || Schema::hasColumn('site_settings', 'favicon_media_id')) {
            return;
        }

        Schema::table('site_settings', function (Blueprint $table): void {
            $table->foreignId('favicon_media_id')
                ->nullable()
                ->after('resume_media_id')
                ->constrained('media')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('site_settings') || ! Schema::hasColumn('site_settings', 'favicon_media_id')) {
            return;
        }

        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('favicon_media_id');
        });
    }
};
