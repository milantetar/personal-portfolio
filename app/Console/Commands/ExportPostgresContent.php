<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Media;
use App\Services\Portfolio\PostgresContentExport;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ExportPostgresContent extends Command
{
    protected $signature = 'portfolio:export-postgres {--allow-local-media : Export local file references that will need separate storage migration}';

    protected $description = 'Export local SQLite portfolio content as private PostgreSQL-compatible SQL';

    public function handle(PostgresContentExport $exporter): int
    {
        if (! app()->environment(['local', 'testing']) || DB::getDriverName() !== 'sqlite') {
            $this->error('Run this export against local/testing SQLite.');

            return self::FAILURE;
        }
        $localMedia = Media::query()->where('disk', '!=', 'cloudinary')->count();
        if ($localMedia > 0 && ! $this->option('allow-local-media')) {
            $this->error($localMedia.' media records still use local storage. Re-upload/migrate them and reassign their slots/certificates before exporting for Render.');

            return self::FAILURE;
        }
        if ($localMedia > 0) {
            $this->warn('Export includes '.$localMedia.' local file references. This SQL does not transfer the actual files.');
        }
        $directory = storage_path('app/private/exports');
        File::ensureDirectoryExists($directory);
        $path = $directory.'/portfolio-content-'.now()->format('Ymd-His').'-'.bin2hex(random_bytes(3)).'.sql';
        $sql = DB::transaction(fn (): string => $exporter->generate());
        File::put($path, $sql);
        $this->info('Private content export saved: '.$path);
        $this->warn('Review this file. It replaces portfolio content on the target. Run migrations there first and take a backup.');

        return self::SUCCESS;
    }
}
