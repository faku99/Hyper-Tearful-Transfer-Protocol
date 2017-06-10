FROM php:apache

# Traefik configuration
LABEL "traefik.backend"="httpnode"
LABEL "traefik.backend.loadbalancer.sticky"="false"
LABEL "traefik.frontend.rule"="PathPrefix: /"
LABEL "traefik.port"="80"

COPY src /var/www/html
