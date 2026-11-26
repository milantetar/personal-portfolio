<?php

declare(strict_types=1);

use Illuminate\Support\Facades\DB;

it('serves the public health endpoint without database queries', function (): void {
    $queries = [];
    DB::listen(function ($query) use (&$queries): void {
        $queries[] = $query->sql;
    });

    $this->get('/up')->assertOk();

    expect($queries)->toBe([]);
});
