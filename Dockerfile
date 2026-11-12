# ==========================================
# Base: FrankenPHP + Required PHP Extensions
# ==========================================
FROM dunglas/frankenphp:1-php8.4-alpine AS base

WORKDIR /app

# Install PHP extensions required by Laravel & strip setcap for Render
RUN apk add --no-cache libcap && \
    setcap -r /usr/local/bin/frankenphp && \
    install-php-extensions \
    pdo_sqlite \
    sqlite3 \
    bcmath \
    curl \
    exif \
    fileinfo \
    gd \
    intl \
    mbstring \
    opcache \
    pcntl \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ==========================================
# Stage 1: Build React, Vite & Wayfinder Assets
# ==========================================
FROM base AS builder

# Install Node.js & pnpm for Vite build
RUN apk add --no-cache nodejs npm && \
    npm install -g pnpm@10

# 1. Install PHP dependencies (needed for `php artisan wayfinder:generate`)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist

# 2. Install JS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 3. Copy source, ensure Laravel cache paths exist, and build Vite + Wayfinder
COPY . .
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    bootstrap/cache && \
    APP_ENV=production \
    APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
    DB_CONNECTION=sqlite \
    DB_DATABASE=:memory: \
    pnpm build

# ==========================================
# Stage 2: Production PHP Application
# ==========================================
FROM base

# Copy application code and compiled Vite assets
COPY . .
COPY --from=builder /app/public/build ./public/build

# Install production PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Prepare directories and permissions
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/app/public \
    database \
    bootstrap/cache && \
    touch database/database.sqlite && \
    chmod -R 777 storage bootstrap/cache database

# Entrypoint setup
COPY Caddyfile /etc/caddy/Caddyfile
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]