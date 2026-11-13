import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = 'storage/app/private/browser-audit';
const base = 'http://127.0.0.1:8019';
if (fs.existsSync('bootstrap/cache/config.php')) {
    throw new Error(
        'Clear cached config with php artisan config:clear before the isolated browser audit.',
    );
}
try {
    await fetch(`${base}/up`, { signal: AbortSignal.timeout(500) });
    throw new Error(
        'Port 8019 is already in use. Stop that audit server before running another audit.',
    );
} catch (error) {
    if (error.message.includes('already in use')) throw error;
}
function execute(command, args) {
    const result = spawnSync(command, args, {
        stdio: 'inherit',
        env: process.env,
    });
    if (result.status !== 0)
        throw new Error(
            `${command} ${args.join(' ')} failed (${result.status}).`,
        );
}
execute('php', ['tests/Browser/prepare.php']);
const log = fs.openSync(`${root}/server.log`, 'w');
const server = spawn(
    'php',
    [
        '-d',
        'xdebug.mode=off',
        '-S',
        '127.0.0.1:8019',
        '-t',
        'public',
        'tests/Browser/server.php',
    ],
    {
        stdio: ['ignore', log, log],
        env: {
            ...process.env,
            APP_ENV: 'local',
            APP_URL: base,
            DB_CONNECTION: 'sqlite',
            DB_URL: '',
            DB_DATABASE: fs
                .readFileSync(`${root}/database-path.txt`, 'utf8')
                .trim(),
            MEDIA_STORAGE_DISK: 'public',
            MAIL_MAILER: 'array',
            MAIL_FROM_ADDRESS: 'audit@example.test',
            SESSION_DOMAIN: 'null',
            SESSION_SECURE_COOKIE: 'false',
            GEMINI_API_KEY: 'browser-audit-mocked',
            GITHUB_TOKEN: '',
            GITHUB_USERNAME: '',
            LOG_CHANNEL: 'single',
        },
    },
);
try {
    let ready = false;
    for (let attempt = 0; attempt < 30; attempt++) {
        try {
            ready = (
                await fetch(`${base}/up`, { signal: AbortSignal.timeout(1000) })
            ).ok;
            if (ready) break;
        } catch {
            /* Wait for PHP to bind its loopback port. */
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (!ready)
        throw new Error(
            'Audit server did not start. Inspect the private server.log.',
        );
    for (const script of [
        'explore.mjs',
        'audit.mjs',
        'audit-more.mjs',
        'audit-edge.mjs',
    ]) {
        execute('php', ['tests/Browser/reset-cache.php']);
        execute(process.execPath, [path.join('tests/Browser', script)]);
    }
    console.log(`Audit complete. Private screenshots and results: ${root}`);
} finally {
    server.kill();
    fs.closeSync(log);
}
