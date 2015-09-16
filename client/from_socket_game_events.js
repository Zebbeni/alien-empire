socket.on('room game starting', function(gameInfo) {

    updateClientGame(gameInfo);
    game_init();
    addProgressBar();
    moveToGame();

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