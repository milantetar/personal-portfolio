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
    $email = $transport->messages()->first()->getOriginalMessage();
    expect($email->getTo()[0]->getAddress())->toBe('owner@example.com')
        ->and($email->getReplyTo()[0]->getAddress())->toBe('ada@example.com')
        ->and($email->getHtmlBody())->toContain('Milan Test', 'Ada Lovelace', 'I would like to work with you.', 'Reply to message', 'mailto:ada@example.com?subject=Re%3A%20Hello')
        ->and($email->getTextBody())->toContain('Ada Lovelace', 'I would like to work with you.');
});

it('escapes visitor content in HTML emails while preserving message line breaks', function (): void {
    SiteSetting::query()->create(['site_name' => 'Portfolio', 'email' => 'owner@example.com']);
    $transport = Mail::getSymfonyTransport();
    $body = "First line\n<script>alert('unsafe')</script>\nLast line";

    $this->from('/')->post('/contact', [
        'name' => '<b>Ada</b>',
        'email' => 'ada@example.com',
        'subject' => '<img src=x onerror=alert(1)>',
        'message' => $body,
    ])->assertRedirect('/');

    $email = $transport->messages()->sole()->getOriginalMessage();
    expect($email->getHtmlBody())->toContain('&lt;b&gt;Ada&lt;/b&gt;', '&lt;img src=x onerror=alert(1)&gt;', '&lt;script&gt;', "First line<br />\n")
        ->not->toContain('<script>', '<img src=x', '<b>Ada</b>')
        ->and($email->getTextBody())->toContain($body);
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
