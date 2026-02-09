FROM php8.2-fpm

RUN apt-get update && apt-get install -y 
    libpng-dev libonig-dev libxml2-dev zip unzip git curl

RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composerlatest usrbincomposer usrbincomposer

WORKDIR varwww
COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-datawww-data varwwwstorage varwwwbootstrapcache

CMD php artisan serve --host=0.0.0.0 --port=80