# Dockerfile
FROM php:8.2-apache

# Installa dipendenze
RUN apt-get update && apt-get install -y \
    git curl libpq-dev zip unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Abilita mod_rewrite
RUN a2enmod rewrite

# Configurazione Apache
COPY apache/vhost.conf /etc/apache2/sites-available/000-default.conf

# Directory lavoro
WORKDIR /var/www/html

# Installa Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Permessi
RUN chown -R www-data:www-data /var/www/html