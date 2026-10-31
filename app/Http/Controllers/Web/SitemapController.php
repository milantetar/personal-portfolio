<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\PortfolioSection;
use App\Models\Post;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $siteUrl = rtrim((string) config('app.url'), '/');
        $urls = [
            ['loc' => $siteUrl.route('home', [], false), 'lastmod' => null, 'changefreq' => 'weekly', 'priority' => '1.0'],
        ];

        PortfolioSection::query()
            ->visible()
            ->ordered()
            ->where('type', '!=', 'hero')
            ->whereNotIn('slug', ['hero', 'assistant', 'blog'])
            ->get(['slug', 'updated_at'])
            ->each(function (PortfolioSection $section) use (&$urls, $siteUrl): void {
                $urls[] = [
                    'loc' => $siteUrl.route('portfolio.section', $section->slug, false),
                    'lastmod' => $section->updated_at?->toAtomString(),
                    'changefreq' => 'monthly',
                    'priority' => '0.8',
                ];
            });

        $urls[] = [
            'loc' => $siteUrl.route('blog.index', [], false),
            'lastmod' => null,
            'changefreq' => 'weekly',
            'priority' => '0.7',
        ];

        Post::query()
            ->published()
            ->latest('published_at')
            ->get(['slug', 'updated_at'])
            ->each(function (Post $post) use (&$urls, $siteUrl): void {
                $urls[] = [
                    'loc' => $siteUrl.route('blog.show', $post->slug, false),
                    'lastmod' => $post->updated_at?->toAtomString(),
                    'changefreq' => 'yearly',
                    'priority' => '0.6',
                ];
            });

        $urls[] = [
            'loc' => $siteUrl.route('portfolio.assistant', [], false),
            'lastmod' => null,
            'changefreq' => 'monthly',
            'priority' => '0.5',
        ];

        return response()
            ->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Allow: /',
            'Disallow: /dashboard',
            'Disallow: /login',
            'Disallow: /forgot-password',
            'Disallow: /reset-password',
            '',
            'Sitemap: '.rtrim((string) config('app.url'), '/').route('sitemap', [], false),
        ];

        return response(implode("\n", $lines)."\n", 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }
}
