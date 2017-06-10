FROM node:latest

COPY src /opt/app

WORKDIR /opt/app
RUN npm install

# Traefik configuration
LABEL "traefik.backend"="apinode"
LABEL "traefik.backend.loadbalancer.sticky"="true"
LABEL "traefik.frontend.rule"="PathPrefixStrip: /api/random"
LABEL "traefik.port"="3000"

CMD ["node", "/opt/app/server.js"]
