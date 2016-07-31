var stage, board, tiles, fleets, scale, sWid, is_dragging;
var lastMouse = { x:0, y:0 };
var is_dragging = false;

$(document).ready(function() {

	init_stage();

	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	loadLobby();
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
	scale = 0.60;
};

var handleKeyUp = function( e ) {
	switch (e.keyCode) {
		case 189: // dash
			zoomBoard(-0.05);
			break;
		case 187: // equals (plus sign)
			zoomBoard(0.05);
			break;
		default:
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
		default:
			break;
	}
};

/**
 * Calls init and draw functions for each tile in game board
 */
var createBoard = function() {

	if (stage) {

		initSelection();

		updateCanvasSize();

		drawAsteroids();
		drawTiles();
		drawNoFlyZones();
		drawBases();
		drawAgents();
		drawFleets();
		drawSprites();

		stage.addChild( board );
		
		scale = 0.75;
		var boardWidth = 7 * sWid * scale;
		var boardHeight = 7 * sWid * scale;
		board.x = (window.innerWidth - boardWidth) / 2.0;
		board.y = (window.innerHeight - boardHeight) / 2.0;
		board.scaleX = scale;
		board.scaleY = scale;

		fadeIn(board, 1000, false, false);
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

var drawNoFlyZones = function() {
	var planets = clientGame.game.board.planets;

	initNoFlyZones();
	updateNoFlyZones();
};

var drawBases = function() {
	var planets = clientGame.game.board.planets;

	initBases();

	for ( var p = 0; p < planets.length; p++ ) {	
		updateBases(p);
	}
};

var drawAgents = function() {

	initAgents();
	var planets = clientGame.game.board.planets;

	for ( var p = 0; p < planets.length; p++ ) {	
		updateAgents(p);
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
	updateFleetsInteractivity();
	updateBasesInteractivity();
	updateAgentsInteractivity();
};

/**
 * Calls update functions on each tile to update appearance, interactivity
 * based on current pending action or game event
 */
var updateBoard = function() {

	var planets = clientGame.game.board.planets;

	// this sets all bases to invisible. Update function will reveal
	// and draw any that are on planets.
	updateRemovedBases();

	for ( var p = 0; p < planets.length; p++ ) {	

			updateTileInteractivity(p);
			updateTileImage(p);
			updateFleets(p);
			updateBases(p);
			updateAgents(p);
		}
	updateNoFlyZones();
	updateRemovedFleets();
	updateDeadAgents();
	stage.update();
};