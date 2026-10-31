<?php

declare(strict_types=1);

use App\Models\Certificate;
use App\Models\Navbar;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

it('ships an ASK AI homepage navigation item', function (): void {
    $homepage = Navbar::query()->where('location', 'homepage-header')->sole();
    $assistantItem = $homepage->items()->where('url', '#assistant')->sole();

    expect($assistantItem->label)->toBe('ASK AI');
});

it('shares the homepage navigation with the assistant link', function (): void {
    Http::fake();

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('navBars', 2)
            ->where('navBars', fn ($navbars) => collect($navbars)->contains(
                fn (array $navbar): bool => collect($navbar['items'])->contains(
                    fn (array $item): bool => $item['url'] === '#assistant',
                ),
            )));
});

it('renders the certificate dashboard for admins', function (): void {
    $this->actingAs(adminUser())
        ->get('/dashboard/certificates')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/certificates'));
});

it('creates a certificate from the dashboard', function (): void {
    $this->actingAs(adminUser())
        ->post('/dashboard/certificates', [
            'title' => 'AWS Cloud Practitioner',
            'issuer' => 'Amazon Web Services',
            'description' => 'Foundational cloud certification.',
            'sort_order' => 1,
            'is_visible' => true,
        ])
        ->assertRedirect(route('certificates.index'));

    $certificate = Certificate::query()->sole();

    expect($certificate->title)->toBe('AWS Cloud Practitioner')
        ->and($certificate->is_visible)->toBeTrue();
});
