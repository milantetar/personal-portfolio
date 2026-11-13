<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\Portfolio\PublicPortfolioSnapshot;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ExportDeploymentContent extends Command
{
    protected $signature = 'portfolio:export-deployment-content';

    protected $description = 'Package visible portfolio content and referenced public assets for deployment (excludes analytics and accounts)';

    public function handle(PublicPortfolioSnapshot $snapshot): int
    {
        if (! app()->environment(['local', 'testing']) || DB::getDriverName() !== 'sqlite') {
            $this->error('Export only from local/testing SQLite.');

            return self::FAILURE;
        }
        $data = DB::transaction(fn (): array => $snapshot->export());
        $path = (string) config('deployment-content.path');
        File::ensureDirectoryExists(dirname($path));
        File::put($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n");
        foreach ($data['tables'] as $table => $rows) {
            $this->line($table.': '.count($rows).' public rows');
        }
        $this->info('Public deployment snapshot exported. Review JSON and bundled files before committing.');
        $this->info('Analytics, accounts, sessions, tokens, contacts and assistant logs are excluded.');

        return self::SUCCESS;
    }
}
