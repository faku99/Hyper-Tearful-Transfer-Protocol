#!/bin/bash
#
# Build and execute Docker image for step 05.

docker kill $(docker ps -aq)
docker rm $(docker ps -aq)

docker rmi truanisei/ajax_http
docker rmi truanisei/dynamic_http
docker rmi truanisei/dynamic_revproxy
docker rmi $(docker images -q -f dangling=true)

docker build -t truanisei/ajax_http $docker_dir/ajax_http/
docker build -t truanisei/dynamic_http $docker_dir/dynamic_http/
docker build -t truanisei/dynamic_revproxy $docker_dir/dynamic_revproxy/

# Check if network exists.
docker network inspect resnetwork &> /dev/null
if (( $? == "1" )); then
    docker network create resnetwork
fi

docker run -d --name=proxy --network resnetwork -p 8080:80 truanisei/dynamic_revproxy
docker run -d --name=httpnode --network resnetwork truanisei/ajax_http
docker run -d --name=apinode --network resnetwork truanisei/dynamic_http

echo "Step 05: Port 80 forwarded to 8080."
