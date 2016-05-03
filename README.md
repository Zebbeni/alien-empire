# Alien Empire
A multiplayer boardgame using Node.js, Socket.io and CreateJS
![Screenshot](https://s3-us-west-2.amazonaws.com/alien-empire/github/github_image1.jpg "Alien Empire Login")
![Screenshot](https://s3-us-west-2.amazonaws.com/alien-empire/github/github_image2.jpg "Alien Empire In-Game")

## Running locally:
1. Install npm dependencies
2. >> node app.js
3. In browser, navigate to localhost:8080

## Running in offline mode (using local art assets, not s3 server):
1. Comment out https://github.com/Zebbeni/alien-empire/blob/master/client/constants.js#L6-L7
2. Uncommment https://github.com/Zebbeni/alien-empire/blob/master/client/constants.js#L8-L9
3. >> node app.js
4. In browser, navigate to localhost:8080

## Deploying (Admins only)
1. To deploy: ~alien-empire >> modulus deploy
2. project name: "Alien Empire"
