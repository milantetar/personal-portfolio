# ==========================================
# Stage 1: Build React & Vite Assets
# ==========================================
FROM node:22-alpine AS frontend
WORKDIR /app
RUN npm install -g pnpm@10
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ==========================================
# Stage 2: Production PHP Application
# ==========================================
FROM dunglas/frankenphp:1-php8.4-alpine

WORKDIR /app

# Install PHP extensions required by Laravel
RUN install-php-extensions \
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

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy application code
COPY . .
COPY --from=frontend /app/public/build ./public/build

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
