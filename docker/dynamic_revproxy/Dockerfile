FROM php:apache

RUN a2enmod proxy
RUN a2enmod proxy_http

COPY ./000-truanisei.conf /etc/apache2/sites-available/

RUN a2ensite 000-truanisei*
