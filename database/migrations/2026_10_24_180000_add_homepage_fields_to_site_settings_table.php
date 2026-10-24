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
            $table->string('hero_title')->nullable()->after('site_name');
            $table->string('hero_subtitle')->nullable()->after('hero_title');
            $table->text('hero_description')->nullable()->after('hero_subtitle');
            $table->string('primary_cta_label')->default('View my work')->after('hero_description');
            $table->string('primary_cta_url')->default('#projects')->after('primary_cta_label');
            $table->string('secondary_cta_label')->default('Contact me')->after('primary_cta_url');
            $table->string('secondary_cta_url')->default('#contact')->after('secondary_cta_label');
            $table->string('email')->nullable()->after('secondary_cta_url');
            $table->string('github_url')->nullable()->after('email');
            $table->string('linkedin_url')->nullable()->after('github_url');
            $table->boolean('is_available')->default(true)->after('linkedin_url');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'hero_title', 'hero_subtitle', 'hero_description',
                'primary_cta_label', 'primary_cta_url',
                'secondary_cta_label', 'secondary_cta_url', 'email',
                'github_url', 'linkedin_url', 'is_available',
            ]);
        });
    }
};
