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
	updateClientGame(content);
	drawBoard();
	showInterface();
	toggleTurnMenu();
});

socket.on( ACT_ENGLISH[ ACT_PLACE ], function(content) {

	updateClientGame(content);
	
	//Following is for testing purposes only:
	var action = content.action;
	var resourceid = action.resourceid;
	var objecttype = action.objecttype;
	var planetid = action.planetid;
	var userid = clientGame.game.players[ action.player ];
	var name = all_users[userid].name;

	console.log( name + " placed a " + OBJ_ENGLISH[objecttype] + 
				" on resource " + resourceid + " on " +
				clientGame.game.board.planets[planetid].name);

	updateBoard();
	updatePlayerStatsMenus();
	toggleTurnMenu();
});

socket.on( ACT_ENGLISH[ ACT_BUILD ], function(content) {

	updateClientGame(content);
	
	//Following is for testing purposes only:
	var action = content.action;
	var resourceid = action.resourceid;
	var objecttype = action.objecttype;
	var planetid = action.planetid;
	var userid = clientGame.game.players[ action.player ];
	var name = all_users[userid].name;

	console.log( name + " built a " + 
				OBJ_ENGLISH[objecttype] + " on resource " + 
				resourceid + " on " +
				clientGame.game.board.planets[planetid].name);

	console.log(clientGame.game.board.planets[planetid]);

	updateBoard();
	updatePlayerStatsMenus();
	toggleTurnMenu();
});

socket.on('game end', function(content) {
    clientGame = null;
    set_globals();
    moveToLobby();
});

socket.on('illegal action', function(response) {
    toggleIllegalActionMenu(response);
});