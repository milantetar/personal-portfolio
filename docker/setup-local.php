<?php

declare(strict_types=1);

$destination = dirname(__DIR__).'/.env.docker';
$template = file_get_contents(__DIR__.'/local.env.example');

if ($template === false) {
    fwrite(STDERR, "Cannot read the Docker environment template.\n");
    exit(1);
}

$contents = str_replace(
    ["APP_KEY=\n", "ADMIN_EMAIL=\n", "ADMIN_PASSWORD=\n"],
    [
        'APP_KEY=base64:'.base64_encode(random_bytes(32))."\n",
        "ADMIN_EMAIL=admin@example.test\n",
        'ADMIN_PASSWORD='.bin2hex(random_bytes(24))."\n",
    ],
    str_replace("\r\n", "\n", $template),
);

// Exclusive creation preserves existing keys, passwords, and configuration.
$file = @fopen($destination, 'x');
if ($file === false) {
    fwrite(STDERR, "Cannot create .env.docker; if it already exists, edit it directly.\n");
    exit(1);
}

chmod($destination, 0600);
$written = fwrite($file, $contents);
fclose($file);

if ($written !== strlen($contents)) {
    fwrite(STDERR, "Could not finish writing .env.docker. Check the file before starting Docker.\n");
    exit(1);
}

echo "Created private .env.docker with a random application key and admin password.\n";
echo "Edit it to add GEMINI_API_KEY and any optional Cloudinary or Neon settings.\n";
echo "The admin login is saved in that file; your existing .env and database were not changed.\n";
