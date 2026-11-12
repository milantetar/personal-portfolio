#!/bin/sh
set -e

# Ensure SQLite file exists
if [ ! -f /app/database/database.sqlite ]; then
    touch /app/database/database.sqlite
    chmod 664 /app/database/database.sqlite
fi

# Ensure storage link
php artisan storage:link --force || true

# Run migrations and starter seed
php artisan migrate --force || true
php artisan db:seed --force || true

# Optimize for production
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

exec "$@"
