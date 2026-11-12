<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Site Settings
        DB::table('site_settings')->updateOrInsert(['id' => 1], [
            'site_name' => 'DEV PORTFOLIO',
            'hero_title' => 'Building Scalable Backend Systems & APIs.',
            'hero_subtitle' => 'PHP · Laravel · MySQL · REST APIs',
            'hero_description' => 'Backend developer specializing in robust API engineering, clean architecture, and database optimization.',
            'about_title' => 'About Me',
            'about_description' => 'Passionate software engineer focused on building efficient backend services and clean web applications.',
            'primary_cta_label' => 'Explore Projects',
            'primary_cta_url' => '#projects',
            'secondary_cta_label' => 'Get in Touch',
            'secondary_cta_url' => '#contact',
            'email' => 'developer@example.com',
            'github_url' => 'https://github.com/example/portfolio',
            'linkedin_url' => 'https://linkedin.com',
            'is_available' => 1,
            'theme_preset' => 'forest',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Seed Portfolio Sections (Hero, About, Skills, Experience, Contact, Education)
        DB::table('portfolio_sections')->insertOrIgnore([
            [
                'slug' => 'hero',
                'type' => 'hero',
                'title' => 'Building Scalable Backend Systems & APIs.',
                'eyebrow' => 'Full-Stack & Backend Engineer',
                'content' => json_encode([
                    'description' => 'Focused on clean code architecture and high-performance backend development.',
                    'primary_cta_url' => '#projects',
                    'primary_cta_label' => 'View Work',
                    'secondary_cta_url' => '#contact',
                    'secondary_cta_label' => 'Contact',
                ]),
                'sort_order' => 1,
                'is_visible' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'slug' => 'skills',
                'type' => 'skills',
                'title' => 'Technical Skills',
                'eyebrow' => '#skills',
                'content' => json_encode([
                    'body' => "Backend\nLaravel\nPHP\nNode.js\nREST APIs\n\nDatabases\nMySQL\nPostgreSQL\n\nFrontend\nReact\nTypeScript\nTailwind CSS",
                ]),
                'sort_order' => 2,
                'is_visible' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 3. Seed Generic Projects
        DB::table('projects')->insertOrIgnore([
            [
                'id' => 1,
                'title' => 'E-Commerce REST API Engine',
                'slug' => 'ecommerce-rest-api',
                'tagline' => 'High-throughput shopping cart & order processing backend.',
                'description' => 'Developed robust RESTful endpoints with authentication, rate limiting, and optimized Eloquent queries.',
                'tech_stack' => json_encode(['PHP', 'Laravel', 'MySQL', 'Redis']),
                'github_url' => 'https://github.com/example/ecommerce-api',
                'is_featured' => 1,
                'is_visible' => 1,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'title' => 'CNC G-Code Transformation Utility',
                'slug' => 'gcode-transformation-utility',
                'tagline' => 'Browser-based 3-axis to 4-axis pattern conversion tool.',
                'description' => 'Built an interactive manufacturing utility leveraging TypeScript and client-side computational geometry.',
                'tech_stack' => json_encode(['React', 'TypeScript', 'Tailwind CSS', 'Vite']),
                'github_url' => 'https://github.com/example/gcode-utility',
                'is_featured' => 1,
                'is_visible' => 1,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 4. Seed Certificates
        DB::table('certificates')->insertOrIgnore([
            [
                'id' => 1,
                'title' => 'Advanced Laravel Architecture',
                'issuer' => 'Global Tech Academy',
                'description' => 'Mastery in service containers, service providers, and package design patterns.',
                'sort_order' => 1,
                'is_visible' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'title' => 'AWS Cloud Practitioner Foundations',
                'issuer' => 'Amazon Web Services',
                'description' => 'Core cloud concepts, security, architecture, pricing, and support.',
                'sort_order' => 2,
                'is_visible' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 5. Seed Navigation Links
        DB::table('navbars')->updateOrInsert(['location' => 'homepage-header'], [
            'name' => 'Homepage Navbar',
            'brand_title' => 'DEV PORTFOLIO',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $navbarId = DB::table('navbars')->where('location', 'homepage-header')->value('id');

        DB::table('navbar_items')->insertOrIgnore([
            ['navbar_id' => $navbarId, 'label' => 'HOME', 'url' => '#hero', 'order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['navbar_id' => $navbarId, 'label' => 'ABOUT', 'url' => '#about', 'order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['navbar_id' => $navbarId, 'label' => 'PROJECTS', 'url' => '#projects', 'order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['navbar_id' => $navbarId, 'label' => 'CONTACT', 'url' => '#contact', 'order' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 6. Seed Generic Analytics Sample Data
        $devices = ['desktop', 'mobile'];
        $paths = ['/', '/about', '/projects', '/contact'];

        $analyticsData = [];
        for ($i = 1; $i <= 50; $i++) {
            $analyticsData[] = [
                'visitor_hash' => hash('sha256', 'mock-visitor-'.$i),
                'path' => $paths[array_rand($paths)],
                'referrer_host' => null,
                'device_type' => $devices[array_rand($devices)],
                'viewed_at' => Carbon::now()->subDays(rand(0, 5))->format('Y-m-d H:i:s'),
            ];
        }
        DB::table('analytics_visits')->insertOrIgnore($analyticsData);
    }
}
