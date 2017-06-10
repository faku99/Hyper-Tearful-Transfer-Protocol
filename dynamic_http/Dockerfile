FROM node:latest

COPY src /opt/app

WORKDIR /opt/app
RUN npm install

CMD ["node", "/opt/app/server.js"]
