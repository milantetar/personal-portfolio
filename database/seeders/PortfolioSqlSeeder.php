<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Services\Portfolio\MySqlContentDump;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use RuntimeException;

class PortfolioSqlSeeder extends Seeder
{
    public function run(MySqlContentDump $parser): void
    {
        if (! app()->environment(['local', 'testing']) || DB::getDriverName() !== 'sqlite') {
            throw new RuntimeException('This private import seeder is restricted to local/testing SQLite.');
        }
        $tables = $parser->parse(File::get((string) config('portfolio-import.path')));
        foreach (MySqlContentDump::TABLES as $table) {
            if (! array_key_exists($table, $tables)) {
                throw new RuntimeException('Missing expected content table: '.$table);
            }
            $columns = Schema::getColumnListing($table);
            foreach ($tables[$table] as $row) {
                if (array_diff(array_keys($row), $columns) !== []) {
                    throw new RuntimeException('Run migrations before importing '.$table.'.');
                }
            }
            $this->command?->line($table.': '.count($tables[$table]).' source rows');
        }

        if (! config('portfolio-import.apply')) {
            $this->command?->info('Preview only. Set PORTFOLIO_IMPORT_APPLY=true for this process to replace content tables. Accounts and runtime data are excluded.');

            return;
        }

        // VACUUM INTO includes committed WAL contents, unlike copying a live DB file.
        $database = DB::selectOne('PRAGMA database_list');
        if ($database !== null && $database->file !== '') {
            $directory = storage_path('app/private/backups');
            File::ensureDirectoryExists($directory);
            $backup = $directory.'/portfolio-before-import-'.now()->format('Ymd-His').'-'.bin2hex(random_bytes(3)).'.sqlite';
            DB::statement('VACUUM INTO '.DB::getPdo()->quote($backup));
            $this->command?->info('Backup saved: '.$backup);
        }

        DB::transaction(function () use ($tables): void {
            foreach (array_reverse(MySqlContentDump::TABLES) as $table) {
                DB::table($table)->delete();
            }
            foreach (MySqlContentDump::TABLES as $table) {
                foreach ($tables[$table] as $row) {
                    if ($table === 'media') {
                        // Dump uploader IDs are not a source of production authorization.
                        $row['uploaded_by'] = null;
                    }
                    DB::table($table)->insert($row);
                }
                if (DB::table($table)->count() !== count($tables[$table])) {
                    throw new RuntimeException('Row count mismatch for '.$table.'.');
                }
            }
            if (DB::select('PRAGMA foreign_key_check') !== []) {
                throw new RuntimeException('Foreign key verification failed; import rolled back.');
            }
        });
        $this->command?->info('Content import committed. Row counts and foreign keys verified.');
    }
}
