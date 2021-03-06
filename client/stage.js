var background, backLoader, backgroundScale, backgroundW, backgroundH;
var resizeTimer;
var prevWidth = 0;
var prevHeight = 0;
var pixelRatio = 1.0;
var num_objects_moving = 0; // number of objects being animated
// var fpsLabel;

/**
 * Periodically checks to see if window has been resized. 
 * Calls setCanvasSize again if so.
 */ 
$(window).resize(function () {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout( checkPixelRatioAndUpdate, 100);
 });

window.addEventListener("focus", function(){ refresh(); }, false);

/**
 * Creates the game stage on the gameCanvas
 * Defines mouse interaction functions
 */
var init_stage = function() {
	
	allSnapToPixel();

	stage = new createjs.Stage("gameCanvas");
	stage.enableMouseOver(50);
	stage.snapToPixel = true;

	init_background();

	initProgressBar();

	updatePixelRatio();

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
			dragBoard( evt.stageX - lastMouse.x, 
					   evt.stageY - lastMouse.y, 
					   1);
			lastMouse.x = evt.stageX;
			lastMouse.y = evt.stageY;
		}
	});

	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(FRAMES_PER_SECOND);
};

var allSnapToPixel = function(){
	createjs.Container.prototype.snapToPixel = true;
	createjs.Shape.prototype.snapToPixel = true;
	createjs.Text.prototype.snapToPixel = true;
	createjs.Stage.prototype.snapToPixel = true;
};

var tick = function(event) {
	// if ( fpsLabel ){
	// 	fpsLabel.text = Math.round(createjs.Ticker.getMeasuredFPS()) + " fps";
	// }
	// if (num_objects_moving > 0) {
	stage.update(event);
	// }
};

var init_background = function() {
	background = new createjs.Shape();
	stage.addChild(background);

	backLoader = new createjs.LoadQueue(false);
	backLoader.loadFile({src: s3url + "images/space_background.jpg", id: "space_background"});
	
	backLoader.addEventListener("complete", drawBackground);

	// add a text object to output the current FPS:
	// fpsLabel = new createjs.Text("-- fps", "bold 18px Arial", "#000");
	// fpsLabel.name = "fpsLabel";
	// stage.addChild(fpsLabel);
	// fpsLabel.x = 10;
	// fpsLabel.y = 20;
};

var drawBackground = function() {
	var backgroundImg = backLoader.getResult("space_background");

	backgroundW = backgroundImg.width;
	backgroundH = backgroundImg.height;

	background.graphics.beginBitmapFill(backgroundImg).drawRect(0, 0, backgroundW, backgroundH);
	background.snapToPixel = true;
	updateCanvasSize();
};


var checkPixelRatioAndUpdate = function() {

	if ( prevWidth != window.innerWidth || prevHeight != window.innerHeight || pixelRatio != window.devicePixelRatio ) {

		prevWidth = window.innerWidth;
		prevHeight = window.innerHeight;

		refresh();
	}
};

var refresh = function() {
	setInterfaceImages();
	updateCanvasSize();
};

 /**
 * sets Canvas size (usually on window resize)
 * re-centers the game board and updates the stage
 */
var updateCanvasSize = function() {
	// make sure stage exists before trying this
	if( stage ) {

		var gameCanvas = $('#gameCanvas')[0];
		var ctx = gameCanvas.getContext("2d");

		ctx.canvas.width  = window.innerWidth;
		ctx.canvas.height = window.innerHeight;

		setBackgroundSize();

		updatePixelRatio();

		centerProgressBar();
		centerBoard();

		stage.update();
	}
};

var updatePixelRatio = function() {

	var canvas = $('#gameCanvas')[0];

	if (window.devicePixelRatio) {

		// grab the width and height from canvas
		var height = canvas.getAttribute('height');
		var width = canvas.getAttribute('width');

		// reset the canvas width and height with window.devicePixelRatio applied
		canvas.setAttribute('width', Math.round(width * window.devicePixelRatio));
		canvas.setAttribute('height', Math.round( height * window.devicePixelRatio));

		// force the canvas back to the original size using css
		canvas.style.width = width+"px";
		canvas.style.height = height+"px";

		// set CreateJS to render scaled
		stage.scaleX = stage.scaleY = pixelRatio = window.devicePixelRatio;
	}
	else {
		stage.scaleX = stage.scaleY = pixelRatio = 1.0;
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
