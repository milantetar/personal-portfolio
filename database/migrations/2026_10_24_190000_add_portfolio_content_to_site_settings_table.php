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
            $table->string('about_title')->default('About me')->after('hero_description');
            $table->text('about_description')->nullable()->after('about_title');
            $table->text('skills_content')->nullable()->after('about_description');
            $table->text('projects_content')->nullable()->after('skills_content');
            $table->text('experience_content')->nullable()->after('projects_content');
            $table->text('contact_content')->nullable()->after('experience_content');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table): void {
            $table->dropColumn([
                'about_title', 'about_description', 'skills_content',
                'projects_content', 'experience_content', 'contact_content',
            ]);
        });
    }
};
