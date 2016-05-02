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

/**
 * triggered when server acknowledges the client's loading done
 * message. Sends current game object to client
 */
socket.on('loading done', function(content) {

    updateClientGame( content )
	createAll();
    updateAll();
});

/** 
 * triggered by any player action that updates the game state
 * and require all clients to be updated. msg is a string or
 * action, to be added to game messages
 */
socket.on( 'game event', function(content, msg) {

    updateClientGame( content )
	updateAll();
    updateGameMessages( msg );

});


socket.on('game end', function(content, msg) {

    updateClientGame( content )
    updateAll();
    // hide game ux elements, show lobby
});

socket.on('illegal action', function(response) {
    toggleIllegalActionMenu(response);
    if ( clientGame.game.phase == PHS_ACTIONS ){
        clearPendingAction();
    }
});

socket.on('duplicate', function(response) {
    console.log("duplicate action received by server");
});