var loader, stage, board;
var sWid = 262;

var resizeTimer;

$(document).ready(function() {
	stage = new createjs.Stage("gameCanvas");
	// board = new createjs.Container();
});

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
		var scale = 1;
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
					planet.scaleX = 0.4179;
					planet.scaleY = 0.4179;
					planet.x = 19;;
					planet.y = -26;
					break;
				case 2:
					planet.scaleX = 0.9467;
					planet.scaleY = 0.9467;
					planet.x = 10;
					planet.y = -20;
					break;
			}

			var border = new createjs.Shape();
			border.graphics.setStrokeStyle(8);
			border.graphics.beginStroke("#000000");
			border.graphics.drawRect(0, 0, planets[p].w * sWid, planets[p].w * sWid)

			tile.addChild( stars );
			tile.addChild( planet );
			tile.addChild( border );

			tile.scaleX = scale;
			tile.scaleY = scale;

			tile.x = planets[p].x * sWid * scale;
			tile.y = planets[p].y * sWid * scale;

			stage.addChild( tile );
			// board.addChild(planet);
		}

		// board.x = 0;
		// board.y = 0;
		// // board.scaleX = 0.25;
		// // board.scaleY = 0.25;
		
		// stage.addChild(board);

		stage.update();
	}
};

$(window).resize(function () { 
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(updateCanvasSize, 50);
 });

var updateCanvasSize = function() {
	if(stage) { // make sure stage exists before trying this
		var gameCanvas = document.getElementById('gameCanvas');
		var ctx = gameCanvas.getContext("2d");
		ctx.canvas.width  = window.innerWidth;
		ctx.canvas.height = window.innerHeight;

		// if (board) {
		// 	board.x = 0;
		// 	board.y = 0;
		// 	stage.addChild(board);
		// }

		stage.update();
	}
};

