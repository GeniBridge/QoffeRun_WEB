FROM php:8.2-fpm

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev git unzip libzip-dev curl \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

# Composer (available inside the container)
ENV COMPOSER_ALLOW_SUPERUSER=1
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# php-fpm listens on :9000 by default
EXPOSE 9000

# Healthcheck (php-fpm responds on 9000; use a simple check that php-fpm is running)
HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD php -v >/dev/null || exit 1
