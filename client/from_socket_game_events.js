socket.on('room game starting', function(gameInfo) {

    game_init(gameInfo);
    addProgressBar();
    moveToGame( load_assets );

});

socket.on('turn update', function(content) {
    $.extend(true, clientGame.game, content.game);
    toggleTurnMenu();
});

socket.on('game end', function(content) {
    clientGame = null;
    set_globals();
    moveToLobby();
});

socket.on('illegal action', function(content) {
    toggleIllegalActionMenu();
});