socket.on('room game starting', function(gameInfo) {

    game_init(gameInfo);
    addProgressBar();
    moveToGame( load_assets );

});

socket.on('turn update', function(content) {
	console.log("updating turn");
    $.extend(true, clientGame.game, content.game);
    toggleTurnMenu();
});

socket.on( ACT_ENGLISH[ ACT_PLACE ], function(content) {

	$.extend(true, clientGame.game, content.game);
	
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
	toggleTurnMenu();
});

socket.on( ACT_ENGLISH[ ACT_BUILD ], function(content) {

	$.extend(true, clientGame.game, content.game);
	
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
});

socket.on('game end', function(content) {
    clientGame = null;
    set_globals();
    moveToLobby();
});

socket.on('illegal action', function(response) {
    toggleIllegalActionMenu(response);
});