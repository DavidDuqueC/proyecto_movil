FROM laravelsail/php82-composer:latest

RUN docker-php-ext-install pdo_mysql

WORKDIR /var/www/html
COPY . .

RUN composer install --no-interaction --optimize-autoloader --no-dev \
    && php artisan key:generate

EXPOSE 8001
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8001"]