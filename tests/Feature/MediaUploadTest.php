<?php

declare(strict_types=1);

use App\Models\Media;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('rejects SVG uploads', function (): void {
    Storage::fake('public');

    $this->actingAs(adminUser())
        ->postJson('/dashboard/media', [
            'file' => UploadedFile::fake()->create('icon.svg', 10, 'image/svg+xml'),
        ])
        ->assertUnprocessable();

    expect(Media::query()->count())->toBe(0);
});

it('stores supported image uploads', function (): void {
    Storage::fake('public');

    $this->actingAs(adminUser())
        ->postJson('/dashboard/media', [
            'file' => UploadedFile::fake()->image('photo.png', 32, 32),
            'title' => 'Profile photo',
        ])
        ->assertCreated();

    $media = Media::query()->sole();

    expect($media->title)->toBe('Profile photo')
        ->and($media->mime_type)->toStartWith('image/png');

    Storage::disk('public')->assertExists($media->path);
});

it('requires authentication to upload media', function (): void {
    Storage::fake('public');

    $this->postJson('/dashboard/media', [
        'file' => UploadedFile::fake()->image('photo.png'),
    ])->assertUnauthorized();
});
