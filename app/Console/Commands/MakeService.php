<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class MakeService extends Command
{
    protected $signature = 'make:service {name}';

    protected $description = 'Create a new service class';

    public function handle(): void
    {
        $name = $this->argument('name');

        // Append Service to the class name if missing
        if (! str_ends_with($name, 'Service')) {
            $name .= 'Service';
        }

        // Convert Auth/AuthService to path segments
        $segments = explode('/', $name);
        $className = array_pop($segments);

        // Build the directory and namespace
        $directory = implode('/', $segments);
        $namespace = 'App\\Services';

        if ($directory !== '') {
            $namespace .= '\\'.str_replace('/', '\\', $directory);
        }

        $basePath = app_path('Services');

        if ($directory !== '') {
            $basePath .= '/'.$directory;
        }

        $path = $basePath.'/'.$className.'.php';

        if (File::exists($path)) {
            $this->error("Service {$className} already exists!");

            return;
        }

        // Create nested directories automatically
        File::ensureDirectoryExists($basePath);

        $stub = "<?php\n\ndeclare(strict_types=1);\n\nnamespace {$namespace};\n\nclass {$className}\n{\n    // Add your business logic here\n}\n";

        File::put($path, $stub);

        $this->info("Service {$className} created successfully.");
    }
}
