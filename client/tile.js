/** Tile.js contains all methods for initializing and drawing tile assets
 * Each tile has the following children, in this order:
 * 		stars
 *		planet
 *		border
 */

var sectors = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var resourceIndex = ["metal", "water", "fuel", "food"];
var color = ["#fb4944","#4a2cff", "#76f339", "#f8ef42"];

/**
 * Create a tile, add it to the list of tiles, and initialize its children
 */
var initTile = function( planetid ) {
	
	tiles.push(new createjs.Container());

	tiles[planetid].name = "tile" + planetid;
	tiles[planetid].x = planets[planetid].x * sWid;
	tiles[planetid].y = planets[planetid].y * sWid;

	initStars(planetid);
	initLightScreen(planetid);
	initPlanet(planetid);
	initNametext(planetid);
	initResources(planetid);
	initDarkScreen(planetid);
	initBorder(planetid);

	tiles[planetid].mouseChildren = false;

	tiles[planetid].on("mouseover", function() {
		if (planets[planetid].explored) {
			
			// For efficiency, we should find a way to re-include this logic
			// Currently it conflicts with updateTile logic

			// tiles[planetid].mouseChildren = true;

			showLightscreen( planetid );

		}
		stage.update();
	});

	tiles[planetid].on("mouseout", function() {

		// For efficiency, we should find a way to re-include this logic
		// Currently it conflicts with updateTile logic
		
		// tiles[planetid].mouseChildren = false;
		
		hideLightscreen( planetid );
		stage.update();

	});

	board.addChild( tiles[planetid] );
};

/**
 * Set img_width of tile, call draw functions for each child
 */
var drawTile = function(planetid) {
	var img_width = planets[planetid].w * sWid;

	drawStars(planetid, img_width);
	drawLightScreen(planetid, img_width);
	drawPlanet(planetid);
	drawNametext(planetid);
	drawResources(planetid);
	drawDarkScreen(planetid, img_width);
	drawBorder( planetid, img_width );
};

/**
 * Update tile's interactivity and appearance based on the pending
 * action of the client or the state of the game
 */
var updateTile = function(planetid) {
	if ( pendingAction.actiontype ) {
		switch( pendingAction.actiontype ) {

			case ACT_PLACE:
				tiles[planetid].mouseChildren = true;
				break;

			default:
				tiles[planetid].mouseChildren = true;
				break;
		}
	} else {
		tiles[planetid].mouseChildren = false;
	}
};

/**
 * Initialize stars shape, add to tile container
 */
var initStars = function( planetid) {
	var stars = new createjs.Shape();
	stars.name = "stars";
	tiles[planetid].addChild( stars );
};

/**
 * Draws stars by selecting a random section of the stars image
 * TODO: Rotate as well as offset, so pattern less easy to discern
 */
var drawStars = function( planetid, img_width ) {
	var stars = tiles[planetid].getChildByName("stars");

	var starsImg = loader.getResult("stars");
	var starOffsetX = Math.floor(Math.random() * (starsImg.width - (2 * sWid)));
	var starOffsetY = Math.floor(Math.random() * (starsImg.height - (2 * sWid)));

	stars.graphics.beginBitmapFill(starsImg).drawRect(starOffsetX, starOffsetY, img_width, img_width);

	stars.x = starOffsetX * -1;
	stars.y = starOffsetY * -1;
};

/**
 * Initialize planet shape, add to tile container
 */
var initPlanet = function ( planetid ) {
	var planet = new createjs.Shape();
	planet.name = "planet";

	tiles[planetid].addChild( planet );
};

/**
 * Draws a planet if it has been explored
 */
var drawPlanet = function( planetid ) {

	if (planets[planetid].explored) {

		var planet = tiles[planetid].getChildByName("planet");
		var img_id = planets[planetid].art;
		var planetImg = loader.getResult("planet_" + img_id);
		
		planet.graphics.beginBitmapFill(planetImg).drawRect(0, 0, planetImg.width, planetImg.height);
		
		switch ( planets[planetid].w ) {
			case 1:
				planet.scaleX = 0.45;
				planet.scaleY = 0.45;
				planet.x = 12;
				planet.y = -28;
				break;
			case 2:
				planet.x = 0;
				planet.y = -25;
				break;
		}
	}
};

/**
 * Initialize name text, add to tile container
 */
var initNametext = function( planetid ) {
	var nametext = new createjs.Text("", "25px Arial", "white");
	nametext.name = "nametext";
	tiles[planetid].addChild( nametext );
};

/**
 * Draw name of planet (or 'Sector X') if planet unexplored
 */
var drawNametext = function( planetid ) {
	var nametext = tiles[planetid].getChildByName("nametext");

	nametext.textAlign = "center";
	nametext.shadow = new createjs.Shadow("rgba(0,0,0,0.3)", 1, 1, 1);
	nametext.x = ( sWid * planets[planetid].w ) / 2.0;

	if ( planets[planetid].explored ){

		nametext.alpha = 1;
		nametext.text = planets[planetid].name;

		switch ( planets[planetid].w ) {
			case 1:
				nametext.y = 121;
				break;
			case 2:
				nametext.y = 315;
				break;
		}
	}
	else {

		nametext.alpha = 0.7;
		nametext.text = "Sector " + sectors.charAt(planetid);

		switch ( planets[planetid].w ) {
			case 1:
				nametext.y = 89;
				break;
			case 2:
				nametext.y = 197;
				break;
		}
	}
};

var initResources = function( planetid ) {
	for (var i = 0; i < planets[planetid].resources.length; i++) {
		initResource( planetid, i );
	}
};

var initResource = function( planetid, index ) {
	var resource = new createjs.Container();
	resource.name = "resource" + index;

	var icon = new createjs.Shape();
	icon.name = "icon";
	resource.addChild(icon);

	var structure = new createjs.Shape();
	structure.name = "structure";
	resource.addChild(structure);

	var arrow = new createjs.Shape();
	arrow.name = "arrow";
	resource.addChild(arrow);

	resource.mouseChildren = false;
	resource.mouseEnabled = true;

	resource.on("mouseover", function() {
		resource.getChildByName("arrow").visible = true;
		resource.getChildByName("icon").shadow = new createjs.Shadow( color[clientColor], 0, 3, 0);
		stage.update();
	});

	resource.on("mouseout", function() {
		resource.getChildByName("arrow").visible = false;
		resource.getChildByName("icon").shadow = null;
		stage.update();
	});

	resource.on("click", function() {
		handleClickResource( planetid, index );
	});

	tiles[planetid].addChild( resource );
};

var drawResources = function( planetid ) {
	if (planets[planetid].explored) {
		var num_resources = planets[planetid].resources.length;
		for (var i = 0; i < num_resources; i++) {
			drawResource( planetid, i, num_resources );
		}
	}
};

var drawResource = function( planetid, index, num_resources ) {
	var resource = tiles[planetid].getChildByName("resource" + index);

	var icon = resource.getChildByName("icon");

	var kind = planets[planetid].resources[index].kind;
	var iconImg = loader.getResult(resourceIndex[kind]);

	var iconW = iconImg.width;
	var iconH = iconImg.height;

	icon.graphics.beginBitmapFill(iconImg).drawRect(0, 0, iconW, iconH);

	var midX = (planets[planetid].w * sWid) / 2.0;
	var allW = (num_resources * iconW) + (2 * (num_resources -1));

	icon.x = index * (2 + iconW);

	var arrow = resource.getChildByName("arrow");
	var arrowImg = loader.getResult("arrow_color" + clientColor);
	arrow.graphics.beginBitmapFill(arrowImg).drawRect(0, 0, arrowImg.width, arrowImg.height);
	arrow.x = icon.x + 24;
	arrow.y = icon.y - 32;
	arrow.visible = false;

	resource.x = midX - (allW / 2.0);

	switch( planets[planetid].w ) {
		case 1:
			resource.y = 152; 
			break;
		case 2:
			resource.y = 349;
			break;
	}
};

var initDarkScreen = function(planetid) {
	var darkscreen = new createjs.Shape();
	darkscreen.name = "darkscreen";
	tiles[planetid].addChild(darkscreen);
};

var drawDarkScreen = function(planetid, img_width) {
	var darkscreen = tiles[planetid].getChildByName("darkscreen");

	darkscreen.graphics.beginFill("rgba(0, 0, 0, 0.4)");
	darkscreen.graphics.drawRect(0, 0, img_width, img_width);
	
	if(planets[planetid].explored) {
		darkscreen.visible = false;
	}
};

var initLightScreen = function(planetid) {
	var lightscreen = new createjs.Shape();
	lightscreen.name = "lightscreen";
	tiles[planetid].addChild(lightscreen);
};

var drawLightScreen = function(planetid, img_width) {
	var lightscreen = tiles[planetid].getChildByName("lightscreen");

	lightscreen.graphics.beginFill("rgba(255, 255, 255, 0.05)");
	lightscreen.graphics.drawRect(0, 0, img_width, img_width);
	lightscreen.visible = false;
};

var showLightscreen = function( planetid ) {
	var lightscreen = tiles[planetid].getChildByName("lightscreen");
	lightscreen.visible = true;
};

var hideLightscreen = function( planetid ) {
	var lightscreen = tiles[planetid].getChildByName("lightscreen");
	lightscreen.visible = false;
};

/**
 * Initialize border shape, add to tile container
 */
var initBorder = function( planetid ) {
	var border = new createjs.Shape();
	border.name = "border";
	tiles[planetid].addChild( border );
};

/**
 * Draw border for a tile given a planet id
 */
var drawBorder = function( planetid, img_width ) {
	var border = tiles[planetid].getChildByName("border");

	border.graphics.setStrokeStyle(15);
	border.graphics.beginStroke("rgba(0,0,0,0.9)");
	border.graphics.drawRect(0, 0, img_width, img_width);
};