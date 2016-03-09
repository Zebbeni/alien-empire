/** selection.js contains all methods for initializing and drawing arrows
 * and accompanying selection shapes, to be called from other shapes
 * on rollover
 */

var color = ["#fb4944","#4a2cff", "#76f339", "#f8ef42"];

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

 	var planetselection = new createjs.Container();
 	planetselection.name = 'planetselection';
 	planetselection.x = 0;
 	planetselection.y = 0;

 	var planetborder = new createjs.Shape();
 	planetborder.name = "planetborder";
 	planetborder.mouseEnabled = false;

 	planetselection.mouseEnabled = false;
 	planetselection.visible = false;
 	planetselection.addChild(planetborder);

 	board.addChild(planetselection);
 };

var setSelection = function(x, y) {
 	
 	var selection = board.getChildByName('selection');
 	
 	selection.x = x;
 	selection.y = y;

 	selection.visible = true;

 	board.setChildIndex( selection, 
						 board.getNumChildren() - 1);
 };

 var hideSelection = function() {
 	var selection = board.getChildByName('selection');
 	selection.visible = false;
 };

var setPlanetSelection = function( planetid ) {
	var strokeWid = 8;
	var strokeOff = 4;
	var planetselection = board.getChildByName('planetselection');
	var planetborder = planetselection.getChildByName('planetborder');

	var planet = clientGame.game.board.planets[planetid];
	var x = planet.x * sWid;
	var y = planet.y * sWid;
	var wid = planet.w * sWid;
	var hei = planet.w * sWid;

	planetborder.graphics.clear();
	planetborder.graphics.setStrokeStyle(strokeWid);
	planetborder.graphics.beginStroke(color[clientTurn]);
	planetborder.graphics.drawRect( strokeOff, 
									strokeOff, 
									wid - strokeWid, 
									hei - strokeWid);
	planetborder.x = x;
	planetborder.y = y;

	planetborder.alpha = planet.explored ? 0.9 : 0.4; 


	planetselection.visible = true;
	board.setChildIndex( planetselection, 
						 board.getNumChildren() - 1);
};

// this could probably be combined into a generic function with hideSelection
var hidePlanetSelection = function( planetid ){
	var planetselection = board.getChildByName('planetselection');
	planetselection.visible = false;
};