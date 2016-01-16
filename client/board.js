/**
 * Changes global variable scale (within accepted parameters)
 * Updates board when done
 */
var zoomBoard = function(magnify) {
	// scale *= magnify;
	scale = magnify;
	// scale = Math.min(scale, 1);
	// scale = Math.max(scale, 0.6);

	board.scaleX = scale;
	board.scaleY = scale;

	centerBoard();

	stage.update();
};

/**
 * Centers board in browser window
 */
var centerBoard = function() {
	if (board) {
		var boardWidth = 7 * sWid * scale;
		var boardHeight = 7 * sWid * scale;
		board.x = (window.innerWidth - boardWidth) / 2.0;
		board.y = (window.innerHeight - boardHeight) / 2.0;
		stage.update();
	}
};

/**
 * Moves board given x and y shifts, times a multiplier
 */
var moveBoard = function(right, down, mult ) {
	board.x += (right * mult / pixelRatio);
	board.y += (down * mult / pixelRatio);

	stage.update();
};