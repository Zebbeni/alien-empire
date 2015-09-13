var background, backLoader, backgroundScale, backgroundW, backgroundH;

/**
 * Periodically checks to see if window has been resized. 
 * Calls setCanvasSize again if so.
 */ 
$(window).resize(function () { 
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(setCanvasSize, 50);
 });

/**
 * Creates the game stage on the gameCanvas
 * Defines mouse interaction functions
 */
var init_stage = function() {
	
	stage = new createjs.Stage("gameCanvas");
	stage.enableMouseOver(20);

	init_background();

	initProgressBar();

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
			moveBoard( evt.stageX - lastMouse.x, evt.stageY - lastMouse.y, 1);
			lastMouse.x = evt.stageX;
			lastMouse.y = evt.stageY;
		}
	});
};

var init_background = function() {
	background = new createjs.Shape();
	
	stage.addChild(background);

	backLoader = new createjs.LoadQueue(false);
	backLoader.loadFile({src: "images/space_background.jpg", id: "space_background"});
	backLoader.addEventListener("complete", drawBackground);
};

var drawBackground = function() {
	var backgroundImg = backLoader.getResult("space_background");

	backgroundW = backgroundImg.width;
	backgroundH = backgroundImg.height;

	background.graphics.beginBitmapFill(backgroundImg).drawRect(0, 0, backgroundW, backgroundH);

	setCanvasSize();
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

		setBackgroundSize();

		centerProgressBar();
		centerBoard();

		stage.update();
	}
};

var setBackgroundSize = function() {
	var scaleX = window.innerWidth / backgroundW;
	var scaleY = window.innerHeight / backgroundH;
	backgroundScale = scaleX > scaleY ? scaleX : scaleY;
	background.scaleX = background.scaleY = backgroundScale;
	background.x = (window.innerWidth - (backgroundW * backgroundScale)) / 2;
	background.y = (window.innerHeight - (backgroundH * backgroundScale)) / 2;
};
