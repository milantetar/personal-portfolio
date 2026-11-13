<?php

declare(strict_types=1);

return [
    'path' => database_path('seeders/sql/portfolio-db.sql'),
    'apply' => env('PORTFOLIO_IMPORT_APPLY', false),
];
