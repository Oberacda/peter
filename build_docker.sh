#!/bin/bash
./reset_docker.sh
docker rmi -f cessor/mongodb
docker rmi -f cessor/peter
docker build -t cessor/mongodb -f mongodb.Dockerfile .
docker build -t cessor/peter -f Dockerfile .
