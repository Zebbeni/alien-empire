// This should only get sent to users in the correct staging room.
socket.on('new game message', function(newMsg) {
    if ( clientGame.status == GAME_STAGING) {
        updateGameStage(false, newMsg);
    } 
    else {
        updateGameMessages( newMsg );
    } 
});

socket.on('room game starting', function(gameInfo) {

    updateClientGame( gameInfo );
    addProgressBar();
    moveToGame( load_assets );

});

socket.on('turn update', function(content, msg) {

    updateClientGame(content);
    toggleTurnMenu();
    updateGameMessages( msg );

});

socket.on('loading done', function(content) {

	createAll( content );

});

socket.on( 'game action', function(content, msg) {

	updateAll( content );
    updateGameMessages( msg );

});


socket.on('game end', function(content) {

	clientGame = null;
    setGlobals();

    // hide game ux elements, show lobby
    leaveGameInterface();
    moveToLobby();
});

socket.on('illegal action', function(response) {
    toggleIllegalActionMenu(response);
});