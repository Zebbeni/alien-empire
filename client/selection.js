/** selection.js contains all methods for initializing and drawing arrows
 * and accompanying selection shapes, to be called from other shapes
 * on rollover
 */

 var initSelection = function() {

 	console.log('initialized selection');

 	var selection = new createjs.Container();
 	selection.name = 'selection';
 	selection.x = 0;
 	selection.y = 0;

 	var arrow = new createjs.Shape();
 	arrow.name = "arrow";
 	
 	var arrowImg = loader.getResult("arrow_color" + clientColor);	
	arrow.graphics.beginBitmapFill(arrowImg).drawRect(0, 0, arrowImg.width, arrowImg.height);
 	
	selection.addChild(arrow);
	selection.visible = false;

 	board.addChild(selection);

 };

 var setSelection = function(x, y) {
 	
 	var selection = board.getChildByName('selection');
 	
 	selection.x = x;
 	selection.y = y;

 	selection.visible = true;

 	board.setChildIndex( selection, 
						 board.getNumChildren() - 1);

 	stage.update();
 };

 var hideSelection = function() {
 	var selection = board.getChildByName('selection');
 	selection.visible = false;

 	stage.update();
 };