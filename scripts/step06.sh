#!/bin/bash
#
# Build and execute Docker image for additional steps.

docker kill $(docker ps -aq)
docker rm $(docker ps -aq)

docker rmi truanisei/static_http
docker rmi truanisei/dynamic_http
docker rmi truanisei/traefik
docker rmi $(docker images -q -f dangling=true)

docker build -t truanisei/static_http $docker_dir/static_http/
docker build -t truanisei/dynamic_http $docker_dir/dynamic_http/
docker build -t truanisei/traefik $docker_dir/traefik/

# Need to bind docker socket for Traefik.
docker run -d -p 8080:80 -v /var/run/docker.sock:/var/run/docker.sock truanisei/traefik

for i in $(seq 1 $(shuf -i1-10 -n1))
do
    docker run -d truanisei/static_http
done

for i in $(seq 1 $(shuf -i1-10 -n1))
do
    docker run -d truanisei/dynamic_http
done

echo "Step 06: Port 80 forwarded to 8080."
