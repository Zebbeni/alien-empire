socket.on('connect', function() {
    console.log('connected');
});

socket.on('login failed already logged in', function(username) {
    alert('this user has already logged in');
});

// Get starting arrays of users, messages, and games. Draw lobby
socket.on('login success', function(users, userid, username, newMsg, games, fn) {
    fn('client entered lobby');
    status = USR_ONLINE;
    clientId = userid;
    clientName = username;
    initializeLobby(users, newMsg, games);

    // hide login elements, show lobby
    leaveLogin();
    moveToLobby();

    updateLobby(false, false, false);
});

socket.on('leave lobby', function(fn) {
    fn('client has left lobby');

    // hide lobby elements, show login
    leaveLobby();
    moveToLogin();
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

socket.on('new game added', function(users, games) {
    updateLobby(users, false, games);
});

socket.on('self joined game', function(users, game) {
    status = USR_STAGING;
    updateLobby(users, false, game);
    initializeGameStage(game);
    updateGameStage(false, false, false);
    moveToGameStage();
});

socket.on('user joined game', function(users, game) {
    updateLobby(users, false, game);
});

// This should only get sent to users in the correct staging room.
socket.on('room user joined staging', function(players, newMsg) {
    updateGameStage(players, newMsg, false);
});

socket.on('room user ready staging', function(ready) {
    updateGameStage(false, false, ready);
});

socket.on('room requested players changed', function(newMsg, requested, ready) {
    clientGame.requestedPlayers = requested;
    updateGameStage(false, newMsg, false);
});

socket.on('room requested points changed', function(newMsg, requested, ready) {
    clientGame.requestedPoints = requested;
    updateGameStage(false, newMsg, false);
});

socket.on('self left game staging', function(users, game) {
    status = USR_ONLINE;
    clientGame = null;
    hideGameStage();
    all_games[ game.gameid ] = game;
    updateLobby(users, false, game);
});

// This should only get sent to users in the correct staging room.
socket.on('room user left staging', function(players, newMsg, ready) {
    updateGameStage(players, newMsg, ready);
});

socket.on('game starting', function(users, game) {
    updateLobby(users, false, game);
});

socket.on('user left game', function(users, game) {
    all_games[ game.gameid ] = game;
    updateLobby(users, false, game);
});

socket.on('requested players changed', function(game) {
    all_games[ game.gameid ] = game;
    updateLobby(false, false, game);
});