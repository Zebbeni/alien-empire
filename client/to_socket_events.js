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
    socket.emit('create game', 'lobby');
};

var socket_joinGame = function(gameId) {
    socket.emit('join game', gameId, function(data){
        console.log('joined game: ', data)
    });
};

var socket_sendMessageStaging = function(msg) {
    console.log('you typed', msg);
    //emit socket message here
};

var socket_readyStaging = function() {
    //emit socket message here
    console.log('you are ready for the game!');
};

var socket_leaveStaging = function() {
    // socket.emit('leave game staging', clientGame.gameid);
    console.log('you are leaving staging area');
};