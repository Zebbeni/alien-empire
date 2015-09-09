socket.on('room game starting', function(gameInfo) {


    $.extend(true, clientGame, gameInfo); // should actually receive the starting state of the game
                        // OR we could trigger the game interface to come up while
                        // the sferver initializes and sends the game info

    console.log(clientGame);
    
    game_init();
    // THIS IS WHERE WE TRIGGER THE CLIENT TO START THE GAME UX
    moveToGame();

    toggleTurnMenu();
});

socket.on('turn end', function(action, update) {
    $.extend(true, clientGame.game, update);
    toggleTurnMenu();
});

socket.on('game end', function(action, update) {
    clientGame = null;
    moveToLobby();
});

socket.on('illegal action', function(action, update) {
    $.extend(true, clientGame.game, update);
    toggleIllegalActionMenu();
})