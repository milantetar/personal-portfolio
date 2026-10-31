<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\AnalyticsVisit;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class TrackPortfolioVisit
{
    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! $request->isMethod('GET') || $response->getStatusCode() >= 400 || $this->isBot($request->userAgent())) {
            return $response;
        }

        $sessionId = $request->hasSession() ? $request->session()->getId() : '';
        $key = (string) config('app.key');

        if ($sessionId === '' || $key === '') {
            return $response;
        }

        try {
            AnalyticsVisit::query()->create([
                'visitor_hash' => hash_hmac('sha256', $sessionId, $key),
                'path' => '/'.ltrim($request->path(), '/'),
                'referrer_host' => $this->referrerHost($request),
                'device_type' => $this->deviceType($request->userAgent()),
                'viewed_at' => now(),
            ]);
        } catch (Throwable $exception) {
            // Analytics must never make the public portfolio unavailable.
            Log::warning('Portfolio visit tracking failed.', [
                'exception' => $exception::class,
            ]);
        }

        return $response;
    }

    private function referrerHost(Request $request): ?string
    {
        $host = parse_url((string) $request->headers->get('referer'), PHP_URL_HOST);

        if (! is_string($host) || $host === '' || $host === $request->getHost()) {
            return null;
        }

        return mb_substr(mb_strtolower($host), 0, 255);
    }

    private function deviceType(?string $userAgent): string
    {
        $userAgent = mb_strtolower($userAgent ?? '');

        if (preg_match('/ipad|tablet|kindle|silk/', $userAgent) === 1) {
            return 'tablet';
        }

        if (preg_match('/mobile|android|iphone|ipod/', $userAgent) === 1) {
            return 'mobile';
        }

        return 'desktop';
    }

    private function isBot(?string $userAgent): bool
    {
        return preg_match('/bot|crawler|spider|slurp|headless|preview|facebookexternalhit|whatsapp/i', $userAgent ?? '') === 1;
    }
}
