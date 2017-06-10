# Step 3: Reverse proxy with apache (static configuration)
In this step, we will configure a php apache to be used as a reverse proxy to serve our both server (static and dynamic) developped in the steps 1 and 2.
The purpose of a reverse proxy is to offer one entry point for multiple path and IP. In our case it will be a running container and the only one accessible outside of the Docker machine. Our static and dynamic servers will be running too but we don't want them to be accessed directly. So we will connect to the reverse proxy and it will serve us the content we want from the other containers.

## The Docker image
In this step the docker image will need a little bit more configuration than the previous ones. In cause is the fact that we need to add our configuration files (where the virtual host is described) and enable theses configurations.

```
FROM php:7.1.5-apache

COPY conf/ /etc/apache2/sites-available/

RUN a2enmod proxy proxy_http
RUN a2ensite 000-* 001-*
```

We want to copy our files which are in the conf/ folder into the /etc/apache2/sites-available/ folder in the container.

```
<VirtualHost *:80>

ServerName truanisei.res.ch

ProxyPass "/api/random/" "http://172.17.0.3:3000/api/random/"
ProxyPassReverse "/api/random/" "http://172.17.0.3:3000/api/random/"


ProxyPass "/" "http://172.17.0.2:80/"
ProxyPassReverse "/" "http://172.17.0.2:80/"


</VirtualHost>
```

We use the ProxyPass and ProxyPassReverse to do so. It should go from the more specific to the more general (in our case `/api/random` is before `/`). It tells the container running as a reverse proxy which container should respond when a certain URL is asked. The weak point of a static configuration like this, is that we have to know the IP of the containers and they should always be the same as the ones configured. It means we have to launch the containers in a precise order and check if the docker machine set their IP corresponding with our conf.
We also modified the `000-default.conf` to redirect wrong path.
