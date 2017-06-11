# Hyper Tearful Transfer Protocol

## Introduction

For the 5th RES lab, we were asked to get familiar with the HTTP protocol and infrastructure through several tasks.

This repository contains our solutions to the specifications given [here](https://github.com/SoftEng-HEIGVD/Teaching-HEIGVD-RES-2017-Labo-HTTPInfra).
It is composed of folders and files, which are:
- `docker/`: contains all docker images needed for this lab assignment.
- `docker_ui/`: contains a management UI for Docker.
- `scripts/`: scripts used by `start.sh`. They **MUST NOT** be executed directly.
- `start.sh`: script used to easily launch containers for each step.

## Step 1: Static HTTP server with apache httpd

In this step, we will setup a static Apache httpd server and run it into a Docker image. The goal is to have a nice looking site (using bootstrap templates) which we can access through a web browser and serving static content.

Files can be found [here](docker/static_http).

### Configuration

We chose [php:apache](https://hub.docker.com/_/php/) as our base image. It packs all the tools we need for our static httpd server (file system already configured, php and apache installed, ...).

We also had to choose a bootstrap template so our site has a nice looking visual. To do so, we used [Creative](https://startbootstrap.com/template-overviews/creative/). We modified it a bit so it uses CDN links instead of vendor scripts for loading its dependencies.

### Dockerfile

As we are using an almost ready-to-go image, there wasn't a lot to do in the Dockerfile.

```Dockerfile
FROM php:apache

COPY src /var/www/html
```

As you can see, we simply copy the folder containing the sources into the folder `/var/www/html` from which Apache will display content.

### Launching and testing

To launch the website, simply execute the script `start.sh`, select step 01 and navigate to http://127.0.0.1:8080.

You should be greeted by an astonishing single-page website that fulfill the requested assignment for this step.

## Step 2: Dynamic HTTP server with express.js

In this step, we will setup a dynamic HTTP server written with [Node.js](https://nodejs.org/) using the [express.js](https://expressjs.com/) node framework.

This server will be used to generate random content and serve it as a JSON payload. The content will be an array of random words whose acronym is HTTP.

Files can be found [here](docker/dynamic_http/).

### Configuration

We chose [node](https://hub.docker.com/_/node/) as our base image. It is required since our HTTP server is based on this technology. We also used the [Datamuse API](http://www.datamuse.com/api/) through a NPM module called [datamuse](https://www.npmjs.com/package/datamuse).

Finally, to make four requests in parallel and wait for their result, we used the NPM module [async](https://www.npmjs.com/package/async).

The JSON payload has the following form:
```JSON
["Honcho","Tamarind","Take","Pooch"]
```

### Dockerfile

```Dockerfile
FROM node:latest

COPY src /opt/app

WORKDIR /opt/app
RUN npm install

CMD ["node", "/opt/app/server.js"]
```

This Dockerfile simply copies source files to `/opt/app/`. Then, we set the working directory as `/opt/app/` and run `npm install` to install NPM dependencies.

Once done, the server is launched.

### Launching and testing

To launch the server, simply execute the script `start.sh`, select step 02 and navigate to http://127.0.0.1:8080/.

You should receive an array of words whose acronym is HTTP, which fulfill the requested assignment for this step. To refresh the data, simply reload the page.

## Step 3: Reverse proxy with apache (static configuration)

In this step, we will configure Apache to be used as a reverse proxy to serve both our servers (apache and express.js) developed in the first two steps.

The purpose of a reverse proxy is to offer one entry point for multiple paths and IPs. In our case, it will be a running container and the only one accessible outside of the Docker machine. Our static and dynamic servers will be running too but we don't want them to be accessed directly. So we will connect to the reverse proxy and it will serve us the content we want from the other containers.

Files can be found [here](docker/static_revproxy).

### Configuration

We configured our proxy so that at the URL
- `/`, static HTTP server is served (step 01),
- `/api/random/`, dynamic HTTP server is served (step 02).

To do so, we had to write to following `000-truanisei.conf`, which is the file holding the configuration for the host `truanisei.res.ch`:

```ApacheConf
<VirtualHost *:80>
    ServerName truanisei.res.ch

    ProxyPass "/api/random/" "http://172.17.0.3:80/"
    ProxyPassReverse "/api/random/" "http://172.17.0.3:80/"

    ProxyPass "/" "http://172.17.0.2:80/"
    ProxyPassReverse "/" "http://172.17.0.2:80/"
</VirtualHost>
```

You can see that the servers IPs are hard-coded. That's because we have a static configuration, which will be made better in the fifth step.

**Beware**: Because of the static configuration, containers have to be launched in this specific order:
1. `truanisei/static_http`
2. `truanisei/dynamic_http`
3. `truanisei/static_revproxy`

To access this reverse proxy, you might want to add this line to your `hosts` file:
```
172.17.0.1      truanisei.res.ch
```
If you're using Windows or macOS, you must replace `172.17.0.1` by `192.168.99.100`.

### Dockerfile

```Dockerfile
FROM php:apache

RUN a2enmod proxy
RUN a2enmod proxy_http

COPY ./000-truanisei.conf /etc/apache2/sites-available/

RUN a2ensite 000-truanisei*
```

This Dockerfile is quite simple. We enable Apache modules `proxy` and `proxy_http`. Then, we copy the configuration explained above to the path `/etc/apache2/sites-available` which, speaking for itself, contains configuration for available sites. Finally, we enable the site whose configuration matches `000-truanisei*`.

### Launching and testing

To launch the reverse proxy, simply execute the script `start.sh`, select step 03 and navigate to http://truanisei.res.ch:8080/. You will land on the page we first saw at step 01.

You could also browse http://truanisei.res.ch:8080/api/random/ and be greeted by an HTTP acronym as saw in previous step.

## Step 4: AJAX requests with JQuery

This step's purpose is to link our static and dynamic content. We will use AJAX requests with [JQuery](https://jquery.com/) to do so. It will dynamically refresh the static content with the payload received from the dynamic server at a fixed rate. In our case, the header text will change with different words forming the HTTP acronym.

We will use an AJAX request made with the JQuery library to retrieve content from the backend API and change the header text.

Files can be found [here](docker/ajax_http).

### Configuration

The main *challenge* of this step was to write the JQuery script. The first thing we had to find was the attribute `id` of the HTML element handling the header text. By quickly looking into `index.html`, we found out that is was `#homeHeading`.

```javascript
$(function() {
    function getAcronym() {
        $.getJSON("/api/random/", function(acronym) {
            var message = acronym.join(' ');

            $("#homeHeading").text(message).css('color', 'black');;
        });
    };

    setInterval(getAcronym, 3000);
});
```

Every three seconds, this script simply asks the backend a new value for the acronym and replaces the header text by the result. It also makes the text black.

The last thing to do was to include this script into the `index.html` file so it can be loaded and ran upon page loading.

### Dockerfile

The Dockerfile is exactly the same as the first step.

### Launching and testing

To launch the website, simply execute the script `start.sh`, select step 04 and navigate to http://truanisei.res.ch:8080/. You'll see that the header text is updated every three seconds with a new acronym.

By opening the *Developer console* in your browser, we see that AJAX requests are made by the browser and we can view their content.

## Step 5: Dynamic reverse proxy configuration

In this step, we will get rid of the the reverse proxy static configuration. The goal is to have a way to launch the containers in the order we want and having a working reverse proxy without needing to rebuild the image.

Files can be found [here](docker/dynamic_revproxy).

### Configuration

We first tried the method shown in the webcasts but we weren't really happy with the result as it required to inspect the containers and it uses a pretty *dirty* solution to create the `.conf` file.
We chose to work with the network offered by Docker and its internal DNS.

We can create multiple [Docker networks](https://docs.docker.com/engine/userguide/networking/#user-defined-networks) in the Docker machine. The container can join this network with a name. Then the network has an internal DNS which is useful in our case so we don't have to bother with containers IPs.

```bash
docker build -t truanisei/ajax_http ./ajax_http/
docker build -t truanisei/dynamic_http ./dynamic_http/
docker build -t truanisei/dynamic_revproxy ./dynamic_revproxy/

# Check if network exists.
docker network inspect resnetwork &> /dev/null
if (( $? == "1" )); then
    docker network create resnetwork
fi

docker run -d --name=proxy --network resnetwork -p 8080:80 truanisei/dynamic_revproxy
docker run -d --name=httpnode --network resnetwork truanisei/ajax_http
docker run -d --name=apinode --network resnetwork truanisei/dynamic_http
```

First we create our own network named `resnetwork` if it doesn't already exist. It allows us to enable DNS resolution, thing the default Docker network doesn't do.
We see the `--network resnetwork` option in the run command.

To make it work with the DNS, we had to modify our previous configuration file (the static one).

```ApacheConf
<VirtualHost *:80>
    ServerName truanisei.res.ch

    ProxyPass "/api/random/" "http://apinode:3000/api/random/" disablereuse=On
    ProxyPassReverse "/api/random/" "http://apinode:3000/api/random/" disablereuse=On

    ProxyPass "/" "http://httpnode:80/" disablereuse=On
    ProxyPassReverse "/" "http://httpnode:80/" disablereuse=On
</VirtualHost>
```
We had to replace the hard-coded IPs by the names we set when typing the `run` command.

The `disablereuse=On` is a precaution took so the DNS doesn't use its cache to resolve IP.

### Dockerfile

The Dockerfile is exactly the same as the third step.

### Launching and testing

To launch the reverse proxy, simply execute the script `start.sh`, select step 05 and navigate to http://truanisei.res.ch:8080/. Everything should be working fine even if the Docker containers hasn't been launched in a specific order.

To verify this behavior, simply modify the script `scripts/step05.sh` and edit last lines to change the order of the containers.

## Additional step: Load balancing and dynamic cluster management

<p align="center">
    <img width="40%" src="https://github.com/containous/traefik/raw/master/docs/img/traefik.logo.png" alt="Træfik" title="Træfik" />
</p>

By searching for a solution to this additional step, we found [Træfik](https://traefik.io). As well as having an awesome logo, Træfik is simple to use and perfectly answers our needs.

Files can be found [here](docker/traefik).

### Configuration

We built a Docker image named `truanisei/traefik` which will behave as our reverse proxy. This Docker image has as base [traefik](https://hub.docker.com/_/traefik/).

The first thing to do is to configure Træfik. To do so, we created a file named `traefik.toml` with the following content:

```TOML
# Web configuration backend
[web]
address = ":9000"

# Docker configuration
[docker]
domain = "truanisei.res.ch"
watch = true
```

With this configuration, we tell Træfik to offer a web management UI on the port 9000. Then we modify its Docker configuration with our domain and specify the `watch` option to `true`.

With `watch` option enabled, Træfik will listen on the Docker socket and manage dynamic cluster. It's as simple as that.

Now that dynamic cluster management has been taken care of, we have to configure the Træfik's load balancer.

The load balancer is configured in the Dockerfile of the images we built for steps 02 and 04. We simply have to add environment variables. The rest will be handled by Træfik.

Here's the new Dockerfile for the image `truanisei/ajax_http`:

```Dockerfile
FROM php:apache

# Traefik configuration
LABEL "traefik.backend"="httpnode"
LABEL "traefik.backend.loadbalancer.sticky"="false"
LABEL "traefik.frontend.rule"="PathPrefix: /"
LABEL "traefik.port"="80"

COPY src /var/www/html
```

In this configuration, we define a name for the nodes (`httpnode`), use sticky sessions or not (`false` for this image), the `PathPrefix` and the port.

And here's the new Dockerfile for the image `truanisei/dynamic_http`:

```Dockerfile
FROM node:latest

COPY src /opt/app

WORKDIR /opt/app
RUN npm install

# Traefik configuration
LABEL "traefik.backend"="apinode"
LABEL "traefik.backend.loadbalancer.sticky"="true"
LABEL "traefik.frontend.rule"="PathPrefixStrip: /api/random"
LABEL "traefik.port"="80"

CMD ["node", "/opt/app/server.js"]
```

In this configuration, we also define a name for the nodes, enable sticky sessions and the `PathPrefixStrip`, which is relative to the `PathPrefix` we set previously.

### Launching and testing

To launch the reverse proxy, simply execute the script `start.sh`, select step 06 and navigate to http://truanisei.res.ch:8080/. It will show the expected page.

You can also browse http://truanisei.res.ch:9000/ to access Træfik's management UI. It will be automatically refreshed if a container is killed.

To test and view traffic, listen to the Docker container running `truanisei/traefik` and enjoy debug logging.

## Additional step: Docker Management UI

This additional step required us to develop a management UI for Docker.

### Configuration

The backend was written with Node.js and the frontend with Angular.js and Foundation framework.

Here are the API routes:

| Method | URL | Description |
| --- | --- | --- |
| `GET` | `/api/images/list` | List of images |
| `GET` | `/api/containers/list` | List of containers |
| `POST` | `/api/containers/create` | Create a container from `{ Image: imageName }` payload |
| `POST` | `/api/containers/killall` | Kill all containers |
| `POST` | `/api/containers/:id/kill` | Kill container with `id` |
| `POST` | `/api/containers/:id/start` | Start container with `id` |
| `DELETE` | `/api/containers` | Remove all stopped containers |
| `DELETE` | `/api/containers/:id` | Remove container with `id` |

### Launching and testing

To launch the UI, open a terminal from this directory and execute the following commands:

```bash
cd docker_ui
npm install
node server.js
```

Browse http://127.0.0.1:3000/ and play with it.
