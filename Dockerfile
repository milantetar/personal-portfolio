# ==========================================
# Base: FrankenPHP + Required PHP Extensions
# ==========================================
FROM dunglas/frankenphp:1-php8.4-alpine AS base

WORKDIR /app

# Install PHP extensions required by Laravel & strip setcap for Render
RUN apk add --no-cache libcap libstdc++ ca-certificates && \
    setcap -r /usr/local/bin/frankenphp && \
    install-php-extensions \
    pdo_sqlite \
    pdo_pgsql \
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
COPY docker/php.ini /usr/local/etc/php/conf.d/zz-portfolio.ini

# ==========================================
# Stage 1: Build React, Vite & Wayfinder Assets
# ==========================================
FROM base AS builder

# Use a known Node major instead of the moving Alpine Node package.
COPY --from=node:22-alpine /usr/local/ /usr/local/
RUN npm install -g pnpm@10

# 1. Install PHP dependencies (needed for `php artisan wayfinder:generate`)
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist

# 2. Install JS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
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
    pnpm build && \
    composer dump-autoload --no-dev --optimize

# ==========================================
# Stage 2: Production PHP Application
# ==========================================
FROM base

# Copy application code and compiled Vite assets
COPY . .
COPY --from=builder /app/public/build ./public/build
COPY --from=builder /app/vendor ./vendor

# Install production PHP dependencies
RUN composer check-platform-reqs --no-dev

# Prepare directories and permissions
RUN mkdir -p storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/app/public \
    storage/app/database \
    database \
    bootstrap/cache && \
    ln -s /app/storage/app/public public/storage && \
    addgroup -S portfolio && adduser -S -G portfolio portfolio && \
    mkdir -p /config/caddy /data/caddy && \
    chown -R portfolio:portfolio storage bootstrap/cache database /config /data && \
    chmod -R u=rwX,g=rX,o= storage bootstrap/cache database

# Entrypoint setup
COPY Caddyfile /etc/caddy/Caddyfile
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

ENV APP_ENV=production APP_DEBUG=false LOG_CHANNEL=stderr LOG_LEVEL=info INERTIA_SSR_ENABLED=false
ENV XDG_CONFIG_HOME=/config XDG_DATA_HOME=/data
# Pass GEMINI_API_KEY, CLOUDINARY_URL and DB_URL at runtime with --env-file
# or your hosting provider's secret settings. Never use ARG/ENV for secret values.
USER portfolio

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
