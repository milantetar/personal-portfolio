<?php

declare(strict_types=1);

use App\Models\Navbar;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

it('preserves existing content and administrator passwords during deployment bootstrap', function (): void {
    config(['admin.email' => 'admin@example.test', 'admin.password' => 'replacement-password']);
    SiteSetting::query()->create(['site_name' => 'My edited portfolio']);
    $user = User::factory()->create(['email' => 'admin@example.test', 'password' => 'original-password']);

    $this->artisan('portfolio:bootstrap-deployment')->assertSuccessful();

    expect(SiteSetting::query()->sole()->site_name)->toBe('My edited portfolio')
        ->and(Hash::check('original-password', $user->fresh()->password))->toBeTrue();
});

it('creates starter content and the administrator only once', function (): void {
    config(['admin.email' => 'admin@example.test', 'admin.password' => 'initial-password', 'deployment-content.enabled' => false]);

    $this->artisan('portfolio:bootstrap-deployment')->assertSuccessful();
    $this->artisan('portfolio:bootstrap-deployment')->assertSuccessful();

    expect(SiteSetting::query()->count())->toBe(1)
        ->and(User::query()->count())->toBe(1)
        ->and(User::query()->sole()->hasRole('admin'))->toBeTrue();

    $navbar = Navbar::query()->where('location', 'homepage-header')->sole();
    foreach (['HOME', 'ABOUT', 'PROJECTS', 'CONTACT'] as $label) {
        expect($navbar->items()->where('label', $label)->count())->toBe(1);
    }
});
