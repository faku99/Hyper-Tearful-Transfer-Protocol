#!/bin/bash
#
# Build and execute Docker image for step 01.

docker kill $(docker ps -aq)
docker rm $(docker ps -aq)

docker rmi truanisei/static_http
docker rmi $(docker images -q -f dangling=true)

docker build -t truanisei/static_http $docker_dir/static_http/

docker run -d -p 8080:80 truanisei/static_http

echo "Step 01: Port 80 forwarded to 8080."
