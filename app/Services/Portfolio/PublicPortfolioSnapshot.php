<?php

declare(strict_types=1);

namespace App\Services\Portfolio;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class PublicPortfolioSnapshot
{
    /** Explicit public fields only; never derive this list from database columns. */
    public const COLUMNS = [
        'media' => ['id', 'disk', 'path', 'original_name', 'mime_type', 'size', 'alt_text', 'title', 'cloudinary_public_id', 'cloudinary_resource_type'],
        'navbars' => ['id', 'name', 'location', 'brand_title'],
        'navbar_items' => ['id', 'navbar_id', 'label', 'url', 'order'],
        'sidebar_items' => ['id', 'label', 'icon_media_id', 'url', 'sort_order', 'is_visible'],
        'certificates' => ['id', 'title', 'issuer', 'description', 'issued_at', 'credential_url', 'media_id', 'sort_order', 'is_visible'],
        'projects' => ['id', 'title', 'slug', 'tagline', 'description', 'challenge', 'solution', 'metrics', 'tech_stack', 'live_url', 'github_url', 'thumbnail_media_id', 'gallery_media_ids', 'is_featured', 'is_visible', 'sort_order'],
        'posts' => ['id', 'title', 'slug', 'excerpt', 'content', 'cover_media_id', 'tags', 'read_time_minutes', 'is_published', 'published_at'],
        'portfolio_sections' => ['id', 'slug', 'type', 'title', 'eyebrow', 'content', 'sort_order', 'is_visible'],
        'site_settings' => ['id', 'site_name', 'logo_media_id', 'background_media_id', 'avatar_media_id', 'resume_media_id', 'favicon_media_id', 'theme_preset', 'glass_blur', 'glass_opacity', 'hero_title', 'hero_subtitle', 'hero_description', 'about_title', 'about_description', 'primary_cta_label', 'primary_cta_url', 'secondary_cta_label', 'secondary_cta_url', 'email', 'github_url', 'linkedin_url', 'is_available'],
    ];

    /** @return array{version: int, tables: array<string, list<array<string, mixed>>>, assets: array<string, string>} */
    public function export(): array
    {
        $tables = [];
        foreach (self::COLUMNS as $table => $columns) {
            if ($table === 'media') {
                continue;
            }
            $query = DB::table($table)->select($columns)->orderBy('id');
            if (in_array($table, ['sidebar_items', 'certificates', 'projects', 'portfolio_sections'], true)) {
                $query->where('is_visible', true);
            } elseif ($table === 'posts') {
                $query->where('is_published', true)->whereNotNull('published_at');
            } elseif ($table === 'navbars') {
                $query->where('location', 'homepage-header');
            } elseif ($table === 'navbar_items') {
                $query->whereIn('navbar_id', array_column($tables['navbars'] ?? [], 'id'));
            }
            $tables[$table] = array_values($query->get()->map(static fn (object $row): array => get_object_vars($row))->all());
        }
        if (count($tables['site_settings']) !== 1) {
            throw new RuntimeException('Exactly one site settings record is required.');
        }

        $mediaIds = [];
        $collectMedia = function (array $values) use (&$collectMedia, &$mediaIds): void {
            foreach ($values as $key => $value) {
                if ($key === 'media_id' || str_ends_with((string) $key, '_media_id')) {
                    if ($value !== null) {
                        $mediaIds[] = (int) $value;
                    }
                } elseif ($key === 'gallery_media_ids' && $value !== null) {
                    $mediaIds = array_merge($mediaIds, json_decode((string) $value, true, 512, JSON_THROW_ON_ERROR) ?? []);
                } elseif (is_array($value)) {
                    $collectMedia($value);
                } elseif ($key === 'content' && is_string($value) && str_starts_with($value, '{')) {
                    $collectMedia(json_decode($value, true, 512, JSON_THROW_ON_ERROR));
                }
            }
        };
        $collectMedia($tables);
        $mediaIds = array_unique($mediaIds);
        $media = DB::table('media')->whereIn('id', $mediaIds)->orderBy('id')->get(self::COLUMNS['media']);
        if ($media->count() !== count($mediaIds)) {
            throw new RuntimeException('A public content record refers to missing media.');
        }
        $assets = [];
        $tables['media'] = [];
        foreach ($media as $record) {
            $row = get_object_vars($record);
            if ($row['disk'] === 'public') {
                $path = Storage::disk('public')->path($row['path']);
                $root = realpath(Storage::disk('public')->path(''));
                $resolved = realpath($path);
                if ($root === false || $resolved === false || ! str_starts_with($resolved, $root.DIRECTORY_SEPARATOR)) {
                    throw new RuntimeException('Missing or unsafe public media path.');
                }
                $extension = match ($row['mime_type']) {
                    'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp',
                    'image/gif' => 'gif', 'application/pdf' => 'pdf', 'image/x-icon', 'image/vnd.microsoft.icon' => 'ico',
                    default => throw new RuntimeException('Unsupported public snapshot media type.'),
                };
                $filename = hash_file('sha256', $resolved).'.'.$extension;
                File::ensureDirectoryExists(database_path('seeders/assets'));
                File::copy($resolved, database_path('seeders/assets/'.$filename));
                $row['path'] = 'media/deployment/'.$filename;
                $assets[$row['path']] = $filename;
            } elseif ($row['disk'] !== 'cloudinary' || parse_url($row['path'], PHP_URL_SCHEME) !== 'https' || parse_url($row['path'], PHP_URL_HOST) !== 'res.cloudinary.com') {
                throw new RuntimeException('Only public files and HTTPS Cloudinary media can be exported.');
            }
            $tables['media'][] = $row;
        }

        return ['version' => 1, 'tables' => $tables, 'assets' => $assets];
    }

    /** Restore only a fresh portfolio; runtime data is never imported or deleted. */
    public function restore(string $path): void
    {
        $driver = DB::getDriverName();
        if (! in_array($driver, ['sqlite', 'pgsql'], true)) {
            throw new RuntimeException('The deployment snapshot supports SQLite and PostgreSQL only.');
        }
        $snapshot = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);
        if (($snapshot['version'] ?? null) !== 1 || ! is_array($snapshot['tables'] ?? null)
            || array_diff(array_keys($snapshot['tables']), array_keys(self::COLUMNS)) !== []
            || array_diff(array_keys(self::COLUMNS), array_keys($snapshot['tables'])) !== []
            || count($snapshot['tables']['site_settings']) !== 1) {
            throw new RuntimeException('Invalid public portfolio snapshot.');
        }
        foreach (self::COLUMNS as $table => $columns) {
            foreach ($snapshot['tables'][$table] as $row) {
                if (! is_array($row) || array_diff(array_keys($row), $columns) !== []) {
                    throw new RuntimeException('Unexpected field in public portfolio snapshot.');
                }
            }
        }
        $this->restoreAssets($snapshot);
        DB::transaction(function () use ($snapshot, $driver): void {
            foreach (array_keys(self::COLUMNS) as $table) {
                if (! in_array($table, ['navbars', 'navbar_items'], true) && DB::table($table)->exists()) {
                    throw new RuntimeException('Refusing to replace existing portfolio content: '.$table);
                }
            }
            foreach (array_keys(self::COLUMNS) as $table) {
                if (in_array($table, ['navbars', 'navbar_items'], true)) {
                    continue;
                }
                foreach ($snapshot['tables'][$table] as $row) {
                    if ($table === 'media') {
                        $row['uploaded_by'] = null;
                    }
                    if ($driver === 'pgsql') {
                        foreach (['is_visible', 'is_available', 'is_featured', 'is_published'] as $boolean) {
                            if (array_key_exists($boolean, $row)) {
                                $row[$boolean] = (bool) $row[$boolean];
                            }
                        }
                    }
                    DB::table($table)->insert($row + ['created_at' => now(), 'updated_at' => now()]);
                }
            }
            // Migrations already create navigation. Match by location, not source IDs.
            foreach ($snapshot['tables']['navbars'] as $navbar) {
                if ($navbar['location'] !== 'homepage-header') {
                    throw new RuntimeException('Only public homepage navigation may be restored.');
                }
                $sourceId = $navbar['id'];
                unset($navbar['id']);
                DB::table('navbars')->updateOrInsert(['location' => $navbar['location']], $navbar + ['updated_at' => now()]);
                $targetId = DB::table('navbars')->where('location', $navbar['location'])->value('id');
                DB::table('navbar_items')->where('navbar_id', $targetId)->delete();
                foreach ($snapshot['tables']['navbar_items'] as $item) {
                    if ($item['navbar_id'] === $sourceId) {
                        unset($item['id']);
                        $item['navbar_id'] = $targetId;
                        DB::table('navbar_items')->insert($item + ['created_at' => now(), 'updated_at' => now()]);
                    }
                }
            }
            if ($driver === 'sqlite' && DB::select('PRAGMA foreign_key_check') !== []) {
                throw new RuntimeException('Public snapshot foreign key verification failed.');
            }
            if ($driver === 'pgsql') {
                foreach (array_keys(self::COLUMNS) as $table) {
                    DB::select("SELECT setval(pg_get_serial_sequence('{$table}', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM \"{$table}\"");
                }
            }
        });
    }

    /** Restore the public files after every rebuild, including when database rows persist. */
    public function restoreBundledAssets(string $path): void
    {
        $snapshot = json_decode(File::get($path), true, 512, JSON_THROW_ON_ERROR);
        $this->migrateBundledDocuments($snapshot);
        $this->restoreAssets($snapshot);
    }

    /** Update only unchanged bundled PDF records after their files move to Cloudinary. */
    private function migrateBundledDocuments(array $snapshot): void
    {
        foreach ($snapshot['tables']['media'] ?? [] as $row) {
            if (($row['mime_type'] ?? null) !== 'application/pdf'
                || ($row['disk'] ?? null) !== 'cloudinary'
                || ($row['cloudinary_resource_type'] ?? null) === null
                || parse_url((string) ($row['path'] ?? ''), PHP_URL_SCHEME) !== 'https'
                || parse_url((string) ($row['path'] ?? ''), PHP_URL_HOST) !== 'res.cloudinary.com') {
                continue;
            }

            $originalPath = $snapshot['migrated_documents'][$row['id']] ?? null;
            if (! is_string($originalPath)
                || ! preg_match('/^media\/deployment\/[a-f0-9]{64}\.pdf$/', $originalPath)) {
                continue;
            }
            DB::table('media')
                ->where('id', $row['id'])
                ->where('disk', 'public')
                ->where('path', $originalPath)
                ->update([
                    'disk' => 'cloudinary',
                    'path' => $row['path'],
                    'cloudinary_public_id' => $row['cloudinary_public_id'],
                    'cloudinary_resource_type' => $row['cloudinary_resource_type'],
                    'updated_at' => now(),
                ]);
        }
    }

    /** @param array<string, mixed> $snapshot */
    private function restoreAssets(array $snapshot): void
    {
        if (! is_array($snapshot['assets'] ?? null)) {
            throw new RuntimeException('Invalid bundled public assets.');
        }
        foreach ($snapshot['assets'] as $destination => $filename) {
            if (! preg_match('/^[a-f0-9]{64}\.(jpg|png|webp|gif|pdf|ico)$/', $filename)
                || $destination !== 'media/deployment/'.$filename) {
                throw new RuntimeException('Invalid bundled public asset path.');
            }
            $source = database_path('seeders/assets/'.$filename);
            if (! is_file($source) || hash_file('sha256', $source) !== pathinfo($filename, PATHINFO_FILENAME)) {
                throw new RuntimeException('Bundled public asset is missing or has changed.');
            }
            if (! Storage::disk('public')->exists($destination)
                && ! Storage::disk('public')->put($destination, File::get($source))) {
                throw new RuntimeException('Unable to restore a bundled public asset.');
            }
        }
    }
}
