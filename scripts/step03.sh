#!/bin/bash
#
# Build and execute Docker image for step 03.

docker kill $(docker ps -aq)
docker rm $(docker ps -aq)

docker rmi truanisei/static_http
docker rmi truanisei/dynamic_http
docker rmi truanisei/static_revproxy
docker rmi $(docker images -q -f dangling=true)

docker build -t truanisei/static_http $docker_dir/static_http/
docker build -t truanisei/dynamic_http $docker_dir/dynamic_http/
docker build -t truanisei/static_revproxy $docker_dir/static_revproxy/

# Order is important.
docker run -d truanisei/static_http
docker run -d truanisei/dynamic_http
docker run -d -p 8080:80 truanisei/static_revproxy

echo "Step 03: Port 80 forwarded to 8080."
