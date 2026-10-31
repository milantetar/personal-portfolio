<?php

declare(strict_types=1);

use App\Models\PortfolioAssistantLog;
use Illuminate\Support\Facades\Http;

it('rejects assistant requests without a user message', function (): void {
    $this->postJson('/portfolio-assistant', [
        'messages' => [
            ['role' => 'assistant', 'content' => 'Hello, how can I help?'],
        ],
    ])->assertStatus(422);
});

it('validates assistant request payloads', function (): void {
    $this->postJson('/portfolio-assistant', ['messages' => []])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['messages']);
});

it('answers questions and records the conversation', function (): void {
    config([
        'services.gemini.api_key' => 'test-key',
        'services.gemini.model' => 'test-model',
        'services.gemini.fallback_model' => 'test-model',
    ]);

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                ['content' => ['parts' => [['text' => 'Milan builds Laravel applications.']]]],
            ],
        ]),
    ]);

    $this->postJson('/portfolio-assistant', [
        'messages' => [
            ['role' => 'user', 'content' => 'What does Milan do?'],
        ],
    ])
        ->assertOk()
        ->assertJson(['answer' => 'Milan builds Laravel applications.']);

    $log = PortfolioAssistantLog::query()->sole();

    expect($log->user_question)->toBe('What does Milan do?')
        ->and($log->status)->toBe('success');
});

it('reports that the assistant is not configured', function (): void {
    config(['services.gemini.api_key' => null]);

    $this->postJson('/portfolio-assistant', [
        'messages' => [
            ['role' => 'user', 'content' => 'Hello?'],
        ],
    ])->assertStatus(503);

    expect(PortfolioAssistantLog::query()->sole()->status)->toBe('error');
});

it('enforces the daily assistant limit', function (): void {
    config([
        'services.gemini.api_key' => 'test-key',
        'services.gemini.daily_limit' => 1,
        'services.gemini.model' => 'test-model',
        'services.gemini.fallback_model' => 'test-model',
    ]);

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                ['content' => ['parts' => [['text' => 'An answer.']]]],
            ],
        ]),
    ]);

    $payload = ['messages' => [['role' => 'user', 'content' => 'Hello?']]];

    $this->postJson('/portfolio-assistant', $payload)->assertOk();
    $this->postJson('/portfolio-assistant', $payload)->assertStatus(429);

    expect(PortfolioAssistantLog::query()->where('status', 'rate_limited')->count())->toBe(1);
});
