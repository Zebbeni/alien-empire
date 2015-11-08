/** Tile.js contains all methods for initializing and drawing tile assets
 * Each tile has the following children, in this order:
 * 		stars
 *		lightscreen
 *		border
 *		planet
 *		nametext
 *		resources
 *		orbitstructures
 *		darkscreen
 */

var sectors = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var resourceIndex = ["metal", "water", "fuel", "food"];
var color = ["#fb4944","#4a2cff", "#76f339", "#f8ef42"];

/**
 * Create a tile, add it to the list of tiles, and initialize its children
 */
var initTile = function( planetid ) {
	
	var planets = clientGame.game.board.planets;

	tiles.push(new createjs.Container());

	tiles[planetid].name = "tile" + planetid;
	tiles[planetid].x = planets[planetid].x * sWid;
	tiles[planetid].y = planets[planetid].y * sWid;

	initStars(planetid);
	initLightScreen(planetid);
	initBorder(planetid);
	initPlanet(planetid);
	initNametext(planetid);
	initResources(planetid);
	initOrbitStructures(planetid);
	initDarkScreen(planetid);

	tiles[planetid].on("mouseover", function() {
		if (planets[planetid].explored) {

			showLightscreen( planetid );

		}
		stage.update();
	});

	tiles[planetid].on("mouseout", function() {

		hideLightscreen( planetid );

		stage.update();

	});

	board.addChild( tiles[planetid] );
};

/**
 * Set img_width of tile, call draw functions for each child
 */
var drawTile = function(planetid) {

	var planets = clientGame.game.board.planets;
	var img_width = planets[planetid].w * sWid;

	drawStars(planetid, img_width);
	drawLightScreen(planetid, img_width);
	drawBorder( planetid, img_width );
	drawPlanet(planetid);
	drawNametext(planetid);
	drawResources(planetid);
	drawOrbitStructures(planetid);
	drawDarkScreen(planetid, img_width);
};

// This is a hack. Eventually drawTile should work for this, but it
// currently screws everything up.
var updateTileImage = function(planetid) {
	drawResources(planetid);
	drawOrbitStructures(planetid);
};

/**
 * Update tile and tile's children's interactivity
 * based on the pendingAction of the client and the game state
 *
 * TODO: This is currently updating both mouse interactivity and
 *       showing/hiding darkscreens. Might be better to split the
 *       darkscreen functionality somewhere else and clean up
 */
var updateTileInteractivity = function(planetid) {

	var planets = clientGame.game.board.planets;
	var planet = planets[planetid];
	var actiontype = pendingAction.actiontype;
	var objecttype = pendingAction.objecttype;
	var agenttype = pendingAction.agenttype;

	if ( planet.explored ) {
		hideDarkScreen(planetid);
	} 
	else {
		showDarkScreen(planetid);
		// tiles[planetid].mouseChildren = false;
	}

	if ( actiontype && clientTurn == clientGame.game.turn) {

		switch (actiontype) {
			case ACT_PLACE:
			case ACT_BUILD:
				tiles[planetid].mouseChildren = true;
				updateResourcesInteractivity(planetid, planets, actiontype, objecttype);
				updatePlanetInteractivity(planetid, actiontype, objecttype);
				break;
			case ACT_RECRUIT:
				tiles[planetid].mouseChildren = true;
				updatePlanetInteractivity(planetid, actiontype, null);
				break;
			default:
				break;
		}
	} 
};

var updateResourcesInteractivity = function(planetid, planets, acttype, objtype) {

	for (var i = 0; i < planets[planetid].resources.length; i++) {
		updateResourceInteractivity( planetid, i, planets, acttype, objtype );
	}
};

var updateResourceInteractivity = function(planetid, index, planets, acttype, objtype) {

	var resource = tiles[planetid].getChildByName("resource" + index);
	var structure = planets[planetid].resources[index].structure;

	// Assume false to begin with...
	resource.mouseEnabled = false;

	if( !isSpaceObject(objtype) && isBuildTypeAction(acttype)) {
		// if no structure here and user is adding a mine, turn mouse on
		if ( !structure && objtype == OBJ_MINE) {
			resource.mouseEnabled = true;
		}
		// if user is adding a factory or embassy, turn mouse on for their mines
		else if ( structure && structure.kind == OBJ_MINE ) {
			if (structure.player == clientTurn && isUpgradeObject(objtype) ) {
				resource.mouseEnabled = true;
			}
		}
	}
};

var updatePlanetInteractivity = function(planetid, acttype, objtype){

	var planet = tiles[planetid].getChildByName("planet");

	planet.mouseEnabled = false;

	if ( acttype == ACT_BUILD && isSpaceObject(objtype)) {
		planet.mouseEnabled = true;
	}
	else if ( acttype == ACT_RECRUIT ) {
		planet.mouseEnabled = true;
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

	// stars.cache(starOffsetX, starOffsetY, img_width, img_width);
};

/**
 * Initialize planet shape, add to tile container
 */
var initPlanet = function ( planetid ) {
	var planet = new createjs.Container();
	planet.name = "planet";

	var picture = new createjs.Shape();
	picture.name = "picture";
	planet.addChild(picture);

	planet.hitArea = tiles[planetid].getChildByName("stars");
	planet.mouseChildren = false;
	planet.mouseEnabled = true;

	planet.on("mouseover", function() {
		selectPlanet(planetid);
	});

	planet.on("mouseout", function() {
		hideSelection();
	});

	planet.on("click", function() {
		handleClickPlanet( planetid );
	});

	planet.x = 0;
	planet.y = 0;

	tiles[planetid].addChild( planet );
};

/**
 * Draws a planet if it has been explored
 */
var drawPlanet = function( planetid ) {
	
	var planets = clientGame.game.board.planets;


	if (planets[planetid].explored) {

		var planet = tiles[planetid].getChildByName("planet");
		var picture = planet.getChildByName("picture");
		var img_id = planets[planetid].art;
		var planetImg = loader.getResult("planet_" + img_id);
		
		var offsetX = -12;
		var offsetY = 28;
		if ( planets[planetid].w == 2 ) {
			offsetX = 0;
			offsetY = 25;
		}

		picture.graphics.beginBitmapFill(planetImg).drawRect(offsetX, offsetY, planetImg.width, planetImg.height);

		switch ( planets[planetid].w ) {

			case 1:
				picture.scaleX = 0.45;
				picture.scaleY = 0.45;
				break;

			case 2:
				break;
		}

		picture.x = offsetX * -1;
		picture.y = offsetY * -1;
	}
};

var selectPlanet = function(planetid) {

	var planet = clientGame.game.board.planets[planetid];
	var x = tiles[planetid].x;
	var y = tiles[planetid].y;

	switch ( planet.w ) {
		case 1:
			setSelection( x + 80, y - 24);
			break;
		case 2:
			setSelection( x + 185, y + 28);
			break;
	}
};

/**
 * Initialize name text, add to tile container
 */
var initNametext = function( planetid ) {
	var nametext = new createjs.Text("", "normal 25px Play", "white");
	nametext.name = "nametext";
	tiles[planetid].addChild( nametext );
};

/**
 * Draw name of planet (or 'Sector X') if planet unexplored
 */
var drawNametext = function( planetid ) {

	var planets = clientGame.game.board.planets;
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

	var planets = clientGame.game.board.planets;

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

	resource.mouseChildren = false;
	resource.mouseEnabled = true;

	resource.on("mouseover", function() {
		selectResource(planetid, index);
	});

	resource.on("mouseout", function() {
		hideSelection();
	});

	resource.on("click", function() {
		handleClickResource( planetid, index );
	});

	tiles[planetid].addChild( resource );
};

var drawResources = function( planetid ) {
	var planets = clientGame.game.board.planets;

	if (planets[planetid].explored) {
		var num_resources = planets[planetid].resources.length;
		for (var i = 0; i < num_resources; i++) {
			drawResource( planetid, i, num_resources );
		}
	}
};

var drawResource = function( planetid, index, num_resources ) {

	var planets = clientGame.game.board.planets;
	var resource = tiles[planetid].getChildByName("resource" + index);

	var icon = resource.getChildByName("icon");

	var kind = planets[planetid].resources[index].kind;
	var iconImg = loader.getResult(resourceIndex[kind]);

	var iconW = iconImg.width;
	var iconH = iconImg.height;

	icon.graphics.beginBitmapFill(iconImg).drawRect(0, 0, iconW, iconH);

	var midX = (planets[planetid].w * sWid) / 2.0;
	var allW = (num_resources * iconW) + (2 * (num_resources -1));

	icon.x = index * (4 + iconW);

	var struct = planets[planetid].resources[index].structure;
	if ( struct ) {
		var player = struct.player;
		var kind = struct.kind;
		var structure = resource.getChildByName("structure");
		var structureImg = loader.getResult( OBJ_ENGLISH[ kind ] + player );

		structure.graphics.beginBitmapFill(structureImg, "no-repeat").drawRect(1, 1, structureImg.width - 2, structureImg.height - 2);
		structure.x = icon.x + 38;
		structure.y = icon.y - 48;
	}

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

var selectResource = function(planetid, index) {
	
	var tile = tiles[planetid];
	var resource = tile.getChildByName('resource' + index);
	var icon = resource.getChildByName('icon');
	
	var x = tile.x + resource.x + icon.x + 24;
	var y = tile.y + resource.y + icon.y - 32;

	setSelection(x, y);
};

var initOrbitStructures = function(planetid) {
	var orbitstructures = new createjs.Container();
	orbitstructures.name = "orbitstructures";

	var base = new createjs.Shape();
	base.name = "base";
	orbitstructures.addChild(base);

	var fleets = new createjs.Container();
	fleets.name = "fleets";
	orbitstructures.addChild(fleets);

	tiles[planetid].addChild(orbitstructures);
};


var drawOrbitStructures = function(planetid) {
	var planet = clientGame.game.board.planets[planetid];
	var orbitstructures = tiles[planetid].getChildByName("orbitstructures");
	var base = orbitstructures.getChildByName("base");


	if (planet.base) {
		var player = base.player;
		var baseImg = loader.getResult( OBJ_ENGLISH[ OBJ_BASE ] + planet.base.player);
		base.graphics.beginBitmapFill(baseImg, "no-repeat").drawRect(0, 0, baseImg.width, baseImg.height);
		switch (planet.w) {
			case 1:
				base.x = -25;
				base.y = -25;
				break;
			case 2:
				base.x = 25;
				base.y = 25;
				break;
		}
	}
};

var initDarkScreen = function(planetid) {
	var darkscreen = new createjs.Shape();
	darkscreen.name = "darkscreen";
	tiles[planetid].addChild(darkscreen);
};

var drawDarkScreen = function(planetid, img_width) {
	
	var planets = clientGame.game.board.planets;
	var darkscreen = tiles[planetid].getChildByName("darkscreen");

	darkscreen.graphics.beginFill("rgba(0, 0, 0, 0.4)");
	darkscreen.graphics.drawRect(0, 0, img_width, img_width);
	
	if(planets[planetid].explored) {
		darkscreen.visible = false;
	}
};

var showDarkScreen = function( planetid ) {
	var darkscreen = tiles[planetid].getChildByName("darkscreen");
	darkscreen.visible = true;
};

var hideDarkScreen = function( planetid ) {
	var darkscreen = tiles[planetid].getChildByName("darkscreen");
	darkscreen.visible = false;
};

var initLightScreen = function(planetid) {
	var lightscreen = new createjs.Shape();
	lightscreen.name = "lightscreen";
	tiles[planetid].addChild(lightscreen);
};

var drawLightScreen = function(planetid, img_width) {
	var lightscreen = tiles[planetid].getChildByName("lightscreen");

	lightscreen.graphics.beginFill("rgba(255, 255, 255, 0.1)");
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