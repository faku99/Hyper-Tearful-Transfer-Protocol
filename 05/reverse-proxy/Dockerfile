FROM php:7.1.5-apache

COPY conf/ /etc/apache2/sites-available/

COPY apache2-foreground.sh /usr/local/bin/apache2-foreground

COPY templates /var/apache2/templates


RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
