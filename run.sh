#!/bin/bash
if [ -z "$(docker images | grep 'cessor/peter')" ]; then
    docker build -t cessor/peter -f Dockerfile .
fi
docker run --name peter -d -p 443:443 -p 80:80 --link mongodb:mongodb -v "$(pwd)"/src:/var/peter -v /etc/letsencrypt:/etc/letsencrypt cessor/peter
