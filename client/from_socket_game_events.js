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

socket.on( ACT_ENGLISH[ ACT_RECRUIT ], function(content) {
    
    updateAll( content );

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