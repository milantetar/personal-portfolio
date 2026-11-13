<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
config(['database.connections.sqlite.database' => trim(file_get_contents(storage_path('app/private/browser-audit/database-path.txt')))]);
DB::purge('sqlite');
DB::table('cache')->delete();
DB::table('cache_locks')->delete();
echo "Isolated browser cache reset.\n";
