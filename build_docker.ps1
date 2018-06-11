&"$PSScriptroot\reset_docker.ps1"
docker rmi -f cessor/mongodb
docker rmi -f cessor/peter
docker build -t cessor/mongodb -f mongodb.Dockerfile .
docker build -t cessor/peter -f Dockerfile .