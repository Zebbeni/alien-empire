socket.on('connect', function() {
    console.log('connected');
});

socket.on('login success', function(users, userid, username, messages, games, fn) {
    fn('client entered lobby');
    clientId = userid;
    clientName = username;
    moveToLobby();
    updateLobby(users, messages, games);
});

socket.on('leave lobby', function(fn) {
    fn('client has left lobby');
    leaveLobby();
});

socket.on('user login', function(users, messages) {
    updateLobby(users, messages, false);
});

socket.on('user logout', function(users, messages) {
    updateLobby(users, messages, false);
});

socket.on('new chat message', function(messages) {
    updateLobby(false, messages, false);
});

socket.on('new game added', function(games) {
    updateLobby(false, false, games);
});

socket.on('self joined game', function(game) {
    clientGame = game;
    updateGameStage();
});

socket.on('user joined game', function(games) {
    updateLobby(false, false, games);
});

// socket.on('self left game staging', function() {
// });

// socket.on('user left game staging', function(gameid, players) {
//     clientGame.players = players;
//     updateGameStage();
// });

// socket.on('user to lobby from staging', function(gameid, players) {
    
// });