var stage, board, planets, tiles, scale, move_distance, sWid, is_dragging;
var resizeTimer;
var lastMouse = { x:0, y:0 };
var move_distance = 5;
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

var submitTurnDone = function(name) {
    socket_submitTurnDone();
};

var toggleTurnMenu = function() {

	if( clientGame.game.turn == clientTurn ) {
    	
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

var game_init = function() {
	set_globals();
	planets = clientGame.game.board.planets;
	clientColor = clientGame.game.players.indexOf( clientId );
	clientTurn = clientGame.game.players.indexOf( clientId );
	addProgressBar();
	moveToGame();
};

/**
 * Called on game_init. Clears old game globals, re-sets defaults.
 *
 * TODO: this is a mess. We should split this into a few functions
 */
var set_globals = function() {
	stage.removeChild(board);
	planets = null;
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

	for ( var p = 0; p < planets.length; p++ ) {	

			updateTile(p);

		}

	stage.update();
};
