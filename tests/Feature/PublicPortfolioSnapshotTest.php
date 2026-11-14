<?php

declare(strict_types=1);

use App\Models\AnalyticsVisit;
use App\Models\Media;
use App\Models\PortfolioSection;
use App\Models\Post;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Portfolio\PublicPortfolioSnapshot;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

it('restores the real deployment content and files without importing analytics or private runtime data', function (): void {
    Storage::fake('public');
    config(['admin.email' => 'deploy@example.test', 'admin.password' => 'deployment-password', 'deployment-content.enabled' => true]);
    $snapshot = json_decode(file_get_contents(config('deployment-content.path')), true, 512, JSON_THROW_ON_ERROR);

    $this->artisan('portfolio:bootstrap-deployment')->assertSuccessful();

    expect(SiteSetting::query()->sole()->site_name)->toBe($snapshot['tables']['site_settings'][0]['site_name']);
    foreach (['media', 'certificates', 'portfolio_sections', 'projects', 'posts'] as $table) {
        expect(DB::table($table)->count())->toBe(count($snapshot['tables'][$table]));
    }
    foreach ($snapshot['assets'] as $destination => $filename) {
        Storage::disk('public')->assertExists($destination);
        expect(hash('sha256', Storage::disk('public')->get($destination)))->toBe(pathinfo($filename, PATHINFO_FILENAME));
    }
    foreach (['analytics_visits', 'contact_messages', 'portfolio_assistant_logs', 'sessions', 'personal_access_tokens'] as $table) {
        expect(DB::table($table)->count())->toBe(0);
    }
    expect(User::query()->count())->toBe(1)
        ->and(User::query()->sole()->email)->toBe('deploy@example.test')
        ->and(Media::query()->whereNotNull('uploaded_by')->count())->toBe(0)
        ->and(DB::select('PRAGMA foreign_key_check'))->toBe([]);

    SiteSetting::query()->first()->update(['site_name' => 'Edited after deploy']);
    AnalyticsVisit::query()->create(['visitor_hash' => str_repeat('a', 64), 'path' => '/', 'device_type' => 'desktop', 'viewed_at' => now()]);
    $bundledFile = array_key_first($snapshot['assets']);
    Storage::disk('public')->delete($bundledFile);
    $this->artisan('portfolio:bootstrap-deployment')->assertSuccessful();
    expect(SiteSetting::query()->sole()->site_name)->toBe('Edited after deploy')
        ->and(AnalyticsVisit::query()->count())->toBe(1)
        ->and(User::query()->count())->toBe(1);
    Storage::disk('public')->assertExists($bundledFile);
    $navbar = DB::table('navbars')->where('location', 'homepage-header')->value('id');
    expect(DB::table('navbar_items')->where('navbar_id', $navbar)->count())->toBe(count($snapshot['tables']['navbar_items']));

    Http::fake();
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('home')
        ->where('settings.site_name', 'Edited after deploy')
        ->has('certificates', count($snapshot['tables']['certificates']))
        ->has('sections', count($snapshot['tables']['portfolio_sections'])));
});

it('exports visible content and referenced media while excluding private and unpublished records', function (): void {
    SiteSetting::query()->create(['site_name' => 'Public portfolio']);
    PortfolioSection::query()->create(['slug' => 'hidden', 'type' => 'custom', 'title' => 'Private section', 'is_visible' => false]);
    Post::query()->create(['title' => 'Private draft', 'content' => 'Do not publish', 'is_published' => false]);
    User::factory()->create(['email' => 'private-account@example.test']);
    Media::query()->create(['disk' => 'local', 'path' => 'private.txt', 'original_name' => 'private.txt', 'mime_type' => 'text/plain', 'size' => 12]);
    AnalyticsVisit::query()->create(['visitor_hash' => str_repeat('b', 64), 'path' => '/private-path', 'device_type' => 'desktop', 'viewed_at' => now()]);

    $snapshot = app(PublicPortfolioSnapshot::class)->export();
    expect(array_keys($snapshot['tables']))->not->toContain('users', 'analytics_visits', 'sessions', 'contact_messages')
        ->and($snapshot['tables']['posts'])->toBe([])
        ->and($snapshot['tables']['portfolio_sections'])->toBe([])
        ->and($snapshot['tables']['media'])->toBe([])
        ->and($snapshot['assets'])->toBe([])
        ->and(json_encode($snapshot))->not->toContain('private-account@example.test', 'Private draft', 'Private section', '/private-path')
        ->and(AnalyticsVisit::query()->count())->toBe(1);
});

it('rejects unexpected snapshot tables without writing data', function (): void {
    $snapshot = json_decode(file_get_contents(config('deployment-content.path')), true, 512, JSON_THROW_ON_ERROR);
    $snapshot['tables']['users'] = [['email' => 'injected@example.test']];
    $path = tempnam(sys_get_temp_dir(), 'portfolio-snapshot-');
    file_put_contents($path, json_encode($snapshot, JSON_THROW_ON_ERROR));
    try {
        expect(fn () => app(PublicPortfolioSnapshot::class)->restore($path))->toThrow(RuntimeException::class, 'Invalid public portfolio snapshot.');
        expect(SiteSetting::query()->count())->toBe(0);
    } finally {
        unlink($path);
    }
});

it('refuses to replace a partially populated portfolio', function (): void {
    Storage::fake('public');
    PortfolioSection::query()->create(['slug' => 'existing', 'type' => 'hero', 'title' => 'Keep this', 'is_visible' => true]);
    expect(fn () => app(PublicPortfolioSnapshot::class)->restore(config('deployment-content.path')))
        ->toThrow(RuntimeException::class, 'Refusing to replace existing portfolio content');
    expect(PortfolioSection::query()->sole()->title)->toBe('Keep this')
        ->and(SiteSetting::query()->count())->toBe(0)
        ->and(Media::query()->count())->toBe(0);
});

it('restores bundled files without reseeding edited database content', function (): void {
    Storage::fake('public');
    config(['admin.email' => 'deploy@example.test', 'admin.password' => 'deployment-password', 'deployment-content.enabled' => true]);
    $this->artisan('portfolio:bootstrap-deployment')->assertSuccessful();

    $settings = SiteSetting::query()->sole();
    $settings->update(['site_name' => 'Edited on Neon']);
    $snapshot = json_decode(file_get_contents(config('deployment-content.path')), true, 512, JSON_THROW_ON_ERROR);
    $asset = array_key_first($snapshot['assets']);
    Storage::disk('public')->delete($asset);

    $this->artisan('portfolio:restore-deployment-assets')->assertSuccessful();

    Storage::disk('public')->assertExists($asset);
    expect(SiteSetting::query()->sole()->site_name)->toBe('Edited on Neon');
});

it('refuses file-only startup when portfolio content is missing', function (): void {
    config(['deployment-content.enabled' => true]);

    $this->artisan('portfolio:restore-deployment-assets')->assertFailed();
    expect(SiteSetting::query()->count())->toBe(0);
});
