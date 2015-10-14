
var showInterface = function() {
	$('#button-bar-div')[0].style.visibility = "visible";
	$("#build-recruit-buttons-div")[0].style.visibility = "visible";
	$('#game-messages-wrapper-div')[0].style.visibility = "visible";
	createPlayersMenu();
};

/**
 * Called when server receives loading done message.
 *
 * Recevies initialized game object from server, assigns to clientGame,
 * draws the board, draws the UI, and shows the correct turn menus 
 */
var createAll = function( content ) {

	updateClientGame(content);
	initializePlayerAttributes();
	setGlobals();
	drawBoard();
	displayGameMessages();
	createInterface();
	showInterface();
	toggleTurnMenu();
	updateBoardInteractivity();

};

/**
 * Receives new game from socket, updates clientGame, redraws the board,
 * updates player stats menus and animates the correct turn menus in/out 
 */
var updateAll = function( content ) {

	console.log("updating all");
	updateClientGame( content );
	updateBoard();
	displayGameMessages();
	updatePlayerStatsMenus();
	toggleTurnMenu();
	updateBoardInteractivity();

};

/**
 * Returns true if object type is 
 */
var isSpaceObject = function(objecttype) {
	return (objecttype == OBJ_BASE || objecttype == OBJ_FLEET);
};

var isBuildTypeAction = function(actiontype) {
	return (actiontype == ACT_PLACE || actiontype == ACT_BUILD);
};

var isUpgradeObject = function(objecttype) {
	return (objecttype == OBJ_FACTORY || objecttype == OBJ_EMBASSY);
};

/**
 * Returns true if all required fields of the pending action
 * have been filled.
 */
var isPendingActionReady = function() {

	var actiontype = pendingAction.actiontype;

	if ( actiontype ) {
		var requirements = ACTION_REQUIREMENTS[ actiontype ];

		// make sure pendingAction has all required attributes
		for (var i = 0; i < requirements.length; i++) {

			if ( pendingAction[ requirements[i] ] == undefined){
				return false;
			}
		}
	} 
	else {
		return false;
	}
	return true;
};

var initializePlayerAttributes = function() {
	clientColor = clientGame.game.players.indexOf( clientId );
	clientTurn = clientGame.game.players.indexOf( clientId );
};

// Updates local copy of game with server's version
var updateClientGame = function( content ) {
	$.extend(true, clientGame, content );
};

var updateGameMessages = function( newMsg ) {
	clientGame.messages.push( newMsg );
	displayGameMessages();
};