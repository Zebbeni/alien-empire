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
 * Create a tile, add it to the list of tiles, and initialize its children
 */
var initTile = function( planetid ) {
	
	tiles.push(new createjs.Container());

	tiles[planetid].name = "tile" + planetid;
	tiles[planetid].x = planets[planetid].x * sWid;
	tiles[planetid].y = planets[planetid].y * sWid;

	initStars(planetid);
	initPlanet(planetid);
	initBorder(planetid);

	board.addChild( tiles[planetid] );
};

/**
 * Set img_width of tile, call draw functions for each child
 */
var drawTile = function(planetid) {
	var img_width = planets[planetid].w * sWid;

	drawStars( planetid, img_width );
	drawPlanet( planetid );
	drawBorder( planetid, img_width );
};

/**
 * Initialize stars shape, add to tile container
 */
var initStars = function( planetid) {
	var stars = new createjs.Shape();
	stars.name = "stars";
	tiles[planetid].addChild( stars );
};

/**
 * Draws stars by selecting a random section of the stars image
 * TODO: Rotate as well as offset, so pattern less easy to discern
 */
var drawStars = function( planetid, img_width ) {
	var stars = tiles[planetid].getChildByName("stars");

	var starsImg = loader.getResult("stars");
	var starOffsetX = Math.floor(Math.random() * (starsImg.width - (2 * sWid)));
	var starOffsetY = Math.floor(Math.random() * (starsImg.height - (2 * sWid)));

	stars.graphics.beginBitmapFill(starsImg).drawRect(starOffsetX, starOffsetY, img_width, img_width);

	stars.x = starOffsetX * -1;
	stars.y = starOffsetY * -1;
};

/**
 * Initialize planet shape, add to tile container
 */
var initPlanet = function ( planetid ) {
	var planet = new createjs.Shape();
	planet.name = "planet";
	tiles[planetid].addChild( planet );
};

/**
 * Draws a planet if it has been explored
 */
var drawPlanet = function( planetid ) {

	if (planets[planetid].explored) {

		var planet = tiles[planetid].getChildByName("planet");
		var img_id = planets[planetid].art;
		var planetImg = loader.getResult("planet_" + img_id);
		
		planet.graphics.beginBitmapFill(planetImg).drawRect(0, 0, planetImg.width, planetImg.height);
		
		switch ( planets[planetid].w ) {
			case 1:
				planet.scaleX = 0.45;
				planet.scaleY = 0.45;
				planet.x = 12;
				planet.y = -28;
				break;
			case 2:
				planet.x = 0;
				planet.y = -25;
				break;
		}
	}
};

/**
 * Initialize border shape, add to tile container
 */
var initBorder = function( planetid ) {
	var border = new createjs.Shape();
	border.name = "border";
	tiles[planetid].addChild( border );
};

/**
 * Draw border for a tile given a planet id
 */
var drawBorder = function( planetid, img_width ) {
	var border = tiles[planetid].getChildByName("border");

	border.graphics.setStrokeStyle(15);
	border.graphics.beginStroke("rgba(0,0,0,0.9)");
	border.graphics.drawRect(0, 0, img_width, img_width);
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

