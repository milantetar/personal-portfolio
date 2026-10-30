<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\PortfolioAssistantRequest;
use App\Services\Portfolio\PortfolioAssistantException;
use App\Services\Portfolio\PortfolioAssistantService;
use Illuminate\Http\JsonResponse;
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

        $dailyKey = 'portfolio-assistant:daily:'.hash('sha256', $request->ip() ?? 'unknown');
        $dailyLimit = max(1, (int) config('services.gemini.daily_limit', 60));

        if (RateLimiter::tooManyAttempts($dailyKey, $dailyLimit)) {
            $retryAfter = RateLimiter::availableIn($dailyKey);

            return response()->json([
                'message' => 'This visitor has reached the daily assistant limit. Please try again after it resets.',
            ], 429)->header('Retry-After', (string) $retryAfter)
                ->header('Cache-Control', 'no-store, private');
        }

        $secondsUntilReset = max(1, now()->endOfDay()->timestamp - now()->timestamp);
        RateLimiter::hit($dailyKey, $secondsUntilReset);

        try {
            return response()->json(['answer' => $assistant->answer($messages)])
                ->header('Cache-Control', 'no-store, private');
        } catch (PortfolioAssistantException $exception) {
            return response()->json(['message' => $exception->getMessage()], $exception->httpStatus)
                ->header('Cache-Control', 'no-store, private');
        }
    }
}
