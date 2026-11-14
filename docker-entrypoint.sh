#!/bin/sh
set -e

# APP_KEY must remain stable across deploys to preserve encrypted data/sessions.
: "${APP_KEY:?Set APP_KEY to the output of php artisan key:generate --show}"
export APP_URL="${APP_URL:-${RENDER_EXTERNAL_URL:-http://localhost:8080}}"

if [ "${DB_CONNECTION:-sqlite}" = sqlite ]; then
    export DB_DATABASE="${DB_DATABASE:-/app/database/database.sqlite}"
    mkdir -p "$(dirname "$DB_DATABASE")"
    touch "$DB_DATABASE"
fi

# Never continue serving an application whose migrations or caches failed.
php artisan config:clear
php artisan migrate --force

# Explicit opt-in bootstrap never resets an existing administrator or content.
if [ "${SEED_ON_DEPLOY:-false}" = true ]; then
    php artisan portfolio:bootstrap-deployment
else
    php artisan portfolio:restore-deployment-assets
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

exec "$@"
