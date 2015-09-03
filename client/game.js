var loader, stage, planet;

var resizeTimer;

$(document).ready(function() {
	stage = new createjs.Stage("gameCanvas");
});

// window.onload = function() {
// 	stage = new createjs.Stage("gameCanvas");
// };

function game_init() {

	manifest = [
		{src: "images/game/planet_10.jpg", id: "planet_10"},
		{src: "images/game/planet_29.jpg", id: "planet_29"}
	];

	loader = new createjs.LoadQueue(false);
	loader.addEventListener("complete", handleComplete);
	loader.loadManifest(manifest, true);

	// we need to figure out how to prevent flickering while it loads our large manifest
}

var handleComplete = function() {

	if (stage) {
		updateCanvasSize();

		planetImg = loader.getResult("planet_10");

		planet = new createjs.Shape();

		var x = (window.innerWidth / 2.0) - (planetImg.width / 2.0);
		var y = (window.innerHeight / 2.0) - (planetImg.height / 2.0);

		planet.graphics.beginBitmapFill(planetImg).drawRect(0, 0, planetImg.width, planetImg.height);
		planet.x = x;
		planet.y = y;

		stage.addChild(planet);

		stage.update();

		console.log('HANDLE COMPLETE!');
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

		if (planet) {
			var x = (window.innerWidth / 2.0) - (planetImg.width / 2.0);
			var y = (window.innerHeight / 2.0) - (planetImg.height / 2.0);
			planet.x = x;
			planet.y = y;
			stage.addChild(planet);
		}

		stage.update();
	}
};

