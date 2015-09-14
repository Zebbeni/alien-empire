socket.on('room game starting', function(gameInfo) {


    $.extend(true, clientGame, gameInfo); // should actually receive the starting state of the game
                        // OR we could trigger the game interface to come up while
                        // the sferver initializes and sends the game info
    
    game_init();
});

socket.on('turn end', function(action, update) {
    $.extend(true, clientGame.game, update);
    toggleTurnMenu();
});

socket.on('game end', function(action, update) {
    clientGame = null;
    set_globals();
    moveToLobby();
});

socket.on('illegal action', function(action, update) {
    $.extend(true, clientGame.game, update);
    toggleIllegalActionMenu();
})