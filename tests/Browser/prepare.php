<?php

declare(strict_types=1);
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Spatie\Permission\Models\Role;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! $app->environment('local') || DB::getDriverName() !== 'sqlite') {
    throw new RuntimeException('Browser audit preparation requires local SQLite.');
}
$root = storage_path('app/private/browser-audit');
File::ensureDirectoryExists($root);
$database = $root.'/audit-'.date('YmdHis').'.sqlite';
DB::statement('VACUUM INTO '.DB::getPdo()->quote($database));
config(['database.connections.sqlite.database' => $database]);
DB::purge('sqlite');
foreach (['sessions', 'personal_access_tokens', 'password_reset_tokens', 'cache', 'cache_locks', 'contact_messages', 'portfolio_assistant_logs', 'analytics_visits'] as $table) {
    DB::table($table)->delete();
}
$user = User::query()->create(['name' => 'Browser Audit', 'email' => 'browser-audit@example.test', 'password' => 'Browser-audit-only-42!']);
$user->assignRole(Role::findOrCreate('admin', 'web'));
User::query()->create(['name' => 'Browser Reader', 'email' => 'browser-reader@example.test', 'password' => 'Browser-audit-only-42!']);
SiteSetting::query()->first()?->update(['email' => 'owner@example.test']);
File::copyDirectory(storage_path('app/public'), $root.'/media');
file_put_contents($root.'/database-path.txt', $database);
echo "Isolated browser database and media prepared.\n";
