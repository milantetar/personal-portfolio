<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;

class TrustConfiguredProxies extends TrustProxies
{
    // Host, port and prefix headers must not control generated application URLs.
    protected $headers = Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_PROTO;

    /** @return array<int, string> */
    protected function proxies(): array
    {
        return config('security.trusted_proxies', []);
    }
}
