docker run --name peter -d -p 5000:5000 --link mongodb:mongodb -v ./src:/var/peter cessor/peter 
