socket.on('room game starting', function(gameInfo) {

    game_init(gameInfo);
    addProgressBar();
    moveToGame( load_assets );

});

socket.on('turn update', function(content) {
    updateClientGame(content);
    toggleTurnMenu();
});

socket.on('loading done', function(content) {

	createAll( content );

});

socket.on( ACT_ENGLISH[ ACT_PLACE ], function(content) {

	updateAll( content );

});

socket.on( ACT_ENGLISH[ ACT_BUILD ], function(content) {

	updateAll( content );

});

socket.on('game end', function(content) {
    clientGame = null;
    set_globals();
    moveToLobby();
});

socket.on('illegal action', function(response) {
    toggleIllegalActionMenu(response);
});