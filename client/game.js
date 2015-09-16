var stage, board, tiles, scale, move_distance, sWid, is_dragging;
var resizeTimer;
var lastMouse = { x:0, y:0 };
var is_dragging = false;

$(document).ready(function() {

	init_stage();

	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

});

var handleKeyUp = function( e ) {
	switch (e.keyCode) {
		case 189: // dash
			zoomBoard(0.9);
			break;
		case 187: // equals (plus sign)
			zoomBoard(1.1111);
			break;
	}

};

var handleKeyDown = function( e ) {
	switch (e.keyCode) {
		case 37: // left arrow
			moveBoard(-1, 0, move_distance);
			break;
		case 38: // up arrow
			moveBoard(0, -1, move_distance);
			break;
		case 39:
			moveBoard(1, 0, move_distance);
			break;
		case 40:
			moveBoard(0, 1, move_distance);
			break;
	}
};

var handleClickResource = function( planetid, index ) {

	setPendingPlanet(planetid);
	setPendingResource(index);
	if ( isPendingActionReady() ) {
		displayConfirmMenu();
	}
	else {
		console.log("not enough info yet to create an action");
	}
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

var submitTurnDone = function(name) {
    socket_submitTurnDone();
};

var toggleTurnMenu = function() {

	// Stand in. Current logic only works if we assume we're on round 0
	if( clientGame.game.turn == clientTurn ) {
    	setPendingObject( OBJ_MINE );
    	setPendingAction( ACT_PLACE );
    	displayYourTurnMenu();
    	updateBoard();

    } else {

    	clearPendingAction();
    	hideYourTurnMenu();
    	updateBoard();

    }
};

/**
 * This should eventually be capable of showing specific messages
 * ex. Not enough resources to complete that action
 *	   That agent cannot be sent on a mission right now, etc.
 */
var toggleIllegalActionMenu = function() {
	alert("That action is not possible right now");
};

var displayConfirmMenu = function() {
	displayConfirmMessage();
	document.getElementById('confirm-action-div').style.visibility = "visible";
	$("#confirm-action-div").animate({ opacity: 1.00, top: "40%"}, 500 );
};

var hideConfirmMenu = function() {
	$("#confirm-action-div").animate({ opacity: 0.00, top: "38%"}, 500, function(){
		document.getElementById('confirm-action-div').style.visibility = "hidden";
	});
};

var confirmPendingAction = function() {
	console.log("on yeah, this is happening right now");
	hideConfirmMenu();
};

var cancelPendingAction = function() {
	console.log("nope, don't do that");
	hideConfirmMenu();
};

var displayConfirmMessage = function() {

	var message;

	var planets = clientGame.game.board.planets;
	var planet = planets[ pendingAction.planetid ];
	var planetname = planet.name;

	var index = pendingAction.resourceid;
	var resourcekind = planet.resources[index].kind;

	message = "Place a " + RES_ENGLISH[resourcekind] + " mine on " + planetname + "?";
	document.getElementById('your-action-message-div').innerHTML = message;
};

var hideYourTurnMenu = function() {
	document.getElementById('turn-done-button').style.visibility = "hidden";
	$("#your-turn-div").animate({ opacity: 0.00, top: "38%"}, 500, function(){
		document.getElementById('your-turn-div').style.visibility = "hidden";
	});
};

/**
 * Display your turn menu (and fade back out after a few seconds)
 */
var displayYourTurnMenu = function() {
	displayTurnHelpMessage();
	document.getElementById('your-turn-div').style.visibility = "visible";
	document.getElementById('turn-done-button').style.visibility = "visible";
	$("#your-turn-div").animate({ opacity: 1.00, top: "40%"}, 500, function() {
		$("#your-turn-div").delay(3000).animate({ opacity: 0.00, top: "38%"}, 500, function(){
			document.getElementById('your-turn-div').style.visibility = "hidden";
		});
	});
};

/**
 * Displays an extra message beneath the 'your turn' div telling the player
 * what to do, based on the round #
 */
var displayTurnHelpMessage = function() {
	var message;
	switch(clientGame.game.round) {
		case 0:
			message = "Place a starting mine on any available resource";
			break;
		default:
			message = "";
			break;
	}
	document.getElementById('your-turn-help-div').innerHTML = message;
};

// Updates local copy of game with server's version
var updateClientGame = function( gameInfo ) {
	$.extend(true, clientGame, gameInfo);
};

var game_init = function() {
	set_globals();
	clientColor = clientGame.game.players.indexOf( clientId );
	clientTurn = clientGame.game.players.indexOf( clientId );
};

/**
 * Called on game_init. Clears old game globals, re-sets defaults.
 *
 * TODO: this is a mess. We should split this into a few functions
 */
var set_globals = function() {
	stage.removeChild(board);
	board = new createjs.Container();
	tiles = [];
	scale = 0.8;
	stage.update();
};

/**
 * Calls init and draw functions for each tile in game board
 */
var drawBoard = function() {

	if (stage) {

		setCanvasSize();

		var asteroids = clientGame.game.board.asteroids;

		for ( var a = 0; a < asteroids.length; a++ ) {
			drawAsteroid( asteroids[a] );
		}

		var planets = clientGame.game.board.planets;

		for ( var p = 0; p < planets.length; p++ ) {	

			initTile(p);
			drawTile(p);

		}

		stage.addChild( board );
		
		zoomBoard(1); 
	}
};

/**
 * Calls update functions on each tile to update appearance, interactivity
 * based on current pending action or game event
 */
var updateBoard = function() {
	
	var planets = clientGame.game.board.planets;

	for ( var p = 0; p < planets.length; p++ ) {	

			updateTile(p);

		}

	stage.update();
};
