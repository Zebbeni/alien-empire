/**
 * Changes global variable scale (within accepted parameters)
 * Updates board when done
 */
var zoomBoard = function(magnify) {

	scale = scale + magnify;
	scale = Math.min(scale, 0.7);
	scale = Math.max(scale, 0.4);

	board.scaleX = scale;
	board.scaleY = scale;

	centerBoard();
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
	}
};

/**
 * Moves board given x and y shifts, times a multiplier
 */
var moveBoard = function(right, down) {
	boardX = board.x + (right * MOVE_DISTANCE / pixelRatio);
	boardY = board.y + (down * MOVE_DISTANCE / pixelRatio);

	num_objects_moving += 1;
	createjs.Tween.get(board).to({ x:boardX, y:boardY}, 300 ).call(handleTweenComplete);
};

var dragBoard = function(right, down, mult ) {
	board.x += (right * mult / pixelRatio);
	board.y += (down * mult / pixelRatio);
	stage.update();
};