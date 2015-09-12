var stage, board, planets, tiles, scale, move_distance, sWid, is_dragging;
var resizeTimer;
var lastMouse = { x:0, y:0 };
var move_distance = 5;
var sWid = 212;
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
	if( clientGame.game.players[clientGame.game.turn] == clientId) {
    	displayYourTurnMenu();
    } else {
    	hideYourTurnMenu();
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
	document.getElementById('your-turn-div').style.visibility = "hidden";
}

var displayYourTurnMenu = function() {
	document.getElementById('your-turn-div').style.visibility = "visible";
};

var game_init = function() {
	set_globals();
	planets = clientGame.game.board.planets;
	addProgressBar();
	moveToGame();
	// load_assets();
};

/**
 * Called on game_init. Clears old game globals, re-sets defaults.
 *
 * TODO: this is a mess. We should split this into a few functions
 */
var set_globals = function() {
	stage.removeAllChildren();
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

		for ( var p = 0; p < planets.length; p++ ) {	

			initTile(p);
			drawTile(p);

		}

		stage.addChild( board );
		
		zoomBoard(1); 
	}

	// moveToGame(); // only when game board is done being loaded and drawn, move to game
};

