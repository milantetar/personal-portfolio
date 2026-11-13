<?php

declare(strict_types=1);

use App\Models\SiteSetting;
use App\Models\User;
use App\Services\Portfolio\MySqlContentDump;
use Database\Seeders\PortfolioSqlSeeder;
use Illuminate\Support\Facades\DB;

it('reads escaped content as data and excludes account and session inserts', function (): void {
    $sql = <<<'SQL'
CREATE TABLE `portfolio_sections` (`id` int);
INSERT INTO `portfolio_sections` (`id`, `title`) VALUES (1, 'Milan\'s; portfolio'), (2, 'A ''quoted'' title');
INSERT INTO `sessions` (`id`, `payload`) VALUES ('secret', 'private');
DROP TABLE `users`;
SQL;
    $tables = (new MySqlContentDump)->parse($sql);

    expect(array_keys($tables))->toBe(['portfolio_sections'])
        ->and($tables['portfolio_sections'][0]['title'])->toBe("Milan's; portfolio")
        ->and($tables['portfolio_sections'][1]['title'])->toBe("A 'quoted' title");
});

it('rejects SQL expressions instead of executing them', function (): void {
    expect(fn () => (new MySqlContentDump)->parse("INSERT INTO `site_settings` (`id`, `site_name`) VALUES (1, CONCAT('a', 'b'));"))
        ->toThrow(RuntimeException::class);
});

it('previews then imports content without replacing accounts or trusting uploader IDs', function (): void {
    $file = tempnam(sys_get_temp_dir(), 'portfolio-import-');
    $sql = implode("\n", array_map(static fn (string $table): string => 'CREATE TABLE `'.$table.'` (`id` int);', MySqlContentDump::TABLES));
    $sql .= "\nINSERT INTO `site_settings` (`id`, `site_name`) VALUES (1, 'Imported portfolio');";
    $sql .= "\nINSERT INTO `media` (`id`, `disk`, `path`, `original_name`, `mime_type`, `size`, `uploaded_by`) VALUES (1, 'public', 'media/test.png', 'test.png', 'image/png', 10, 999);";
    file_put_contents($file, $sql);
    $user = User::factory()->create();
    SiteSetting::query()->create(['site_name' => 'Existing content']);

    try {
        config(['portfolio-import.path' => $file, 'portfolio-import.apply' => false]);
        $this->seed(PortfolioSqlSeeder::class);
        expect(SiteSetting::query()->sole()->site_name)->toBe('Existing content');

        config(['portfolio-import.apply' => true]);
        $this->seed(PortfolioSqlSeeder::class);
        expect(SiteSetting::query()->sole()->site_name)->toBe('Imported portfolio')
            ->and(User::query()->sole()->id)->toBe($user->id)
            ->and(DB::table('media')->value('uploaded_by'))->toBeNull()
            ->and(DB::select('PRAGMA foreign_key_check'))->toBe([]);
    } finally {
        unlink($file);
    }
});
