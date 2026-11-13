<?php

declare(strict_types=1);

use App\Models\SiteSetting;
use App\Services\Portfolio\PostgresContentExport;

it('exports PostgreSQL booleans and quoted data without account tables', function (): void {
    SiteSetting::query()->create(['site_name' => "Milan's portfolio; -- data", 'is_available' => true]);
    $sql = app(PostgresContentExport::class)->generate();

    expect($sql)->toContain("'Milan''s portfolio; -- data'")
        ->toContain('TRUE')
        ->toContain('SET standard_conforming_strings = on;')
        ->toContain('pg_get_serial_sequence')
        ->toContain('COMMIT;')
        ->not->toContain('DELETE FROM "users"')
        ->not->toContain('INSERT INTO "personal_access_tokens"');
});
