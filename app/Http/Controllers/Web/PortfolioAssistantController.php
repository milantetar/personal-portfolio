<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\PortfolioAssistantRequest;
use App\Models\PortfolioAssistantLog;
use App\Services\Portfolio\PortfolioAssistantException;
use App\Services\Portfolio\PortfolioAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;

class PortfolioAssistantController extends Controller
{
    public function store(PortfolioAssistantRequest $request, PortfolioAssistantService $assistant): JsonResponse
    {
        $messages = $request->validated('messages');
        $latestMessage = end($messages);

        if (! is_array($latestMessage) || ($latestMessage['role'] ?? null) !== 'user') {
            return response()->json(['message' => 'Send a question to continue.'], 422);
        }

        $userQuestion = trim((string) ($latestMessage['content'] ?? ''));
        $ipHash = hash('sha256', $request->ip() ?? 'unknown');
        $dailyKey = 'portfolio-assistant:daily:'.$ipHash;
        $dailyLimit = max(1, (int) config('services.gemini.daily_limit', 60));

        $lock = Cache::lock('portfolio-assistant:admission:'.$ipHash, 5);
        if (! $lock->get()) {
            return response()->json(['message' => 'The assistant is busy. Please retry shortly.'], 429)
                ->header('Retry-After', '1')
                ->header('Cache-Control', 'no-store, private');
        }

        try {
            $limited = RateLimiter::tooManyAttempts($dailyKey, $dailyLimit);
            if (! $limited) {
                $secondsUntilReset = max(1, (int) now()->secondsUntilEndOfDay());
                RateLimiter::hit($dailyKey, $secondsUntilReset);
            }
        } finally {
            $lock->release();
        }

        if ($limited) {
            $retryAfter = RateLimiter::availableIn($dailyKey);

            PortfolioAssistantLog::query()->create([
                'session_id' => $request->header('X-Session-ID'),
                'ip_hash' => $ipHash,
                'user_question' => $userQuestion,
                'assistant_answer' => 'Rate limit exceeded.',
                'status' => 'rate_limited',
            ]);

            return response()->json([
                'message' => 'This visitor has reached the daily assistant limit. Please try again after it resets.',
            ], 429)->header('Retry-After', (string) $retryAfter)
                ->header('Cache-Control', 'no-store, private');
        }

        try {
            $answer = $assistant->answer($messages);

            PortfolioAssistantLog::query()->create([
                'session_id' => $request->header('X-Session-ID'),
                'ip_hash' => $ipHash,
                'user_question' => $userQuestion,
                'assistant_answer' => $answer,
                'status' => 'success',
            ]);

            return response()->json(['answer' => $answer])
                ->header('Cache-Control', 'no-store, private');
        } catch (PortfolioAssistantException $exception) {
            PortfolioAssistantLog::query()->create([
                'session_id' => $request->header('X-Session-ID'),
                'ip_hash' => $ipHash,
                'user_question' => $userQuestion,
                'assistant_answer' => $exception->getMessage(),
                'status' => 'error',
            ]);

            return response()->json(['message' => $exception->getMessage()], $exception->httpStatus)
                ->header('Cache-Control', 'no-store, private');
        }
    }
}
