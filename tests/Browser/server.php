<?php

declare(strict_types=1);
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Vite;

$project = dirname(__DIR__, 2);
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (str_starts_with($path, '/audit-media/')) {
    $root = realpath($project.'/storage/app/private/browser-audit/media');
    $file = realpath($root.'/'.substr($path, strlen('/audit-media/')));
    if ($file !== false && str_starts_with($file, $root.DIRECTORY_SEPARATOR) && is_file($file)) {
        header('Content-Type: '.mime_content_type($file));
        readfile($file);
    } else {
        http_response_code(404);
    }

    return;
}
if ($path !== '/' && is_file($project.'/public'.$path)) {
    return false;
}
require $project.'/vendor/autoload.php';
$app = require $project.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
Vite::useHotFile($project.'/storage/app/private/browser-audit/no-hot');
config([
    'logging.default' => 'browser-audit',
    'logging.channels.browser-audit' => [
        'driver' => 'single',
        'path' => $project.'/storage/app/private/browser-audit/application.log',
        'level' => 'debug',
    ],
    'logging.default' => 'browser-audit',
    'logging.channels.browser-audit' => [
        'driver' => 'single',
        'path' => $project.'/storage/app/private/browser-audit/application.log',
        'level' => 'debug',
    ],
    'filesystems.disks.public.root' => $project.'/storage/app/private/browser-audit/media',
    'filesystems.disks.public.url' => 'http://127.0.0.1:8019/audit-media',
]);
Http::preventStrayRequests();
Http::fake([
    'api.github.com/*' => Http::response([]),
    'generativelanguage.googleapis.com/*' => Http::response([
        'candidates' => [['content' => ['parts' => [['text' => 'This is a mocked provider response for the browser audit. Milan builds Laravel applications.']]]]],
    ]),
]);
$request = Request::capture();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
