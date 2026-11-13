<?php

declare(strict_types=1);

return [
    'enabled' => env('DEPLOYMENT_CONTENT_SEED', true),
    'path' => database_path('seeders/data/public-portfolio.json'),
];
