var loader, stage, planet;

var resizeTimer;

function game_init() {

	manifest = [
		{src: "images/game/planet_1.jpg", id: "planet_1"},
		{src: "images/game/planet_2.jpg", id: "planet_2"},
		{src: "images/game/planet_3.jpg", id: "planet_3"},
		{src: "images/game/planet_4.jpg", id: "planet_4"},
		{src: "images/game/planet_5.jpg", id: "planet_5"},
		{src: "images/game/planet_6.jpg", id: "planet_6"},
		{src: "images/game/planet_7.jpg", id: "planet_7"},
		{src: "images/game/planet_8.jpg", id: "planet_8"},
		{src: "images/game/planet_9.jpg", id: "planet_9"},
		{src: "images/game/planet_10.jpg", id: "planet_10"},
		{src: "images/game/planet_11.jpg", id: "planet_11"},
		{src: "images/game/planet_12.jpg", id: "planet_12"},
		{src: "images/game/planet_13.jpg", id: "planet_13"},
		{src: "images/game/planet_14.jpg", id: "planet_14"},
		{src: "images/game/planet_15.jpg", id: "planet_15"},
		{src: "images/game/planet_16.jpg", id: "planet_16"},
		{src: "images/game/planet_17.jpg", id: "planet_17"},
		{src: "images/game/planet_18.jpg", id: "planet_18"},
		{src: "images/game/planet_19.jpg", id: "planet_19"},
		{src: "images/game/planet_20.jpg", id: "planet_20"},
		{src: "images/game/planet_21.jpg", id: "planet_21"},
		{src: "images/game/planet_22.jpg", id: "planet_22"},
		{src: "images/game/planet_23.jpg", id: "planet_23"},
		{src: "images/game/planet_24.jpg", id: "planet_24"},
		{src: "images/game/planet_25.jpg", id: "planet_25"},
		{src: "images/game/planet_26.jpg", id: "planet_26"},
		{src: "images/game/planet_27.jpg", id: "planet_27"},
		{src: "images/game/planet_28.jpg", id: "planet_28"},
		{src: "images/game/planet_29.jpg", id: "planet_29"},
	];

	loader = new createjs.LoadQueue(false);
	loader.addEventListener("complete", handleComplete);
	loader.loadManifest(manifest, true);
}

var handleComplete = function() {

	stage = new createjs.Stage("gameCanvas");
	updateCanvasSize();

	planetImg = loader.getResult("planet_10");

	planet = new createjs.Shape();
	planet.graphics.beginBitmapFill(planetImg).drawRect(0, 0, planetImg.width, planetImg.height);

	stage.addChild(planet);

	stage.update();

	console.log('HANDLE COMPLETE!');
};

$(window).resize(function () { 
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(updateCanvasSize, 50);
 });

var updateCanvasSize = function() {
	var gameCanvas = document.getElementById('gameCanvas');
	var ctx = gameCanvas.getContext("2d");
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	stage.update();
};

