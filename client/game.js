var loader, stage, board;
var scale = 0.65;
var move_distance = 5;
var sWid = 212;
var is_dragging = false;
var lastMouse = { x:0, y:0 };
var resizeTimer;

$(document).ready(function() {
	stage = new createjs.Stage("gameCanvas");
	board = new createjs.Container();

	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	// var startDrag = function(event) {
	stage.on("stagemousedown", function(evt){
		console.log('starting drag');
		lastMouse.x = evt.stageX;
		lastMouse.y = evt.stageY;
		is_dragging = true;
	});

	// var endDrag = function(event) {
	stage.on("stagemouseup", function(evt){
		console.log('end drag');
		is_dragging = false;
	});

	// var doDrag = function(event) {
	stage.on("stagemousemove", function(evt){
		if (board && is_dragging) {
			console.log('doing drag');
			board.x = board.x + (evt.stageX - lastMouse.x);
			board.y = board.y + (evt.stageY - lastMouse.y);
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

	manifest = [
		{src: "images/game/planet_1.png", id: "planet_1"},
		{src: "images/game/planet_2.png", id: "planet_2"},
		{src: "images/game/planet_3.png", id: "planet_3"},
		{src: "images/game/planet_4.png", id: "planet_4"},
		{src: "images/game/planet_5.png", id: "planet_5"},
		{src: "images/game/planet_6.png", id: "planet_6"},
		{src: "images/game/planet_7.png", id: "planet_7"},
		{src: "images/game/planet_8.png", id: "planet_8"},
		{src: "images/game/planet_9.png", id: "planet_9"},
		{src: "images/game/planet_10.png", id: "planet_10"},
		{src: "images/game/planet_11.png", id: "planet_11"},
		{src: "images/game/planet_12.png", id: "planet_12"},
		{src: "images/game/planet_13.png", id: "planet_13"},
		{src: "images/game/planet_14.png", id: "planet_14"},
		{src: "images/game/planet_15.png", id: "planet_15"},
		{src: "images/game/planet_16.png", id: "planet_16"},
		{src: "images/game/planet_17.png", id: "planet_17"},
		{src: "images/game/planet_18.png", id: "planet_18"},
		{src: "images/game/planet_19.png", id: "planet_19"},
		{src: "images/game/planet_20.png", id: "planet_20"},
		{src: "images/game/planet_21.png", id: "planet_21"},
		{src: "images/game/planet_22.png", id: "planet_22"},
		{src: "images/game/planet_23.png", id: "planet_23"},
		{src: "images/game/planet_24.png", id: "planet_24"},
		{src: "images/game/planet_25.png", id: "planet_25"},
		{src: "images/game/planet_26.png", id: "planet_26"},
		{src: "images/game/planet_27.png", id: "planet_27"},
		{src: "images/game/planet_28.png", id: "planet_28"},
		{src: "images/game/planet_29.png", id: "planet_29"},
		{src: "images/game/stars.png", id: "stars"}
	];

	loader = new createjs.LoadQueue(false);
	loader.addEventListener("complete", handleComplete);
	loader.loadManifest(manifest, true);

	// we need to figure out how to prevent flickering while it loads our large manifest
};

var handleComplete = function() {

	if (stage) {

		updateCanvasSize();
		var planets = clientGame.game.board.planets;
		console.log("in here 1");

		for ( var p = 0; p < planets.length; p++ ) {
			var tile = new createjs.Container();
			var img_width = planets[p].w * sWid;

			var stars = new createjs.Shape();
			var starsImg = loader.getResult("stars");

			var starOffsetX = Math.floor(Math.random() * (starsImg.width - (2 * sWid)));
			var starOffsetY = Math.floor(Math.random() * (starsImg.height - (2 * sWid)));

			stars.graphics.beginBitmapFill(starsImg).drawRect(starOffsetX, starOffsetY, img_width, img_width);

			stars.x = starOffsetX * -1;
			stars.y = starOffsetY * -1;

			var planet = new createjs.Shape();
			var img_id = planets[p].art;
			var planetImg = loader.getResult("planet_" + img_id);
			planet.graphics.beginBitmapFill(planetImg).drawRect(0, 0, planetImg.width, planetImg.height);
			
			switch ( planets[p].w ) {
				case 1:
					planet.scaleX = 0.45;
					planet.scaleY = 0.45;
					planet.x = 12;;
					planet.y = -28;
					break;
				case 2:
					planet.scaleX = 1;
					planet.scaleY = 1;
					planet.x = 0;
					planet.y = -25;
					break;
			}

			var border = new createjs.Shape();
			border.graphics.setStrokeStyle(15);
			border.graphics.beginStroke("rgba(0,0,0,150)");
			border.graphics.drawRect(0, 0, planets[p].w * sWid, planets[p].w * sWid)

			tile.addChild( stars );
			tile.addChild( planet );
			tile.addChild( border );

			tile.x = planets[p].x * sWid;
			tile.y = planets[p].y * sWid;

			board.addChild( tile );
		}

		stage.addChild( board );
		
		zoomBoard(1); // this is a stand in, but it centers our board and doesn't copy/paste code
	}
};

$(window).resize(function () { 
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(updateCanvasSize, 50);
 });

var zoomBoard = function(magnify) {
	scale *= magnify;
	scale = Math.min(scale, 1);
	scale = Math.max(scale, 0.6);

	var boardWidth = 7 * sWid * scale;
	board.x = (window.innerWidth - boardWidth) / 2.0;

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

