/**
 * Changes global variable scale (within accepted parameters)
 * Updates board when done
 */
var zoomBoard = function(magnify) {


	scale = magnify == 1 ? 0.65 : 0.5 ;
	// scale = Math.min(scale, 0.7);
	// scale = Math.max(scale, 0.4);

	// scale = 0.65;

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
									   1000 ).call(handleTweenComplete);
	}
};

var centerPlanet = function(planetid){
	if (board){
		var planet = clientGame.game.board.planets[planetid];
		var planetX = scale * ((planet.x) * sWid + (planet.w * sWid / 2.0));
		var planetY = scale * ((planet.y) * sWid + (planet.w * sWid / 2.0));
		var x = (window.innerWidth / 2.0) - planetX;
		var y = (window.innerHeight / 2.0) - planetY;

		num_objects_moving += 1;
		createjs.Tween.get(board).to({ x:x, 
									   y:y, 
									   scaleX:scale, 
									   scaleY:scale}, 
									   700 ).call(handleTweenComplete);

		console.log("scale:", scale);
	}
};

var focusPlanet = function(planetid){
	if (board){
		var planet = clientGame.game.board.planets[planetid];
		var midX = 7 * sWid * scale / 2.0;
		var midY = 7 * sWid * scale / 2.0;
		var planetX = scale * ((planet.x) * sWid + (planet.w * sWid / 2.0));
		var planetY = scale * ((planet.y) * sWid + (planet.w * sWid / 2.0));
		var focusX = ( midX + planetX ) / 2.0;
		var focusY = ( midY + planetY ) / 2.0;
		var x = (window.innerWidth / 2.0) - focusX;
		var y = (window.innerHeight / 2.0) - focusY - 150;

		num_objects_moving += 1;
		createjs.Tween.get(board).to({ x:x, 
									   y:y, 
									   scaleX:scale, 
									   scaleY:scale}, 
									   700 ).call(handleTweenComplete);

		console.log("scale:", scale);
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