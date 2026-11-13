<?php

declare(strict_types=1);

use App\Http\Middleware\TrustConfiguredProxies;
use Illuminate\Http\Middleware\TrustHosts;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Exception\SuspiciousOperationException;
use Symfony\Component\Process\Process;

afterEach(function (): void {
    Request::setTrustedProxies([], 0);
    Request::setTrustedHosts([]);
});

it('keeps production debug disabled even when APP_DEBUG is accidentally enabled', function (): void {
    $process = new Process([
        PHP_BINARY, '-r',
        'require "vendor/autoload.php"; echo json_encode((require "config/app.php")["debug"]);',
    ], base_path(), ['APP_ENV' => 'production', 'APP_DEBUG' => 'true']);
    $process->mustRun();

    expect(trim($process->getOutput()))->toBe('false');
});

it('ignores forwarded client headers when no proxy is trusted', function (): void {
    config(['security.trusted_proxies' => []]);
    $request = Request::create('http://portfolio.test/', server: ['REMOTE_ADDR' => '203.0.113.20']);
    $request->headers->set('X-Forwarded-For', '198.51.100.17');
    $request->headers->set('X-Forwarded-Proto', 'https');

    (new TrustConfiguredProxies)->handle($request, function (Request $request) {
        expect($request->ip())->toBe('203.0.113.20')
            ->and($request->isSecure())->toBeFalse();

        return response('ok');
    });
});

it('accepts client IP and scheme from a configured proxy but ignores forwarded origins', function (): void {
    config(['security.trusted_proxies' => ['203.0.113.20']]);
    $request = Request::create('http://portfolio.test/', server: ['REMOTE_ADDR' => '203.0.113.20']);
    $request->headers->add([
        'X-Forwarded-For' => '198.51.100.17',
        'X-Forwarded-Proto' => 'https',
        'X-Forwarded-Host' => 'attacker.test',
        'X-Forwarded-Port' => '4444',
        'X-Forwarded-Prefix' => '/attacker',
    ]);

    (new TrustConfiguredProxies)->handle($request, function (Request $request) {
        expect($request->ip())->toBe('198.51.100.17')
            ->and($request->isSecure())->toBeTrue()
            ->and($request->getHost())->toBe('portfolio.test')
            ->and($request->getPort())->toBe(443)
            ->and($request->getBaseUrl())->toBe('');

        return response('ok');
    });
});

it('rejects an unconfigured host in production host validation', function (): void {
    config(['security.trusted_hosts' => ['portfolio.test']]);
    $middleware = new class(app()) extends TrustHosts
    {
        protected function shouldSpecifyTrustedHosts(): bool
        {
            return true;
        }
    };

    $request = Request::create('http://attacker.test/');

    expect(fn () => $middleware->handle($request, fn (Request $request) => response($request->getHost())))
        ->toThrow(SuspiciousOperationException::class);
});
