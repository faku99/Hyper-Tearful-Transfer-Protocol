FROM php:apache

COPY ./000-truanisei.conf /etc/apache2/sites-available/

RUN a2enmod proxy
RUN a2enmod proxy_http

RUN a2ensite 000-truanisei*
