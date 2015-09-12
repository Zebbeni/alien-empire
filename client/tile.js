/** Tile.js contains all methods for initializing and drawing tile assets
 * Each tile has the following children, in this order:
 * 		stars
 *		planet
 *		border
 */

var sectors = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Create a tile, add it to the list of tiles, and initialize its children
 */
var initTile = function( planetid ) {
	
	tiles.push(new createjs.Container());

	tiles[planetid].name = "tile" + planetid;
	tiles[planetid].x = planets[planetid].x * sWid;
	tiles[planetid].y = planets[planetid].y * sWid;

	initStars(planetid);
	initPlanet(planetid);
	initNametext(planetid);
	initBorder(planetid);

	board.addChild( tiles[planetid] );
};

/**
 * Set img_width of tile, call draw functions for each child
 */
var drawTile = function(planetid) {
	var img_width = planets[planetid].w * sWid;

	drawStars( planetid, img_width );
	drawPlanet( planetid );
	drawNametext( planetid );
	drawBorder( planetid, img_width );
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
	var nametext = new createjs.Text("Sector " + sectors.charAt(planetid), "25px Arial", "white");
	nametext.name = "nametext";
	tiles[planetid].addChild( nametext );
};

var drawNametext = function( planetid ) {
	var nametext = tiles[planetid].getChildByName("nametext");

	nametext.textAlign = "center";
	nametext.x = ( sWid * planets[planetid].w ) / 2.0;

	if ( planets[planetid].explored ){

		nametext.text = planets[planetid].name;

		switch ( planets[planetid].w ) {
			case 1:
				nametext.y = 126;
				break;
			case 2:
				nametext.y = 315;
				break;
		}
	}
	else {

		nametext.alpha = 0.5;

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