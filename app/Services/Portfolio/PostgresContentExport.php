<?php

declare(strict_types=1);

namespace App\Services\Portfolio;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class PostgresContentExport
{
    public function generate(): string
    {
        $sql = [
            '-- Portfolio content only: replaces the nine content tables. Back up the target first.',
            '-- Accounts, sessions, access tokens, messages, logs and migration history are excluded.',
            'SET standard_conforming_strings = on;',
            'BEGIN;',
        ];
        foreach (array_reverse(MySqlContentDump::TABLES) as $table) {
            $sql[] = 'DELETE FROM "'.$table.'";';
        }
        foreach (MySqlContentDump::TABLES as $table) {
            foreach (DB::table($table)->orderBy('id')->get() as $record) {
                $row = (array) $record;
                if ($table === 'media') {
                    $row['uploaded_by'] = null;
                }
                $columns = implode(', ', array_map(static fn (string $column): string => '"'.$column.'"', array_keys($row)));
                $values = [];
                foreach ($row as $column => $value) {
                    $values[] = $this->literal($column, $value);
                }
                $sql[] = 'INSERT INTO "'.$table.'" ('.$columns.') VALUES ('.implode(', ', $values).');';
            }
            $sql[] = "SELECT setval(pg_get_serial_sequence('{$table}', 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM \"{$table}\";";
        }
        $sql[] = 'COMMIT;';

        return implode("\n", $sql)."\n";
    }

    private function literal(string $column, mixed $value): string
    {
        if ($value === null) {
            return 'NULL';
        }
        if (in_array($column, ['is_visible', 'is_available', 'is_featured', 'is_published'], true)) {
            return $value ? 'TRUE' : 'FALSE';
        }
        if (! is_scalar($value) || str_contains((string) $value, "\0")) {
            throw new RuntimeException('Unsupported data value for PostgreSQL content export.');
        }

        return "'".str_replace("'", "''", (string) $value)."'";
    }
}
