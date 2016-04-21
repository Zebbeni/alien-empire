/** Fleets.js contains all methods for initializing and drawing fleets
 * All fleets are drawn once and then hidden or shown based on their 
 * current planetid (either a number or undefined). 
 */

var initFleets = function() {

	var fleetsContainer = new createjs.Container();
	fleetsContainer.name = 'fleetsContainer';
	fleetsContainer.x = 0;
	fleetsContainer.y = 0;

	for(var fleetid in clientGame.game.board.fleets) {

		var fleet = clientGame.game.board.fleets[fleetid];

		var fleetshape = new createjs.Shape();
		fleetshape.name = OBJ_ENGLISH[ OBJ_FLEET ] + fleetid;
		fleetshape.fleetid = fleetid;

		var fleetImg = loader.getResult( OBJ_ENGLISH[OBJ_FLEET] + fleet.player );
		fleetshape.graphics.beginBitmapFill(fleetImg, "no-repeat").drawRect(0, 0, fleetImg.width, fleetImg.height);
		fleetshape.visible = false;

		fleetshape.mouseEnabled = true;

		fleetshape.on("mouseover", function() {
			selectFleet( this.name );
		});

		fleetshape.on("mouseout", function() {
			hideSelection();
		});

		fleetshape.on("click", function() {
			handleClickFleet( this.fleetid );
		});

		fleetsContainer.addChild( fleetshape );
	}

	board.addChild( fleetsContainer );
};

var updateFleets = function(planetid) {
	var fleetsContainer = board.getChildByName('fleetsContainer');
	var planet = clientGame.game.board.planets[planetid];
	var fleets = clientGame.game.board.fleets;
	var num_fleets = planet.fleets.length;
	var fleetsX, fleetsY;
	var yDist = 50;
	var xDist = 70;
	var xOffset = 0;

	var placeX, placeY;
	var rowLength;
	var rowNum = 0;
	var rowIndex = 0;

	switch (planet.w) {
		case 1:
			fleetsX = tiles[planetid].x + 225;
			fleetsY = tiles[planetid].y + 5;
			break;
		case 2:
			fleetsX = tiles[planetid].x + 420;
			fleetsY = tiles[planetid].y + 35;
			break;
		}

	// Using quadratic formula to always arrange fleets in a nice triangle :)
	rowLength = Math.floor(0.5 + Math.sqrt( 0.25 + ( 2 * (num_fleets - 1))));
	fleetsX -= rowLength * xDist;

	for( var i = 0; i < planet.fleets.length; i++ ){

		var fleetid = planet.fleets[i];
		var fleetshape = fleetsContainer.getChildByName( OBJ_ENGLISH[OBJ_FLEET] + fleetid );

		if( fleets[fleetid].planetid == planetid ){

			placeY = fleetsY + ( rowNum * yDist );
			placeX = fleetsX + xOffset + (xDist * rowIndex);

			if ( !fleetshape.visible ) {
				fleetshape.x = placeX;
				fleetshape.y = placeY;
				fadeIn(fleetshape, 500, true);
			}
			else if ( placeX != fleetshape.x || placeY != fleetshape.y ){
				// we do something very similar to this in a few different places. Ought to move to animations.js
				num_objects_moving += 1;
				createjs.Tween.get(fleetshape).to({ x:placeX, y:placeY}, 500 ).call(handleTweenComplete);
			}

			if ( (rowIndex + 1) % rowLength == 0){
				rowLength -= 1;
				rowNum += 1;
				xOffset += xDist / 2;
				rowIndex = 0;
			}
			else {
				rowIndex += 1;
			}

		}
		else {
			console.log("Fleet doesn't have the correct planetid but planet still sees it.");
		}
	}
};

var updateRemovedFleets = function() {

	var fleets = clientGame.game.board.fleets;
	var fleetsContainer = board.getChildByName('fleetsContainer');

	for ( var fleetid in fleets ){

		if ( fleets[fleetid].planetid == undefined ) {

			var fleetshape = fleetsContainer.getChildByName( OBJ_ENGLISH[OBJ_FLEET] + fleetid );
			fadeOut(fleetshape, 500, true);
		}
	}
};

var updateFleetsInteractivity = function(){
	
	var fleetsContainer = board.getChildByName('fleetsContainer');

	switch ( clientGame.game.phase ) {
		case PHS_UPKEEP:
			mouseOnFleets( true, false );
			break;
		case PHS_MISSIONS:
			
			if (pendingAction.agenttype == AGT_SABATEUR) {
				mouseOnFleets( false, true );
			}
			break;
		case PHS_ACTIONS:
			mouseOnFleets( true, false );
			if ( pendingAction.actiontype == ACT_FLEET_ATTACK
				 || pendingAction.actiontype == ACT_BASE_ATTACK ){
				mouseOnFleets( false, true );
			}
			break;
		default:
			mouseOnFleets( false, false );
			break;
	}
};

var mouseOnFleets = function( friendly, opponent ) {

	var fleets = clientGame.game.board.fleets; 
	var fleetsContainer = board.getChildByName('fleetsContainer');

	for ( var fleetid in fleets ){

		var fleetshape = fleetsContainer.getChildByName( OBJ_ENGLISH[OBJ_FLEET] + fleetid );

		if ( fleets[fleetid].player == clientTurn ){
			fleetshape.mouseEnabled = friendly;
			console.log("enable Mouse " + friendly + " friendly fleet");
		}
		else {
			fleetshape.mouseEnabled = opponent;
			console.log("enable Mouse " + opponent + " opponent fleet");
		}
	}
};

var handleClickFleet = function( fleetid ) {
	
	var fleet = clientGame.game.board.fleets[fleetid];
	var targetPlayer = fleet.player;

	switch( clientGame.game.phase ){
		case PHS_UPKEEP:
			setPendingAction( ACT_REMOVE_FLEET );
			setPendingObject( OBJ_FLEET );
			setPendingPlanet( fleet.planetid );
			setPendingTargetId( fleetid );
			break;
		case PHS_ACTIONS:
			if ( pendingAction.actiontype == ACT_FLEET_ATTACK
				 || pendingAction.actiontype == ACT_BASE_ATTACK ){
				setPendingObject( OBJ_FLEET );
				setPendingChoice( fleetid );
				setPendingTargetPlayer( targetPlayer );
			}
			else {
				setPendingTargetId( fleetid );
				setPendingPlanet( fleet.planetid );
				updateActionMenu( 'fleet', fleetid);
				showActionMenu();
			}
			break;
		case PHS_MISSIONS:
			setPendingObject( OBJ_FLEET );
			setPendingTargetId( fleetid );
			setPendingTargetPlayer( targetPlayer );
			break;
		default:
			break;
	}

	if ( isPendingActionReady() ) {
		displayConfirmMenu();
	}
};

var selectFleet = function( fleetname) {
	var fleetsContainer = board.getChildByName('fleetsContainer');
	var fleetshape = fleetsContainer.getChildByName( fleetname );
	setSelection(fleetshape.x + 15, fleetshape.y - 25);
};