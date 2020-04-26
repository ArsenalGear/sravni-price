FROM php:7.2-fpm-stretch
WORKDIR /var/www/
#Скопировать файлы проекта в рабочую директорию
COPY . /var/www/

RUN apt-get update
RUN apt-get install -y git
RUN apt-get install zip unzip
# Install Laravel dependencies
RUN apt-get install -y \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libmcrypt-dev \
        libpng-dev \
        libxpm-dev \
        libvpx-dev \
        && docker-php-ext-configure gd \
            --with-freetype-dir=/usr/lib/x86_64-linux-gnu/ \
            --with-jpeg-dir=/usr/lib/x86_64-linux-gnu/ \
            --with-xpm-dir=/usr/lib/x86_64-linux-gnu/ \
            --with-vpx-dir=/usr/lib/x86_64-linux-gnu/ \
        && docker-php-ext-install gd

# Install PHP "exif" extension – http://php.net/manual/en/book.exif.php
RUN apt-get install -y libexif-dev
RUN docker-php-ext-install exif

#Install sockets dependencies
RUN apt-get update -qq && \
    apt-get install -y -qq libzmq3-dev
RUN pecl install zmq-beta \
    && docker-php-ext-enable zmq

#Install mysql dependencies
RUN docker-php-ext-install pdo_mysql

RUN curl -sS https://getcomposer.org/installer | php
RUN mv composer.phar /usr/local/bin/composer

#composer install необходимо запустить только после разворачивания контейнера
