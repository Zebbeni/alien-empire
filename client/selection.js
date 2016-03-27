/** selection.js contains all methods for initializing and drawing arrows
 * and accompanying selection shapes, to be called from other shapes
 * on rollover
 */

var color = ["#fb4944","#4a2cff", "#76f339", "#f8ef42"];

var initSelection = function() {

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

	var strokeWid = 8;
	var strokeOff = 4;

 	var largeborder = new createjs.Shape();
 	largeborder.name = "largeborder";
	largeborder.graphics.clear();
	largeborder.graphics.setStrokeStyle(strokeWid);
	largeborder.graphics.beginStroke(color[clientTurn]);
	largeborder.graphics.drawRect( strokeOff, 
								   strokeOff, 
								   (2 * sWid) - strokeWid, 
								   (2 * sWid) - strokeWid );
 	largeborder.mouseEnabled = false;
	planetselection.addChild(largeborder);

 	var smallborder = new createjs.Shape();
 	smallborder.name = "smallborder";
	smallborder.graphics.clear();
	smallborder.graphics.setStrokeStyle(strokeWid);
	smallborder.graphics.beginStroke(color[clientTurn]);
	smallborder.graphics.drawRect( strokeOff, 
								   strokeOff, 
								   sWid - strokeWid, 
								   sWid - strokeWid );
 	smallborder.mouseEnabled = false;
 	planetselection.addChild(smallborder);

 	planetselection.mouseEnabled = false;
 	planetselection.visible = false;

 	board.addChild(planetselection);
 };

var setSelection = function(x, y) {
 	
 	var selection = board.getChildByName('selection');
 	
 	selection.x = x;
 	selection.y = y;

 	board.setChildIndex( selection, 
						 board.getNumChildren() - 1);

 	fadeIn(selection, 250);
 };

 var hideSelection = function() {
 	var selection = board.getChildByName('selection');
 	selection.visible = false;
 };

var setPlanetSelection = function( planetid ) {

	var planet = clientGame.game.board.planets[planetid];
	var planetselection = board.getChildByName('planetselection');
	var onborder, offborder;

	switch ( planet.w ){
		case 1:
				onborder = planetselection.getChildByName('smallborder');
				offborder = planetselection.getChildByName('largeborder');
			break;
		case 2:
				onborder = planetselection.getChildByName('largeborder');
				offborder = planetselection.getChildByName('smallborder');
			break;
	}

	var x = planet.x * sWid;
	var y = planet.y * sWid;
	onborder.x = x;
	onborder.y = y;

	board.setChildIndex( planetselection, 
						 board.getNumChildren() - 1);

	onborder.visible = true;
	offborder.visible = false;
	fadeIn(planetselection, 250);
};

// this could probably be combined into a generic function with hideSelection
var hidePlanetSelection = function( planetid ){
	var planetselection = board.getChildByName('planetselection');
	planetselection.visible = false;
};