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