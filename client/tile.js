/** Tile.js contains all methods for initializing and drawing tile assets
 * Each tile has the following children, in this order:
 * 		stars
 *		lightscreen
 *		border
 *		planet
 *		nametext
 *		resources
 *		spy eyes
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
	var tile_width = planets[planetid].w * sWid;

	initStars(planetid, tile_width);
	initLightScreen(planetid, tile_width);
	initBorder(planetid, tile_width);
	initPlanet(planetid);
	initResources(planetid);
	initSpyEyes(planetid);
	initNametext(planetid);
	initDarkScreen(planetid, tile_width);

	// tiles[planetid].hitArea = tiles[planetid].getChildByName("stars");

	tiles[planetid].on("mouseover", function() {
		if (planets[planetid].explored) {
			showLightscreen( planetid );
		}
	});

	tiles[planetid].on("mouseout", function() {

		hideLightscreen( planetid );

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
	drawSpyEyes(planetid);
	drawDarkScreen(planetid, img_width);
};

// This is a hack. Eventually drawTile should work for this, but it
// currently screws everything up.
var updateTileImage = function(planetid) {
	drawPlanet(planetid);
	drawNametext(planetid);
	drawResources(planetid);
	drawSpyEyes(planetid);
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
		tiles[planetid].mouseChildren = true;
	} 
	else {
		showDarkScreen(planetid);
		tiles[planetid].mouseChildren = false;
	}

	switch (clientGame.game.phase) {

		case PHS_PLACING:

			mouseTile( planetid, true );
			mouseResources( planets, planetid, true, false, false );
			mousePlanet( planetid, false );

			break;

		case PHS_RESOURCE:

			mouseTile( planetid, false );

			break;

		case PHS_BUILD:

			if (actiontype){

				mouseTile( planetid, true );

				if (actiontype == ACT_BUILD) {

					if ( isSpaceObject( objecttype ) ){

						mouseResources( planets, planetid, false, false, false );
						mousePlanet( planetid, true );
					}
					else {
						if ( objecttype == OBJ_MINE ){
							mouseResources( planets, planetid, true, false, false );
						}
						else {
							mouseResources( planets, planetid, false, true, false );
						}
						mousePlanet( planetid, false );
					}
				}
				else if ( actiontype == ACT_RECRUIT ) {

					mouseResources( planets, planetid, false, false, false );
					mousePlanet( planetid, true );
				}
			}
			else {

				mouseTile( planetid, false );
				mouseResources( planets, planetid, false, false, false );
				mousePlanet( planetid, false );
			}

			break;

		case PHS_UPKEEP:

			mouseTile( planetid, true );
			mouseResources( planets, planetid, false, true, false );
			mousePlanet( planetid, false );

			break;

		case PHS_ACTIONS:

			mouseTile( planetid, true );
			mousePlanet( planetid, false );
			mouseResources( planets, planetid, false, false, false );

			if ( actiontype == ACT_MOVE_AGENT 
				 || actiontype == ACT_LAUNCH_MISSION 
				 || actiontype == ACT_FLEET_MOVE ){

				mousePlanet( planetid, true );

				if ( actiontype == ACT_LAUNCH_MISSION && agenttype == AGT_EXPLORER ){
					var agent = clientGame.game.board.agents[ 
													String(clientTurn) + 
													String(agenttype)];
					var agentplanet = planets[agent.planetid];

					if ( agentplanet.borders.hasOwnProperty(planetid) ) {
						var border = agentplanet.borders[planetid];
						if ( border != BRD_BLOCKED ) {
							hideDarkScreen(planetid);
							tiles[planetid].mouseChildren = true;
						}
					}
				}
			}

			else if ( actiontype == ACT_FLEET_ATTACK ){
				mouseResources( planets, planetid, false, false, true );
			}

			break;

		case PHS_MISSIONS:

			var missionRound = clientGame.game.round - 2;
			var missionindex = clientGame.game.missionindex;
			var missions = clientGame.game.missions;

			if ( missions[ missionRound ] 
				 && missions[ missionRound ][ missionindex ]) {
				
				var mission = missions[ missionRound ][ missionindex ];

				var planetTo = mission.planetTo;
				var agenttype = mission.agenttype;

				mouseTile( planetid, true);
				mousePlanet( planetid, false);

				switch (agenttype) {
					case AGT_EXPLORER:
						mouseResources( planets, planetTo, true, false, false);
						break;
					case AGT_MINER:
						mouseResources( planets, planetTo, false, true, false);
						break;
					case AGT_SABATEUR:
						mouseResources( planets, planetTo, false, false, true);
						break;
					case AGT_SURVEYOR:
						mouseResources( planets, planetTo, true, true, true);
						break;
					default:
						break;
				}
			}

			break;
	}
};

var mouseTile = function( planetid, on ){
	tiles[planetid].mouseEnabled = on;
};

var mousePlanet = function( planetid, on) {
	tiles[planetid].getChildByName("planet").mouseEnabled = on;
};

/**
 * Calls mouseResource on each resource with the given parameters
 */
var mouseResources = function( planets, planetid, empty, friendly, opponent ) {
		
	for (var index = 0; index < planets[planetid].resources.length; index++) {
		mouseResource( planets, planetid, index, empty, friendly, opponent );
	}
};

/**
 * Sets mouseEnabled to true for all resources defined in parameters.
 * Initializes all to false and then sets to true
 *
 * @planetid: planet id
 * @index: index of resource
 * @empty: true/false allow selecting empty resources
 * @friendly: true/false select resources the player occupies
 * @opponent: true/false selectresources owned by other players
 */
var mouseResource = function( planets, planetid, index, empty, friendly, opponent ) {

	var resource = tiles[planetid].getChildByName("resource" + index);
	var structure = planets[planetid].resources[index].structure;

	resource.mouseEnabled = false; // Set all false to begin with...

	if (empty && !structure) {

		resource.mouseEnabled = true;

	}
	else if ( structure && friendly && structure.player == clientTurn ) {

		resource.mouseEnabled = true;

	}
	else if ( structure && opponent && structure.player != clientTurn ){

		resource.mouseEnabled = true;

	}
};

/**
 * Initialize stars shape, add to tile container
 */
var initStars = function( planetid, img_width) {
	var stars = new createjs.Shape();
	stars.name = "stars";

	tiles[planetid].on("rollover", function() {
		setPlanetSelection( planetid );
	});

	tiles[planetid].on("rollout", function() {
		hidePlanetSelection( planetid );
	});
	var starsImg = loader.getResult("stars");
	var starOffsetX = Math.floor(Math.random() * (starsImg.width - (4 * sWid)));
	var starOffsetY = Math.floor(Math.random() * (starsImg.height - (4 * sWid)));
	stars.graphics.beginBitmapFill(starsImg).drawRect(starOffsetX, starOffsetY, 2 * img_width, 2 * img_width);
	stars.scaleX = 0.5;
	stars.scaleY = 0.5;
	stars.x = starOffsetX * -0.5;
	stars.y = starOffsetY * -0.5;

	tiles[planetid].addChild( stars );
};

/**
 * Draws stars by selecting a random section of the stars image
 * TODO: Rotate as well as offset, so pattern less easy to discern
 */
var drawStars = function( planetid, img_width ) {
	// I don't think we need to do anything here
	// var stars = tiles[planetid].getChildByName("stars");
	// var starsImg = loader.getResult("stars");
	// var starOffsetX = Math.floor(Math.random() * (starsImg.width - (2 * sWid)));
	// var starOffsetY = Math.floor(Math.random() * (starsImg.height - (2 * sWid)));

	// stars.graphics.beginBitmapFill(starsImg).drawRect(starOffsetX, starOffsetY, img_width, img_width);

	// stars.x = starOffsetX * -1;
	// stars.y = starOffsetY * -1;

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
	
	planet.mouseChildren = false;
	planet.mouseEnabled = true;
	planet.alpha = 0;

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

	var planets = clientGame.game.board.planets;

	var img_id = planets[planetid].art;
	var planetImg = loader.getResult("planet_" + img_id);
	var offsetX = -12;
	var offsetY = 73;
	if ( planets[planetid].w == 2 ) {
		offsetX = 5;
		offsetY = 30;
	}
	// clear before drawing, we call this function multiple times
	picture.graphics.clear();
	picture.graphics.beginBitmapFill(planetImg).drawRect(offsetX, offsetY, planetImg.width, planetImg.height);
	
	switch ( planets[planetid].w ) {

		case 1:
			picture.scaleX = 0.45;
			picture.scaleY = 0.45;
			picture.x = offsetX * -1;
			picture.y = offsetY * -1 + 45;
			break;

		case 2:
			picture.x = offsetX * -1 + 5;
			picture.y = offsetY * -1 + 5;
			break;
	}

	planet.hitArea = tiles[planetid].getChildByName("stars");
	tiles[planetid].addChild( planet );
};

/**
 * Draws a planet if it has been explored
 */
var drawPlanet = function( planetid ) {
	
	var planets = clientGame.game.board.planets;

	if (planets[planetid].explored) {

		var planet = tiles[planetid].getChildByName("planet");

		if (planet.alpha == 0) {
			fadeIn( planet, 2000, false, false);
		}
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
	var planets = clientGame.game.board.planets;
	var text = "Sector " + sectors.charAt(planetid);
	var nametext = new createjs.Text(text, "normal 25px Play", "white");
	nametext.name = "nametext";

	nametext.alpha = 0.7;
	nametext.textAlign = "center";
	nametext.shadow = new createjs.Shadow("rgba(0,0,0,0.7)", 2, 2, 2);
	nametext.x = ( sWid * planets[planetid].w ) / 2.0;
	nametext.mouseEnabled = false;

	switch ( planets[planetid].w ) {
		case 1:
			nametext.y = 89;
			break;
		case 2:
			nametext.y = 197;
			break;
	}

	tiles[planetid].addChild( nametext );
};

/**
 * Draw name of planet (or 'Sector X') if planet unexplored
 */
var drawNametext = function( planetid ) {

	var planets = clientGame.game.board.planets;
	var nametext = tiles[planetid].getChildByName("nametext");

	if ( planets[planetid].explored && !nametext.isActualNameShown){

		nametext.alpha = 1;
		nametext.text = planets[planetid].name;
		nametext.isActualNameShown = true;

		switch ( planets[planetid].w ) {
			case 1:
				nametext.y = 121;
				break;
			case 2:
				nametext.y = 315;
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

	var planets = clientGame.game.board.planets;
	var num_resources = planets[planetid].resources.length;
	var kind = planets[planetid].resources[index].kind;

	var resource = new createjs.Container();
	resource.name = "resource" + index;

	var icon = new createjs.Shape();
	icon.name = "icon";
	var iconImg = loader.getResult(resourceIndex[kind]);
	var iconW = iconImg.width;
	var iconH = iconImg.height;
	icon.graphics.beginBitmapFill(iconImg).drawRect(0, 0, iconW, iconH);
	var midX = (planets[planetid].w * sWid) / 2.0;
	var allW = (num_resources * iconW) + (2 * (num_resources -1));
	icon.x = index * (4 + iconW);
	icon.y = 0;
	resource.addChild(icon);

	var flag = new createjs.Shape();
	flag.name = "flag";
	flag.visible = false;
	flag.x = icon.x + 44;
	flag.y = icon.y;
	resource.addChild(flag);

	var value = new createjs.Text("2", "bold 40px Play", "white");
	value.name = "value";
	value.shadow = new createjs.Shadow("rgba(0,0,0,0.5)", 2, 2, 1);
	value.visible = false;
	value.x = icon.x + 12;
	value.y = icon.y;
	resource.addChild(value);

	var structure = new createjs.Container();
	structure.name = "structure";
	structure.visible = false;
	structure.x = icon.x + 38;
	structure.y = icon.y - 38;
	structure.scaleX = 0.9;
	structure.scaleY = 0.9;

	var structureimage = new createjs.Shape();
	structureimage.name = "structureimage";
	structure.addChild(structureimage);
	resource.addChild(structure);

	resource.mouseChildren = false;
	resource.mouseEnabled = true;
	resource.visible = false;

	resource.on("mouseover", function() {
		selectResource(planetid, index);
	});

	resource.on("mouseout", function() {
		hideSelection();
	});

	resource.on("click", function() {
		handleClickResource( planetid, index );
	});

	resource.x = midX - (allW / 2.0);

	switch( planets[planetid].w ) {
		case 1:
			resource.y = 152; 
			break;
		case 2:
			resource.y = 349;
			break;
	}

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

	if ( !resource.visible ){
		fadeIn( resource, 500, false, false );
	}

	var flag = resource.getChildByName("flag");
	var reserved = planets[planetid].resources[index].reserved;
	if ( reserved != undefined && !flag.visible) {
		flag.graphics.clear();
		var flagImg = loader.getResult( "flag_color" + reserved);
		flag.graphics.beginBitmapFill(flagImg, "no-repeat").drawRect(0, 0, flagImg.width, flagImg.height);
		fadeIn( flag, 500, false, false );
	}

	var value = resource.getChildByName("value");
	var resource_num = planets[planetid].resources[index].num;
	if ( resource_num > 1){
		value.isPermanent = true;
		if ( !value.visible ){
			fadeIn(value, 500, false, false);
		}
	}
	else if (value.visible) {
		fadeOut(value, 200, false);
	}

	var structure = resource.getChildByName("structure");
	var struct = planets[planetid].resources[index].structure;
	if ( struct ) {

		if ( !structure.visible || struct.kind != structure.kind ){

			var player = struct.player;
			var kind = struct.kind;
			var structureimage = structure.getChildByName("structureimage");
			structureimage.graphics.clear();
			var structureImg = loader.getResult( 'structures' + String(player) );

			switch (kind){
				case OBJ_MINE:
					structureimage.graphics.beginBitmapFill(structureImg, "no-repeat").drawRect(280, 100, 68, 68);
					structureimage.x = -280;
					structureimage.y = -70;
					break;
				case OBJ_FACTORY:
					structureimage.graphics.beginBitmapFill(structureImg, "no-repeat").drawRect(280, 0, 68, 100);
					structureimage.x = -280;
					structureimage.y = 0;
					break;
				case OBJ_EMBASSY:
					structureimage.graphics.beginBitmapFill(structureImg, "no-repeat").drawRect(416, 0, 74, 100);
					structureimage.x = -419;
					structureimage.y = 0;
					break;
				default:
					break;
			}

			structure.kind = kind;
			fadeIn( structure, 500, true, false);
		}
	}
	else if ( structure.visible ){
		structure.kind = undefined;
		fadeOut(structure, 500, false);
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

/**
 * Initialize planet shape, add to tile container
 */
var initSpyEyes = function ( planetid ) {

	var spyeyes = new createjs.Container();
	spyeyes.name = "spyeyes";

	spyeyes.mouseEnabled = false;

	switch( clientGame.game.board.planets[planetid].w ) {
		case 2:
			spyeyes.x = 22;
			spyeyes.y = 340;
			break;
		case 1:
			spyeyes.x = 12;
			spyeyes.y = 148;
			break;
		default:
			break;
	}

	tiles[planetid].addChild( spyeyes );
};

/**
 * Draws a planet if it has been explored
 */
var drawSpyEyes = function( planetid ) {
	
	var planet =  clientGame.game.board.planets[planetid];

	if (planet.explored ) {

		// clear before drawing, we call this function multiple times
		var spyeyes = tiles[planetid].getChildByName("spyeyes");
		var num_eyes = spyeyes.numChildren;

		for( var e = 0; e < num_eyes; e++ ) {
			spyeyes.removeChildAt( e );
		} 

		var yOffset = 0;

		for ( var i = 0; i < clientGame.game.num_players; i++ ) {

			if ( planet.spyeyes[i] > 0 ) {
				var spyEyeImg = loader.getResult("spy_eye_color" + i);

				for ( var s = 0; s < planet.spyeyes[i]; s++ ){
					
					var spyEyeShape = new createjs.Bitmap(spyEyeImg);

					yOffset -= 44;

					spyEyeShape.x = 0;
					spyEyeShape.y = yOffset;

					spyeyes.addChild( spyEyeShape );
				}
			}
		}
	}
};

var initDarkScreen = function(planetid, img_width) {
	var darkscreen = new createjs.Shape();
	darkscreen.name = "darkscreen";
	darkscreen.graphics.beginFill("rgba(0, 0, 0, 0.4)");
	darkscreen.graphics.drawRect(0, 0, img_width, img_width);
	tiles[planetid].addChild(darkscreen);
};

var drawDarkScreen = function(planetid, img_width) {
	
	var planets = clientGame.game.board.planets;
	var darkscreen = tiles[planetid].getChildByName("darkscreen");
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

var initLightScreen = function(planetid, img_width) {
	var lightscreen = new createjs.Shape();
	lightscreen.name = "lightscreen";
	lightscreen.graphics.beginFill("rgba(255, 255, 255, 0.1)");
	lightscreen.graphics.drawRect(0, 0, img_width, img_width);
	lightscreen.visible = false;
	tiles[planetid].addChild(lightscreen);
};

var drawLightScreen = function(planetid, img_width) {
	// we don't currently need to do anything here
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
var initBorder = function( planetid, img_width ) {
	var border = new createjs.Shape();
	border.name = "border";
	border.graphics.setStrokeStyle(10);
	border.graphics.beginStroke("rgba(0,0,0,0.9)");
	border.graphics.drawRect(0, 0, img_width, img_width);
	tiles[planetid].addChild( border );
};

/**
 * Draw border for a tile given a planet id
 */
var drawBorder = function( planetid, img_width ) {
	// we don't currently need to do anything here
};

/* 
 * click handlers
 */
var handleClickResource = function( planetid, index ) {

	var objecttype;
	var planet = clientGame.game.board.planets[planetid];
	var structure = planet.resources[index].structure;

	if ( structure ){
		objecttype = structure.kind;
	}

	switch (clientGame.game.phase) {
		case PHS_UPKEEP:
			setPendingAction( ACT_REMOVE );
			if (structure) {
				setPendingObject( objecttype );
			}
			break;
		case PHS_MISSIONS:
			switch (pendingAction.agenttype){
				case AGT_SABATEUR:
				case AGT_MINER:
					setPendingObject( objecttype );
					if ( structure ){
						setPendingTargetPlayer( structure.player );
					}
					break;
				case AGT_SURVEYOR:
					setPendingChoice(index);
					var resource = tiles[planetid].getChildByName("resource" + index);
					var value = resource.getChildByName("value");
					if ( !value.visible ){
						fadeIn(value, 200, false, false);
					}
					else if ( !value.isPermanent ) {
						fadeOut(value, 200, false);
					}
					break;
				default:
					break;
			}
			break;
		case PHS_ACTIONS:
			if (pendingAction.actiontype == ACT_FLEET_ATTACK){
				setPendingChoice(index);
				setPendingObject(objecttype);
				setPendingTargetPlayer( structure.player );
			}
			break;
		default:
			break;
	}

	setPendingPlanet(planetid);
	setPendingResource(index);

	if ( isPendingActionReady() ) {
		// only automatically display confirm menu if we're not resolving
		// an ambassador or surveyor mission. Those confirm menus should 
		// only be triggered by an explicit 'done' command
		if ((clientGame.game.phase == PHS_MISSIONS
			 && ( pendingAction.agenttype == AGT_SURVEYOR 
			 	  || pendingAction.agenttype == AGT_AMBASSADOR )) == false ) {
			displayConfirmMenu();
		}
	}
};

var handleClickPlanet = function( planetid ) {

	setPendingPlanet(planetid);
	setPendingResource( RES_NONE );

	if ( isPendingActionReady() ) {
		displayConfirmMenu();
	}
};