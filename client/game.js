var stage, board, tiles, scale, sWid, is_dragging;
var resizeTimer;
var lastMouse = { x:0, y:0 };
var is_dragging = false;

$(document).ready(function() {

	init_stage();

	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

});

var handleKeyUp = function( e ) {
	switch (e.keyCode) {
		case 189: // dash
			zoomBoard(0.9);
			break;
		case 187: // equals (plus sign)
			zoomBoard(1.1111);
			break;
	}

};

var showInterface = function() {
	document.getElementById('button-bar-div').style.visibility = "visible";
};

var handleKeyDown = function( e ) {
	switch (e.keyCode) {
		case 37: // left arrow
			moveBoard(-1, 0, MOVE_DISTANCE);
			break;
		case 38: // up arrow
			moveBoard(0, -1, MOVE_DISTANCE);
			break;
		case 39:
			moveBoard(1, 0, MOVE_DISTANCE);
			break;
		case 40:
			moveBoard(0, 1, MOVE_DISTANCE);
			break;
	}
};

var handleClickResource = function( planetid, index ) {

	setPendingPlanet(planetid);
	setPendingResource(index);
	if ( isPendingActionReady() ) {
		displayConfirmMenu();
	}
	else {
		console.log("not enough info yet to create an action");
	}
};

var handleClickPlanet = function( planetid ) {

	setPendingPlanet(planetid);
	setPendingResource( RES_NONE );
	console.log("clicked Tile. pendingAction:", pendingAction);
	if ( isPendingActionReady() ) {
		console.log("yep! enough to make an action!");
		displayConfirmMenu();
	}
	else {
		console.log("not enough info yet to create an action");
	}
};

/**
 * Returns true if all required fields of the pending action
 * have been filled.
 */
var isPendingActionReady = function() {

	var actiontype = pendingAction.actiontype;

	if ( actiontype ) {
		console.log('pendingAction:', pendingAction);
		var requirements = ACTION_REQUIREMENTS[ actiontype ];

		// make sure pendingAction has all required attributes
		for (var i = 0; i < requirements.length; i++) {

			if ( pendingAction[ requirements[i] ] == undefined){
				console.log('pending action not ready');
				return false;
			}
		}
	} 
	else {
		console.log('pending action not ready');
		return false;
	}
	console.log('pending action good to go!');
	return true;
};

var submitTurnDone = function(name) {
    socket_submitTurnDone();
};



var toggleTurnMenu = function() {

	// Stand in. Current logic only works if we assume we're on round 0
	if( clientGame.game.turn == clientTurn ) {
		if( clientGame.game.round == 0){
			setPendingObject( OBJ_MINE );
    		setPendingAction( ACT_PLACE );
    		showPendingActionDiv();
		}
		else {
			clearPendingAction();
		}
    	displayYourTurnMenu();
    	updateBoard();

    } else {

    	clearPendingAction();
    	hidePendingActionDiv();
    	hideYourTurnMenu();
    	updateBoard();

    }
    updateBoardInteractivity();
};

var clickBuildButton = function() {
	if(clientGame.game.round != 0 && document.getElementById('build-buttons-div').style.visibility == "hidden") {
		document.getElementById('build-buttons-div').style.visibility = "visible";
		setPendingAction( ACT_BUILD );
	}
	else {
		document.getElementById('build-buttons-div').style.visibility = "hidden";
		if ( clientGame.game.round != 0 ){
			clearPendingAction();
		}
	}
};

var clickStructureButton = function( objecttype ){
	setPendingObject(objecttype);
	updateBoardInteractivity();
	console.log('set pending object to ' + OBJ_ENGLISH[objecttype]);
};

var toggleRecruitMenu = function() {
	console.log("this is where we would show agents to recruit");
};

var showPendingActionDiv = function() {
	document.getElementById('pending-action-div').style.visibility = "visible";
};

var hidePendingActionDiv = function() {
	document.getElementById('pending-action-div').style.visibility = "hidden";
};

/**
 * This should eventually be capable of showing specific messages
 * ex. Not enough resources to complete that action
 *	   That agent cannot be sent on a mission right now, etc.
 */
var toggleIllegalActionMenu = function() {
	alert("That action is not possible right now");
};

var displayConfirmMenu = function() {
	displayConfirmMessage();
	document.getElementById('confirm-action-div').style.visibility = "visible";
	$("#confirm-action-div").animate({ opacity: 1.00, top: "40%"}, 500 );
};

var hideConfirmMenu = function() {
	$("#confirm-action-div").animate({ opacity: 0.00, top: "38%"}, 500, function(){
		document.getElementById('confirm-action-div').style.visibility = "hidden";
	});
};

var confirmPendingAction = function() {
	hideConfirmMenu();
	doAction();
};

var cancelPendingAction = function() {
	hideConfirmMenu();
};

var doAction = function() {
	socket_submitAction();
};

var displayConfirmMessage = function() {

	var message;

	var planets = clientGame.game.board.planets;
	var planet = planets[ pendingAction.planetid ];
	var planetname = planet.name;

	var actiontype = pendingAction.actiontype;
	var objecttype = pendingAction.objecttype;
	var index = pendingAction.resourceid;
	// set resource kind to  if index = 4
	var resourcekind = index == RES_NONE ? RES_NONE : planet.resources[index].kind;

	message = ACT_ENGLISH[actiontype] + " a " + RES_ENGLISH[resourcekind] + " " + OBJ_ENGLISH[objecttype] + " on " + planetname + "?";
	document.getElementById('your-action-message-div').innerHTML = message;
};

var hideYourTurnMenu = function() {
	document.getElementById('turn-done-button').style.visibility = "hidden";
	$("#your-turn-div").animate({ opacity: 0.00, top: "38%"}, 500, function(){
		document.getElementById('your-turn-div').style.visibility = "hidden";
	});
};

/**
 * Display your turn menu (and fade back out after a few seconds)
 */
var displayYourTurnMenu = function() {
	displayTurnHelpMessage();
	document.getElementById('your-turn-div').style.visibility = "visible";
	document.getElementById('turn-done-button').style.visibility = "visible";
	$("#your-turn-div").animate({ opacity: 1.00, top: "40%"}, 500, function() {
		$("#your-turn-div").delay(3000).animate({ opacity: 0.00, top: "38%"}, 500, function(){
			document.getElementById('your-turn-div').style.visibility = "hidden";
		});
	});
};

/**
 * Returns true if object type is 
 */
var isSpaceObject = function(objecttype) {
	return (objecttype == OBJ_BASE || objecttype == OBJ_FLEET);
};

var isBuildTypeAction = function(actiontype) {
	return (actiontype == ACT_PLACE || actiontype == ACT_BUILD);
};

var isUpgradeObject = function(objecttype) {
	return (objecttype == OBJ_FACTORY || objecttype == OBJ_EMBASSY);
};

/**
 * Displays a message in the 'pending-action-div' div telling the player
 * what to do, based on the round #
 */
var displayTurnHelpMessage = function() {
	var message;
	switch(clientGame.game.round) {
		case 0:
			message = "Choose a location to place your mine";
			break;
		default:
			message = "";
			break;
	}
	document.getElementById('pending-action-div').innerHTML = message;
};

// Updates local copy of game with server's version
var updateClientGame = function( gameInfo ) {
	$.extend(true, clientGame, gameInfo);
};

var game_init = function( gameInfo ) {
	set_globals();
	updateClientGame(gameInfo);
	clientColor = clientGame.game.players.indexOf( clientId );
	clientTurn = clientGame.game.players.indexOf( clientId );
	console.log("client turn:", clientTurn);
};

/**
 * Called on game_init. Clears old game globals, re-sets defaults.
 *
 * TODO: this is a mess. We should split this into a few functions
 */
var set_globals = function() {
	stage.removeChild(board);
	board = new createjs.Container();
	tiles = [];
	scale = 0.8;
	stage.update();
};

/**
 * Calls init and draw functions for each tile in game board
 */
var drawBoard = function() {

	if (stage) {

		setCanvasSize();

		var asteroids = clientGame.game.board.asteroids;

		for ( var a = 0; a < asteroids.length; a++ ) {
			drawAsteroid( asteroids[a] );
		}

		var planets = clientGame.game.board.planets;

		for ( var p = 0; p < planets.length; p++ ) {	

			initTile(p);
			drawTile(p);

		}

		stage.addChild( board );
		
		zoomBoard(1); 
	}
};

/**
 * Calls 
 */
var updateBoardInteractivity = function() {
	var planets = clientGame.game.board.planets;

	for ( var p = 0; p < planets.length; p++ ) {	

			updateTileInteractivity(p);

		}
};

/**
 * Calls update functions on each tile to update appearance, interactivity
 * based on current pending action or game event
 */
var updateBoard = function() {

	var planets = clientGame.game.board.planets;

	for ( var p = 0; p < planets.length; p++ ) {	

			updateTileInteractivity(p);
			updateTileImage(p);
		}

	stage.update();
};
