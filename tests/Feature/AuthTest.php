<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

it('logs in with a valid email and password', function (): void {
    $user = User::factory()->create(['email' => 'admin@example.com']);

    $this->post('/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));

    $this->assertAuthenticatedAs($user);
});

it('keeps the login response generic for unknown emails and bad passwords', function (): void {
    User::factory()->create(['email' => 'admin@example.com']);

    $this->from('/login')
        ->post('/login', ['email' => 'missing@example.com', 'password' => 'password'])
        ->assertRedirect('/login')
        ->assertSessionHasErrors(['email' => 'These credentials do not match our records.']);

    $this->from('/login')
        ->post('/login', ['email' => 'admin@example.com', 'password' => 'incorrect'])
        ->assertRedirect('/login')
        ->assertSessionHasErrors(['email' => 'These credentials do not match our records.']);

    $this->assertGuest();
});

it('throttles repeated login attempts', function (): void {
    foreach (range(1, 5) as $attempt) {
        $this->post('/login', ['email' => 'admin@example.com', 'password' => 'incorrect']);
    }

    $this->post('/login', ['email' => 'admin@example.com', 'password' => 'incorrect'])
        ->assertStatus(429);
});

it('redirects guests away from the dashboard', function (): void {
    $this->get('/dashboard')->assertRedirect('/login');
});

it('denies dashboard access until an admin role is explicitly assigned', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/dashboard')->assertForbidden();
});

it('denies dashboard access once an admin role is assigned elsewhere', function (): void {
    adminUser();
    $user = User::factory()->create();

    $this->actingAs($user)->get('/dashboard')->assertForbidden();
});

it('allows admins into the dashboard', function (): void {
    $admin = adminUser();

    $this->actingAs($admin)->get('/dashboard')->assertOk();
    $this->actingAs($admin)->get('/dashboard/messages')->assertOk();
});

it('sends a password reset link for registered emails', function (): void {
    Notification::fake();

    $user = User::factory()->create(['email' => 'admin@example.com']);

    $this->from('/forgot-password')
        ->post('/forgot-password', ['email' => 'admin@example.com'])
        ->assertRedirect('/forgot-password')
        ->assertSessionHas('success');

    Notification::assertSentTo($user, ResetPassword::class);
});

it('resets a password with a valid token', function (): void {
    $user = User::factory()->create(['email' => 'admin@example.com']);
    $token = Password::broker()->createToken($user);

    $this->post('/reset-password', [
        'token' => $token,
        'email' => 'admin@example.com',
        'password' => 'new-password-123',
        'password_confirmation' => 'new-password-123',
    ])->assertRedirect(route('login'));

    expect(Hash::check('new-password-123', $user->fresh()->password))->toBeTrue();
});

it('rejects password resets with invalid tokens', function (): void {
    User::factory()->create(['email' => 'admin@example.com']);

    $this->from('/reset-password/invalid')
        ->post('/reset-password', [
            'token' => 'invalid-token',
            'email' => 'admin@example.com',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertRedirect('/reset-password/invalid')
        ->assertSessionHasErrors('email');
});

it('changes the password of the signed-in user', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put('/password', [
            'current_password' => 'password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertSessionHasNoErrors();

    expect(Hash::check('new-password-123', $user->fresh()->password))->toBeTrue();
});

it('requires the current password to change it', function (): void {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put('/password', [
            'current_password' => 'incorrect',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])
        ->assertSessionHasErrors('current_password');

    expect(Hash::check('password', $user->fresh()->password))->toBeTrue();
});
