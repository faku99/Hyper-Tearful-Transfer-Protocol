#!/bin/bash
#
# Build and execute Docker image for step 02.

docker kill $(docker ps -aq)
docker rm $(docker ps -aq)

docker rmi truanisei/dynamic_http
docker rmi $(docker images -q -f dangling=true)

docker build -t truanisei/dynamic_http $docker_dir/dynamic_http/

docker run -d -p 3000:3000 truanisei/dynamic_http

echo "Step 02: Port 80 forwarded to 8080."
