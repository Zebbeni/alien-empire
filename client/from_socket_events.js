socket.on('connect', function() {
    console.log('connected');
});

// Get starting arrays of users, messages, and games. Draw lobby
socket.on('login success', function(users, userid, username, newMsg, games, fn) {
    fn('client entered lobby');
    status = 1; // 0: OFFLINE 1: LOBBY 2: STAGING 3: INGAME
    clientId = userid;
    clientName = username;
    initializeLobby(users, newMsg, games);
    moveToLobby();
    updateLobby(false, false, false);
});

socket.on('leave lobby', function(fn) {
    fn('client has left lobby');
    leaveLobby();
});

socket.on('user login', function( users, newMsg) {
    updateLobby(users, newMsg, false);
});

socket.on('user logout', function(users, newMsg) {
    updateLobby(users, newMsg, false);
});

socket.on('new chat message', function(newMsg) {
    updateLobby(false, newMsg, false);
});

socket.on('new game added', function(games) {
    updateLobby(false, false, games);
});

socket.on('self joined game', function(game) {
    status = 2; // 0: OFFLINE 1: LOBBY 2: STAGING 3: INGAME
    clientGame = game;
    updateGameStage();
});

socket.on('user joined game', function(games) {
    updateLobby(false, false, games);
});

socket.on('self left game staging', function(game) {
    status = 1;
    clientGame = null;
    hideGameStage();
    all_games[ game.gameid ] = game;
    updateLobby(false, false, game);
});

socket.on('user left game', function(game) {
    all_games[ game.gameid ] = game;
    updateLobby(false, false, game);
});

// socket.on('user left staging room', function(game) {
    
// });