<?php

declare(strict_types=1);

return [
    // Opt in only behind an ingress that sanitizes forwarded client headers.
    'trusted_proxies' => array_values(array_filter(array_map('trim', explode(',', (string) env('TRUSTED_PROXIES', ''))))),

    'trusted_hosts' => array_values(array_filter([
        parse_url((string) env('APP_URL', 'http://localhost'), PHP_URL_HOST),
        env('RENDER_EXTERNAL_HOSTNAME'),
    ])),
];
