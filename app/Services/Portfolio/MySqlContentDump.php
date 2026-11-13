<?php

declare(strict_types=1);

namespace App\Services\Portfolio;

use RuntimeException;

/** Reads literal content rows only. SQL from the dump is never executed. */
class MySqlContentDump
{
    public const TABLES = ['media', 'navbars', 'navbar_items', 'sidebar_items', 'certificates', 'projects', 'posts', 'portfolio_sections', 'site_settings'];

    /** @return array<string, list<array<string, string|null>>> */
    public function parse(string $sql): array
    {
        $tables = [];
        foreach ($this->statements($sql) as $statement) {
            if (preg_match('/^CREATE TABLE(?: IF NOT EXISTS)? `([a-z_]+)`/i', $statement, $match)
                && in_array($match[1], self::TABLES, true)) {
                $tables[$match[1]] ??= [];
            }

            if (! preg_match('/^INSERT INTO `([a-z_]+)`\s*\(([^)]+)\)\s+VALUES\s*/i', $statement, $match)
                || ! in_array($match[1], self::TABLES, true)) {
                continue;
            }

            $table = $match[1];
            $columns = array_map(static fn (string $column): string => trim($column, " `\t\r\n"), explode(',', $match[2]));
            foreach ($columns as $column) {
                if (! preg_match('/^[a-z_]+$/', $column)) {
                    throw new RuntimeException('Unsupported column identifier in content dump.');
                }
            }
            $values = substr($statement, strlen($match[0]));
            $offset = 0;
            while ($offset < strlen($values)) {
                $this->whitespace($values, $offset);
                if (($values[$offset++] ?? '') !== '(') {
                    throw new RuntimeException('Expected a literal data row.');
                }
                $row = [];
                foreach ($columns as $index => $column) {
                    $this->whitespace($values, $offset);
                    $row[$column] = $this->value($values, $offset);
                    $this->whitespace($values, $offset);
                    $expected = $index === count($columns) - 1 ? ')' : ',';
                    if (($values[$offset++] ?? '') !== $expected) {
                        throw new RuntimeException('Content dump row has an invalid column count.');
                    }
                }
                $tables[$table][] = $row;
                $this->whitespace($values, $offset);
                if ($offset === strlen($values)) {
                    break;
                }
                if (($values[$offset++] ?? '') !== ',') {
                    throw new RuntimeException('Only literal INSERT values are supported.');
                }
            }
        }

        return $tables;
    }

    /** @return \Generator<int, string> */
    private function statements(string $sql): \Generator
    {
        $buffer = '';
        $quote = null;
        $length = strlen($sql);
        for ($i = 0; $i < $length; $i++) {
            $char = $sql[$i];
            $next = $sql[$i + 1] ?? '';
            if ($quote !== null) {
                $buffer .= $char;
                if ($char === '\\' && $i + 1 < $length) {
                    $buffer .= $sql[++$i];
                } elseif ($char === $quote) {
                    if ($next === $quote) {
                        $buffer .= $sql[++$i];
                    } else {
                        $quote = null;
                    }
                }

                continue;
            }
            if (($char === '-' && $next === '-') || $char === '#') {
                while ($i < $length && $sql[$i] !== "\n") {
                    $i++;
                }
                $buffer .= ' ';
            } elseif ($char === '/' && $next === '*') {
                $end = strpos($sql, '*/', $i + 2);
                if ($end === false) {
                    throw new RuntimeException('Unterminated SQL comment.');
                }
                $i = $end + 1;
                $buffer .= ' ';
            } elseif (in_array($char, ["'", '"', '`'], true)) {
                $quote = $char;
                $buffer .= $char;
            } elseif ($char === ';') {
                yield trim($buffer);
                $buffer = '';
            } else {
                $buffer .= $char;
            }
        }
        if ($quote !== null || trim($buffer) !== '') {
            throw new RuntimeException('Incomplete SQL statement in content dump.');
        }
    }

    private function whitespace(string $sql, int &$offset): void
    {
        while (isset($sql[$offset]) && ctype_space($sql[$offset])) {
            $offset++;
        }
    }

    private function value(string $sql, int &$offset): ?string
    {
        if (($sql[$offset] ?? '') !== "'") {
            if (! preg_match('/\G(NULL|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)(?=\s*[,\)])/i', $sql, $match, 0, $offset)) {
                throw new RuntimeException('Unsupported expression in content dump.');
            }
            $offset += strlen($match[0]);

            return strtoupper($match[1]) === 'NULL' ? null : $match[1];
        }

        $offset++;
        $value = '';
        while (isset($sql[$offset])) {
            $char = $sql[$offset++];
            if ($char === "'") {
                if (($sql[$offset] ?? '') === "'") {
                    $value .= "'";
                    $offset++;
                } else {
                    return $value;
                }
            } elseif ($char === '\\') {
                if ($offset >= strlen($sql)) {
                    throw new RuntimeException('Incomplete escape sequence in content dump.');
                }
                $escaped = $sql[$offset];
                $offset++;
                $value .= match ($escaped) {
                    'n' => "\n", 'r' => "\r", 't' => "\t", '0' => "\0", 'b' => "\x08", 'Z' => "\x1a",
                    '\\', "'", '"' => $escaped,
                    default => throw new RuntimeException('Unsupported escape sequence in content dump.'),
                };
            } else {
                $value .= $char;
            }
        }

        throw new RuntimeException('Unterminated SQL string.');
    }
}
