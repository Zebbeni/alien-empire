var background, backLoader, backgroundScale, backgroundW, backgroundH;
var resizeTimer;
var prevWidth = 0;
var prevHeight = 0;
var pixelRatio = 1.0;

/**
 * Periodically checks to see if window has been resized. 
 * Calls setCanvasSize again if so.
 */ 
$(window).resize(function () {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(setCanvasSize, 100);
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
			moveBoard( evt.stageX - lastMouse.x, 
					   evt.stageY - lastMouse.y, 
					   1, 
					   pixelRatio);
			lastMouse.x = evt.stageX;
			lastMouse.y = evt.stageY;
		}
	});
};

var init_background = function() {
	background = new createjs.Shape();
	
	stage.addChild(background);

	backLoader = new createjs.LoadQueue(false);
	backLoader.loadFile({src: "https://s3-us-west-2.amazonaws.com/alien-empire/images/space_background.jpg", id: "space_background"});
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
	// make sure stage exists before trying this
	if( stage ) {
		if ( prevWidth != window.innerWidth 
			|| prevHeight != window.innerHeight 
			|| pixelRatio != window.devicePixelRatio ) {

			var gameCanvas = $('#gameCanvas')[0];
			var ctx = gameCanvas.getContext("2d");

			prevWidth = window.innerWidth;
			prevHeight = window.innerHeight;

			ctx.canvas.width  = window.innerWidth;
			ctx.canvas.height = window.innerHeight;

			setBackgroundSize();

			updatePixelRatio();

			centerProgressBar();
			centerBoard();

			stage.update();
		}
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
