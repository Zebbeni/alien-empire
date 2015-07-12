# alien-empire
A strategy boardgame written for web using node.js and socket.io

### To deploy: 
* ~alien-empire >> modulus deploy
* project name: "Alien Empire"

### To set up mongodb locally:
* npm install mongodb
* brew install mongodb
* in ~/.bashrc, export PATH=*mongodb-install-directory*/bin:$PATH
 * (source ~/.bashrc)
* sudo mkdir -p /data/db
* sudo chown -R `id -u` /data/db
* mongod (starts local server, running node database.js in separate terminal should be able to hit 'mongodb://localhost:27017/alien-empire-db')  
