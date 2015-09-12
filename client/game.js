var stage, board, planets, tiles, scale, move_distance, sWid, is_dragging, lastMouse;
var resizeTimer;

$(document).ready(function() {
	stage = new createjs.Stage("gameCanvas");

	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	// start drag event
	stage.on("stagemousedown", function(evt){
		lastMouse.x = evt.stageX;
		lastMouse.y = evt.stageY;
		is_dragging = true;
	});

	// end drag event
	stage.on("stagemouseup", function(evt){
		is_dragging = false;
	});

	// move board relative to mouse movement
	stage.on("stagemousemove", function(evt){
		if (board && is_dragging) {
			board.x += (evt.stageX - lastMouse.x);
			board.y += (evt.stageY - lastMouse.y);
			lastMouse.x = evt.stageX;
			lastMouse.y = evt.stageY;
		}
		stage.update();
	});
});

/**
 * Periodically checks to see if window has been resized. 
 * Calls setCanvasSize again if so.
 */ 
$(window).resize(function () { 
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(setCanvasSize, 50);
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
			moveBoard(-1, 0);
			break;
		case 38: // up arrow
			moveBoard(0, -1);
			break;
		case 39:
			moveBoard(1, 0);
			break;
		case 40:
			moveBoard(0, 1);
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
	load_assets();
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
	move_distance = 5;
	sWid = 212;
	is_dragging = false;
	lastMouse = { x:0, y:0 };
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

	moveToGame(); // only when game board is done being loaded and drawn, move to game
};

/**
 * Changes global variable scale (within accepted parameters)
 * Updates board when done
 */
var zoomBoard = function(magnify) {
	scale *= magnify;
	scale = Math.min(scale, 1);
	scale = Math.max(scale, 0.6);

	board.scaleX = scale;
	board.scaleY = scale;

	centerBoard();

	stage.update();
};

/**
 * Centers board in browser window
 */
var centerBoard = function() {
	var boardWidth = 7 * sWid * scale;
	var boardHeight = 7 * sWid * scale;
	board.x = (window.innerWidth - boardWidth) / 2.0;
	board.y = (window.innerHeight - boardHeight) / 2.0;
	stage.update();
};

/**
 * Moves board given right and down shifts
 */
var moveBoard = function(right, down) {
	board.x = board.x + (right * move_distance);
	board.y = board.y + (down * move_distance);

	stage.update();
};

/**
 * sets Canvas size (usually on window resize)
 * re-centers the game board and updates the stage
 */
var setCanvasSize = function() {
	if(stage) { // make sure stage exists before trying this
		var gameCanvas = document.getElementById('gameCanvas');
		var ctx = gameCanvas.getContext("2d");
		ctx.canvas.width  = window.innerWidth;
		ctx.canvas.height = window.innerHeight;

		centerBoard();

		stage.update();
	}
};

