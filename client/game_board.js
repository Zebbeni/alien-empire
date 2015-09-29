var stage, board, tiles, fleets, scale, sWid, is_dragging;
var resizeTimer;
var lastMouse = { x:0, y:0 };
var is_dragging = false;

$(document).ready(function() {

	init_stage();

	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

});

/**
 * Called from createAll in game.js after all assets are loaded. 
 * Clears old game globals, re-sets defaults.
 */
var setGlobals = function() {
	stage.removeChild(board);
	board = new createjs.Container();
	tiles = [];
	fleetshapes = {};
	scale = 0.8;
	stage.update();
};

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
			moveBoard(-1, 0, MOVE_DISTANCE);
			break;
		case 38: // up arrow
			moveBoard(0, -1, MOVE_DISTANCE);
			break;
		case 39:
			moveBoard(1, 0, MOVE_DISTANCE);
			break;
		case 40:
			moveBoard(0, 1, MOVE_DISTANCE);
			break;
	}
};

var handleClickResource = function( planetid, index ) {

	setPendingPlanet(planetid);
	setPendingResource(index);
	if ( isPendingActionReady() ) {
		displayConfirmMenu();
	}
};

var handleClickPlanet = function( planetid ) {

	setPendingPlanet(planetid);
	setPendingResource( RES_NONE );
	if ( isPendingActionReady() ) {
		displayConfirmMenu();
	}
};

/**
 * Calls init and draw functions for each tile in game board
 */
var drawBoard = function() {

	if (stage) {

		setCanvasSize();

		drawAsteroids();
		drawTiles();
		drawFleets();

		stage.addChild( board );
		
		zoomBoard(1); 
	}
};

var drawAsteroids = function() {
	var asteroids = clientGame.game.board.asteroids;

	for ( var a = 0; a < asteroids.length; a++ ) {
		drawAsteroid( asteroids[a] );
	}
};

var drawTiles = function() {
	var planets = clientGame.game.board.planets;

	for ( var p = 0; p < planets.length; p++ ) {	
		initTile(p);
		drawTile(p);
	}
};

var drawFleets = function() {

	initFleets();
	var planets = clientGame.game.board.planets;

	for ( var p = 0; p < planets.length; p++ ) {	
		updateFleets(p);
	}
};

/**
 * Calls function to turn mouse enablement on/off on different
 * createJS containers based on what action the user is in.
 */
var updateBoardInteractivity = function() {
	var planets = clientGame.game.board.planets;

	for ( var p = 0; p < planets.length; p++ ) {	

		updateTileInteractivity(p);

	}
};

/**
 * Calls update functions on each tile to update appearance, interactivity
 * based on current pending action or game event
 */
var updateBoard = function() {

	var planets = clientGame.game.board.planets;

	for ( var p = 0; p < planets.length; p++ ) {	

			updateTileInteractivity(p);
			updateTileImage(p);
			updateFleets(p);
		}

	stage.update();
};