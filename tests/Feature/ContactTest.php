<?php

declare(strict_types=1);

use App\Models\ContactMessage;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Mail;

it('stores a contact message', function (): void {
    Mail::fake();

    $this->from('/')
        ->post('/contact', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'subject' => 'Hello',
            'message' => 'I would like to work with you.',
        ])
        ->assertRedirect('/')
        ->assertSessionHas('success');

    $message = ContactMessage::query()->sole();

    expect($message->name)->toBe('Ada Lovelace')
        ->and($message->email)->toBe('ada@example.com')
        ->and($message->is_read)->toBeFalse();
});

it('silently accepts honeypot submissions without storing them', function (): void {
    $this->from('/')
        ->post('/contact', [
            'name' => 'Spam Bot',
            'email' => 'bot@example.com',
            'subject' => 'Buy now',
            'message' => 'Spam',
            'website' => 'https://spam.example.com',
        ])
        ->assertRedirect('/')
        ->assertSessionHas('success');

    expect(ContactMessage::query()->count())->toBe(0);
});

it('validates contact submissions', function (): void {
    $this->from('/')
        ->post('/contact', [])
        ->assertRedirect('/')
        ->assertSessionHasErrors(['name', 'email', 'subject', 'message']);

    expect(ContactMessage::query()->count())->toBe(0);
});

it('emails the site owner when an address is configured', function (): void {
    SiteSetting::query()->create(['site_name' => 'Milan Test', 'email' => 'owner@example.com']);

    $transport = Mail::getSymfonyTransport();

    $this->from('/')->post('/contact', [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'subject' => 'Hello',
        'message' => 'I would like to work with you.',
    ]);

    expect($transport->messages())->toHaveCount(1);
    expect($transport->messages()->first()->getOriginalMessage()->getTo()[0]->getAddress())->toBe('owner@example.com');
});

it('does not email anyone when no owner address is configured', function (): void {
    SiteSetting::query()->create(['site_name' => 'Milan Test', 'email' => null]);

    $transport = Mail::getSymfonyTransport();

    $this->from('/')->post('/contact', [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'subject' => 'Hello',
        'message' => 'I would like to work with you.',
    ]);

    expect($transport->messages())->toHaveCount(0);
});

it('throttles contact submissions', function (): void {
    Mail::fake();

    foreach (range(1, 5) as $attempt) {
        $this->post('/contact', [
            'name' => 'Ada Lovelace',
            'email' => 'ada@example.com',
            'subject' => 'Hello',
            'message' => 'Message number '.$attempt,
        ]);
    }

    $this->post('/contact', [
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'subject' => 'Hello',
        'message' => 'One too many.',
    ])->assertStatus(429);
});
