<?php

declare(strict_types=1);

use App\Models\Certificate;
use App\Models\Post;
use App\Models\Project;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    Http::fake();
});

it('renders the homepage with the first visible section', function (): void {
    SiteSetting::query()->create(['site_name' => 'Milan Test']);
    makePortfolioSection();
    makePortfolioSection(['slug' => 'about', 'type' => 'about', 'title' => 'About', 'sort_order' => 2]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('activeSectionSlug', 'hero')
            ->where('settings.site_name', 'Milan Test')
            ->has('sections', 2));
});

it('renders an empty portfolio when no sections are visible', function (): void {
    makePortfolioSection(['is_visible' => false]);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('activeSectionSlug', '')
            ->has('sections', 0));
});

it('serves a visible section by slug', function (): void {
    makePortfolioSection(['slug' => 'about', 'type' => 'about', 'title' => 'About']);

    $this->get('/about')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('activeSectionSlug', 'about'));
});

it('hides invisible sections and unknown slugs', function (): void {
    makePortfolioSection(['slug' => 'secret', 'type' => 'custom', 'is_visible' => false]);

    $this->get('/secret')->assertNotFound();
    $this->get('/missing-section')->assertNotFound();
});

it('serves the assistant page', function (): void {
    $this->get('/assistant')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('home')
            ->where('activeSectionSlug', 'assistant'));
});

it('only shares visible certificates, projects, and published posts', function (): void {
    Certificate::query()->create(['title' => 'Visible cert', 'issuer' => 'Issuer', 'sort_order' => 1, 'is_visible' => true]);
    Certificate::query()->create(['title' => 'Hidden cert', 'issuer' => 'Issuer', 'sort_order' => 2, 'is_visible' => false]);

    Project::query()->create(['title' => 'Visible project', 'slug' => 'visible-project', 'is_visible' => true, 'sort_order' => 1]);
    Project::query()->create(['title' => 'Hidden project', 'slug' => 'hidden-project', 'is_visible' => false, 'sort_order' => 2]);

    Post::query()->create([
        'title' => 'Published post',
        'slug' => 'published-post',
        'content' => 'Some content',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);
    Post::query()->create([
        'title' => 'Draft post',
        'slug' => 'draft-post',
        'content' => 'Some content',
        'is_published' => false,
    ]);

    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->has('certificates', 1)
        ->where('certificates.0.title', 'Visible cert')
        ->has('customProjects', 1)
        ->where('customProjects.0.title', 'Visible project')
        ->has('recentPosts', 1)
        ->where('recentPosts.0.title', 'Published post'));
});

it('publishes a sitemap for the homepage, visible sections, and published posts', function (): void {
    makePortfolioSection();
    makePortfolioSection(['slug' => 'about', 'type' => 'about', 'is_visible' => true]);
    makePortfolioSection(['slug' => 'hidden', 'type' => 'custom', 'is_visible' => false]);

    Post::query()->create([
        'title' => 'Published post',
        'slug' => 'published-post',
        'content' => 'Some content',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);
    Post::query()->create([
        'title' => 'Draft post',
        'slug' => 'draft-post',
        'content' => 'Some content',
        'is_published' => false,
    ]);

    $response = $this->get('/sitemap.xml');

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee(route('home'), false)
        ->assertSee(route('portfolio.section', 'about'), false)
        ->assertDontSee(route('portfolio.section', 'hero'), false)
        ->assertSee(route('blog.show', 'published-post'), false)
        ->assertDontSee(route('portfolio.section', 'hidden'), false)
        ->assertDontSee(route('blog.show', 'draft-post'), false);
});

it('serves robots.txt pointing at the sitemap and blocking the dashboard', function (): void {
    $this->get('/robots.txt')
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('User-agent: *', false)
        ->assertSee('Disallow: /dashboard', false)
        ->assertSee('Sitemap: '.url('/sitemap.xml'), false);
});

it('only lists published posts in the public blog', function (): void {
    Post::query()->create([
        'title' => 'Published post',
        'slug' => 'published-post',
        'content' => 'Some content',
        'is_published' => true,
        'published_at' => now()->subDay(),
    ]);
    Post::query()->create([
        'title' => 'Draft post',
        'slug' => 'draft-post',
        'content' => 'Some content',
        'is_published' => false,
    ]);

    $this->get('/blog')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.slug', 'published-post'));

    $this->get('/blog/published-post')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('blog/show')
            ->where('post.slug', 'published-post'));

    $this->get('/blog/draft-post')->assertNotFound();
});
