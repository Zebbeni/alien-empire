var loader, stage, board, planets, tiles, scale, move_distance, sWid, is_dragging, lastMouse;
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

	manifest = [
		{src: "images/game/metal.png", id: "metal"},
		{src: "images/game/water.png", id: "water"},
		{src: "images/game/fuel.png", id: "fuel"},
		{src: "images/game/food.png", id: "food"},
		{src: "images/game/stars.png", id: "stars"}
	];

	for ( var p = 0; p < planets.length; p++ ) {
		if ( planets[p].explored ) {
			var img_id = planets[p].art;
			manifest.push({src: "images/game/planet_" + img_id + ".png", id: "planet_" + img_id });
		}
	}

	loader = new createjs.LoadQueue(false);
	loader.addEventListener("complete", initializeTiles);
	loader.loadManifest(manifest, true);

	// we need to figure out how to prevent flickering while it loads our large manifest
};

var set_globals = function() {
	stage.removeAllChildren();
	loader = planets = null;
	board = new createjs.Container();
	tiles = [];
	scale = 0.8;
	sWid = 212;
	is_dragging = false;
	lastMouse = { x:0, y:0 };
};

var initializeTiles = function() {

	if (stage) {

		updateCanvasSize();

		console.log("in here 1");

		for ( var p = 0; p < planets.length; p++ ) {
			var img_width = planets[p].w * sWid;

			tiles.push(new createjs.Container());
			tiles[p].name = "tile" + p;

			initStars(p, img_width);
			initPlanet(p);
			initBorder(p, img_width);

			tiles[p].x = planets[p].x * sWid;
			tiles[p].y = planets[p].y * sWid;

			board.addChild( tiles[p] );
		}

		stage.addChild( board );
		
		zoomBoard(1); // this is a stand in, but it centers our board and doesn't copy/paste code
	}
};

$(window).resize(function () { 
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(updateCanvasSize, 50);
 });

var initStars = function( planetid, img_width ) {
	var stars = new createjs.Shape();

	stars.name = "stars";
	tiles[planetid].addChild( stars );

	drawStars( planetid, img_width );
};

var drawStars = function( planetid, img_width ) {
	var stars = tiles[planetid].getChildByName("stars");

	var starsImg = loader.getResult("stars");
	var starOffsetX = Math.floor(Math.random() * (starsImg.width - (2 * sWid)));
	var starOffsetY = Math.floor(Math.random() * (starsImg.height - (2 * sWid)));

	stars.graphics.beginBitmapFill(starsImg).drawRect(starOffsetX, starOffsetY, img_width, img_width);

	stars.x = starOffsetX * -1;
	stars.y = starOffsetY * -1;
};

var initPlanet = function ( planetid ) {
	var planet = new createjs.Shape();

	planet.name = "planet";
	tiles[planetid].addChild( planet );

	if (planets[planetid].explored){
		drawPlanet( planetid );
	}
};

var drawPlanet = function( planetid ) {
	var planet = tiles[planetid].getChildByName("planet");

	var planets = clientGame.game.board.planets;
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
};

var initBorder = function( planetid, img_width) {
	var border = new createjs.Shape();

	border.name = "border";
	tiles[planetid].addChild( border );

	drawBorder( planetid, img_width );
};

var drawBorder = function( planetid, img_width ) {
	var border = tiles[planetid].getChildByName("border");

	border.graphics.setStrokeStyle(15);
	border.graphics.beginStroke("rgba(0,0,0,0.9)");
	border.graphics.drawRect(0, 0, img_width, img_width);
};

var zoomBoard = function(magnify) {
	scale *= magnify;
	scale = Math.min(scale, 1);
	scale = Math.max(scale, 0.6);

	var boardWidth = 7 * sWid * scale;
	var boardHeight = 7 * sWid * scale;
	board.x = (window.innerWidth - boardWidth) / 2.0;
	board.y = (window.innerHeight - boardHeight) / 2.0;

	board.scaleX = scale;
	board.scaleY = scale;

	stage.update();
};

var moveBoard = function(right, down) {
	board.x += (right * move_distance);
	board.y += (down * move_distance);

	stage.update();
};

var updateCanvasSize = function() {
	if(stage) { // make sure stage exists before trying this
		var gameCanvas = document.getElementById('gameCanvas');
		var ctx = gameCanvas.getContext("2d");
		ctx.canvas.width  = window.innerWidth;
		ctx.canvas.height = window.innerHeight;

		zoomBoard(1);
	}
};

