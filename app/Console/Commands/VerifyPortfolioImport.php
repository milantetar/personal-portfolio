<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Media;
use App\Services\Portfolio\MySqlContentDump;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class VerifyPortfolioImport extends Command
{
    protected $signature = 'portfolio:verify-sql-import';

    protected $description = 'Compare local SQLite portfolio content with the private SQL dump and check media files';

    public function handle(MySqlContentDump $parser): int
    {
        if (! app()->environment(['local', 'testing']) || DB::getDriverName() !== 'sqlite') {
            $this->error('This verification is restricted to local/testing SQLite.');

            return self::FAILURE;
        }
        $source = $parser->parse(File::get((string) config('portfolio-import.path')));
        $valid = true;
        foreach ($source as $table => $rows) {
            $count = DB::table($table)->count();
            $valid = $valid && $count === count($rows);
            $this->line($table.': '.$count.'/'.count($rows).' rows');
        }
        $integrity = DB::selectOne('PRAGMA integrity_check');
        if ($integrity === null || $integrity->integrity_check !== 'ok' || DB::select('PRAGMA foreign_key_check') !== []) {
            $this->error('SQLite integrity or foreign key check failed.');

            return self::FAILURE;
        }
        $missing = 0;
        foreach (Media::query()->get() as $media) {
            if ($media->disk !== 'cloudinary' && ! Storage::disk($media->disk)->exists($media->path)) {
                $missing++;
                $this->warn('Missing media file for record '.$media->id.': '.$media->path);
            }
        }
        $this->info('SQLite integrity and foreign keys: OK. Missing local media files: '.$missing.'.');

        return $valid && $missing === 0 ? self::SUCCESS : self::FAILURE;
    }
}
