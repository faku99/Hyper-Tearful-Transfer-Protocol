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

We first tried the method shown in the webcasts but we weren't really happy with the result as it required to inspect the containers and it use a pretty *dirty* solution to create the `.conf` file.
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
