<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_sections', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->string('type', 40)->default('custom');
            $table->string('title')->nullable();
            $table->string('eyebrow')->nullable();
            $table->json('content')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();
            $table->index(['is_visible', 'sort_order']);
        });

        $settings = DB::table('site_settings')->first();

        if (! $settings) {
            return;
        }

        $sections = [
            [
                'slug' => 'hero',
                'type' => 'hero',
                'title' => $settings->hero_title,
                'eyebrow' => $settings->hero_subtitle,
                'content' => json_encode([
                    'description' => $settings->hero_description,
                    'primary_cta_label' => $settings->primary_cta_label,
                    'primary_cta_url' => $settings->primary_cta_url,
                    'secondary_cta_label' => $settings->secondary_cta_label,
                    'secondary_cta_url' => $settings->secondary_cta_url,
                ]),
                'sort_order' => 10,
            ],
            [
                'slug' => 'about',
                'type' => 'about',
                'title' => $settings->about_title,
                'eyebrow' => '#about',
                'content' => json_encode(['description' => $settings->about_description]),
                'sort_order' => 20,
            ],
            [
                'slug' => 'skills',
                'type' => 'skills',
                'title' => 'Technical toolkit',
                'eyebrow' => '#skills',
                'content' => json_encode(['body' => $settings->skills_content]),
                'sort_order' => 30,
            ],
            [
                'slug' => 'experience',
                'type' => 'experience',
                'title' => 'Journey',
                'eyebrow' => '#experience',
                'content' => json_encode(['body' => $settings->experience_content]),
                'sort_order' => 40,
            ],
            [
                'slug' => 'projects',
                'type' => 'projects',
                'title' => 'Selected work',
                'eyebrow' => '#projects',
                'content' => json_encode(['body' => $settings->projects_content]),
                'sort_order' => 50,
            ],
            [
                'slug' => 'certifications',
                'type' => 'certifications',
                'title' => 'Certificates & achievements',
                'eyebrow' => '#certificates',
                'content' => json_encode([]),
                'sort_order' => 60,
            ],
            [
                'slug' => 'contact',
                'type' => 'contact',
                'title' => 'Get in touch',
                'eyebrow' => '#contact',
                'content' => json_encode(['body' => $settings->contact_content]),
                'sort_order' => 70,
            ],
        ];

        $now = now();
        DB::table('portfolio_sections')->insert(array_map(
            static fn (array $section): array => $section + ['created_at' => $now, 'updated_at' => $now],
            $sections,
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_sections');
    }
};
