<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class MakeRepository extends Command
{
    protected $signature = 'make:repository {name}';

    protected $description = 'Create a new repository class';

    public function handle(): void
    {
        $name = $this->argument('name');

        if (! str_ends_with($name, 'Repository')) {
            $name .= 'Repository';
        }

        $segments = explode('/', $name);
        array_pop($segments);

        $directory = implode('/', $segments);
        $namespace = 'App\\Repositories';

        if ($directory !== '') {
            $namespace .= '\\'.str_replace('/', '\\', $directory);
        }

        $basePath = app_path('Repositories');

        if ($directory !== '') {
            $basePath .= '/'.$directory;
        }

        $path = app_path("Repositories/{$name}.php");

        if (File::exists($path)) {
            $this->error("Repository {$name} already exists!");

            return;
        }

        File::ensureDirectoryExists($basePath);

        $stub = "<?php\n\ndeclare(strict_types=1);\n\nnamespace App\Repositories;\n\nclass {$name}\n{\n    // Add database query logic here\n}\n";

        File::put($path, $stub);

        $this->info("Repository {$name} created successfully.");
    }
}
