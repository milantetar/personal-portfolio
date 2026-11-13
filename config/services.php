<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'cloudinary' => [
        'url' => env('CLOUDINARY_URL'),
        'folder' => env('CLOUDINARY_FOLDER', 'personal-portfolio'),
    ],
    'media_storage_disk' => env('MEDIA_STORAGE_DISK', 'public'),

    'github' => [
        'token' => env('GITHUB_TOKEN'),
        'username' => env('GITHUB_USERNAME'),
        'ca_bundle' => env('GITHUB_CA_BUNDLE'),
    ],

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-3.5-flash-lite'),
        'fallback_model' => env('GEMINI_FALLBACK_MODEL', 'gemini-3.6-flash'),
        'timeout' => env('GEMINI_TIMEOUT_SECONDS', 12),
        'ca_bundle' => env('GEMINI_CA_BUNDLE'),
        'per_minute_limit' => env('PORTFOLIO_ASSISTANT_PER_MINUTE_LIMIT', 10),
        'daily_limit' => env('PORTFOLIO_ASSISTANT_DAILY_LIMIT', 60),
    ],

];
