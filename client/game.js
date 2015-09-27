var stage, board, tiles, fleets, scale, sWid, is_dragging;
var resizeTimer;
var lastMouse = { x:0, y:0 };
var is_dragging = false;
var playerMenuOn = [false, false, false, false];

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
	$('#button-bar-div')[0].style.visibility = "visible";
	createPlayersMenu();
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
	if ( isPendingActionReady() ) {
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
		var requirements = ACTION_REQUIREMENTS[ actiontype ];

		// make sure pendingAction has all required attributes
		for (var i = 0; i < requirements.length; i++) {

			if ( pendingAction[ requirements[i] ] == undefined){
				return false;
			}
		}
	} 
	else {
		return false;
	}
	return true;
};

var submitTurnDone = function(name) {
    socket_submitTurnDone();
};

/**
 * Updates menus and board interactivity when a game action occurs.
 * TODO: Break this up and/or rename it. It's grown in its function
 */
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

    for ( var i = 0; i < clientGame.game.players.length; i++) {
    	if (i == clientGame.game.turn ){
    		$('#player-turn-div' + i).animate({opacity: 1.0});
    	}
    	else {
	    	$('#player-turn-div' + i).animate({opacity: 0.0});
	    }
    }
    // updatePlayersMenu();
    updateBoardInteractivity();
};

var clickBuildButton = function() {
	if(clientGame.game.round != 0 && $('#build-buttons-div')[0].style.visibility == "hidden") {
		$('#build-buttons-div')[0].style.visibility = "visible";
		setPendingAction( ACT_BUILD );
	}
	else {
		$('#build-buttons-div')[0].style.visibility = "hidden";
		if ( clientGame.game.round != 0 ){
			clearPendingAction();
		}
	}
};

var clickStructureButton = function( objecttype ){
	setPendingObject(objecttype);
	updateBoardInteractivity();
};

var toggleRecruitMenu = function() {
	console.log("this is where we would show agents to recruit");
};

var showPendingActionDiv = function() {
	$('#pending-action-div')[0].style.visibility = "visible";
};

var hidePendingActionDiv = function() {
	$('#pending-action-div')[0].style.visibility = "hidden";
};

/**
 * This should eventually be capable of showing specific messages
 * ex. Not enough resources to complete that action
 *	   That agent cannot be sent on a mission right now, etc.
 */
var toggleIllegalActionMenu = function(response) {
	alert( response );
};

var togglePlayersMenu = function( i ) {
	if ( playerMenuOn[i] ){
		$("#player-div" + i ).animate({height: '100px', bottom: '100px'}, 500);
		playerMenuOn[i] = false;
	} else {
		$("#player-div" + i ).animate({height: '415px', bottom: '415px'}, 500);
		playerMenuOn[i] = true;
	}
};

var createPlayersMenu = function() {

	// var wrapperWidth = (210 * clientGame.players.length);
	// $('#players-wrapper-div')[0].style.width = wrapperWidth + "px";

	// var marginleft = Math.round(wrapperWidth / -2) + "px";
	// $('#players-wrapper-div')[0].style.marginLeft = marginleft;

	// var innerHTML = "";

	// for (var i = 0; i < clientGame.players.length; i++ ){

	// 	innerHTML += '<div id="player-div' + i 
	// 				 + '" class="player-div" style="bottom: 100px" '
	// 				 + ' onclick="javascript:togglePlayersMenu(' + i + ')">';

	// 	innerHTML += '<div id="player-turn-div' + i + '" class="player-turn-div">';

	// 	if (i == clientTurn) {
	// 		innerHTML += "Your turn!";
	// 	}
	// 	else {
	// 		innerHTML += all_users[clientGame.game.players[i]].name + "'s turn";
	// 	}

	// 	innerHTML += '</div>';
	// 	innerHTML += '<div id="player-stats-div' + i +'" class="player-stats-div"></div>';
	// 	innerHTML += '</div>';

	// }

	// $('#players-wrapper-div')[0].innerHTML = innerHTML;

	updatePlayersMenu();

	$('#players-wrapper-div')[0].style.visibility = "visible";
};

var updatePlayersMenu = function() {

	var wrapperWidth = (210 * clientGame.players.length);
	$('#players-wrapper-div')[0].style.width = wrapperWidth + "px";

	var marginleft = Math.round(wrapperWidth / -2) + "px";
	$('#players-wrapper-div')[0].style.marginLeft = marginleft;

	$('#players-wrapper-div')[0].innerHTML = "";

	for ( var i = 0; i < clientGame.players.length; i++ ) {

		var innerHTML = "";

		innerHTML += '<div id="player-div' + i 
					 + '" class="player-div" style="bottom: 100px" '
					 + ' onclick="javascript:togglePlayersMenu(' + i + ')">';

		innerHTML += '<div id="player-turn-div' + i + '" class="player-turn-div">';

		if (i == clientTurn) {
			innerHTML += "Your turn!";
		}
		else {
			innerHTML += all_users[clientGame.game.players[i]].name + "'s turn";
		}

		innerHTML += '</div>';
		innerHTML += '<div id="player-stats-div' + i +'" class="player-stats-div"></div>';
		innerHTML += '</div>';

		$('#players-wrapper-div')[0].innerHTML += innerHTML;

		var playersDiv = $('#player-div' + i)[0];

		var statsDiv = $('#player-stats-div' + i )[0];

		var username = all_users[clientGame.players[i]].name;

		var points = clientGame.game.points[i];
		var structures = clientGame.game.structures[i];
		var resources = clientGame.game.resources[i];

		statsDivHTML = username;
		statsDivHTML += '<br>' + points[PNT_TOTAL];

		statsDivHTML += '<p style="text-align:left">';
		statsDivHTML += 'Metal: ' + resources[RES_METAL];
		statsDivHTML += '<br>Water: ' + resources[RES_WATER];
		statsDivHTML += '<br>Fuel: ' + resources[RES_FUEL];
		statsDivHTML += '<br>Food: ' + resources[RES_FOOD];

		statsDivHTML += '<br><br>Structure Points: ' + points[PNT_STRUCTURES];
		statsDivHTML += '<br>Exploration Points:  ' + points[PNT_EXPLORE];
		statsDivHTML += '<br>Envoy Points:        ' + points[PNT_ENVOY];
		statsDivHTML += '<br>Destruction Points:  ' + points[PNT_DESTROY];

		statsDivHTML += '<br><br>Mines: ' + structures[OBJ_MINE];
		statsDivHTML += '<br>Factories:  ' + structures[OBJ_FACTORY];
		statsDivHTML += '<br>Embassies:        ' + structures[OBJ_EMBASSY];
		statsDivHTML += '<br>Bases:  ' + structures[OBJ_BASE];
		statsDivHTML += '<br>Fleets:  ' + structures[OBJ_FLEET];
		statsDivHTML += '</p>';

		statsDiv.innerHTML = statsDivHTML;
	}
};

var displayConfirmMenu = function() {
	displayConfirmMessage();
	$('#confirm-action-div')[0].style.visibility = "visible";
	$("#confirm-action-div").animate({ opacity: 1.00, top: "40%"}, 500 );
};

var hideConfirmMenu = function() {
	$("#confirm-action-div").animate({ opacity: 0.00, top: "38%"}, 500, 
		function(){
			$('#confirm-action-div')[0].style.visibility = "hidden";
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
	$('#your-action-message-div')[0].innerHTML = message;
};

var hideYourTurnMenu = function() {
	$('#turn-done-button')[0].style.visibility = "hidden";
	$("#your-turn-div").animate({ opacity: 0.00, top: "38%"}, 500, function(){
		$('#your-turn-div')[0].style.visibility = "hidden";
	});
};

/**
 * Display your turn menu (and fade back out after a few seconds)
 */
var displayYourTurnMenu = function() {
	displayTurnHelpMessage();
	$('#your-turn-div')[0].style.visibility = "visible";
	$('#turn-done-button')[0].style.visibility = "visible";
	$("#your-turn-div").animate({ opacity: 1.00, top: "40%"}, 500, function() {
		$("#your-turn-div").delay(3000).animate({ opacity: 0.00, top: "38%"}, 500, function(){
			$('#your-turn-div')[0].style.visibility = "hidden";
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
	$('#pending-action-div')[0].innerHTML = message;
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
	fleetshapes = {};
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

		initFleets();
		for ( var p = 0; p < planets.length; p++ ) {	

			updateFleets(p);
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
			updateFleets(p);
		}

	stage.update();
};
