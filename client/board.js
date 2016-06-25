/**
 * Changes global variable scale (within accepted parameters)
 * Updates board when done
 */
var zoomBoard = function(magnify) {

	scale = scale + magnify;
	scale = Math.min(scale, 0.75);
	scale = Math.max(scale, 0.3);

	centerBoard();
};

/**
 * Centers board in browser window
 */
var centerBoard = function() {
	if (board) {
		var boardWidth = 7 * sWid * scale;
		var boardHeight = 7 * sWid * scale;
		var x = (window.innerWidth - boardWidth) / 2.0;
		var y = (window.innerHeight - boardHeight) / 2.0;

		num_objects_moving += 1;
		createjs.Tween.get(board).to({ x:x, 
									   y:y, 
									   scaleX:scale, 
									   scaleY:scale}, 
									   200 ).call(handleTweenComplete);
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