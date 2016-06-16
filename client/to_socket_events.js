// socket event emitting handlers
var socket_login = function(name) {
    socket.emit('login', name, function(data){
        console.log('received login: ', data);
    });
};

var socket_logout = function() {
    socket.emit('logout', function(data){
        console.log('received logout: ', data);
    });
};

var socket_sendMessage = function(msg) {
    socket.emit('send chat message', msg, function(data){
        console.log('received chat message: ', data);
    });
};

var socket_createGame = function() {
    socket.emit('create game');
};

var socket_joinGame = function(gameId) {
    socket.emit('join game', gameId, function(data){
        console.log('joined game: ', data)
    });
};

var socket_sendGameMessage = function(msg) {
    socket.emit('send game message', msg, function(data) {
        console.log('received staging message', data);
    });
};

var socket_readyStaging = function() {
    socket.emit('ready game staging', function(data) {
        console.log('recieved ready notification', data);
    });
};

var socket_leaveStaging = function() {
    socket.emit('leave game staging', clientGame.gameid);
    console.log('you are leaving staging area');
};

var socket_returnGameToLobby = function() {
    socket.emit('return game to lobby', clientGame.gameid, function(data) {
        console.log('received return from game to lobby message', data);
    });

};

var socket_requestNumPlayersStaging = function( num ) {
    socket.emit('request num players staging', clientGame.gameid, num, function(data) {
        console.log('recieved players requested confirmation', data);
    });
};

var socket_requestPointsStaging = function( num ){
    socket.emit('request num points staging', clientGame.gameid, num, function(data) {
        console.log('recieved points requested confirmation', data);
    });
};