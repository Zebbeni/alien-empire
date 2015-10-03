
var playerMenuOn = [false, false, false, false];

var toggleRecruitMenu = function() {
	console.log("this is where we would show agents to recruit");
};

/**
 * Displays an 'illegal action' message returned from the server.
 * TODO: Animate this in a nice div instead of an ugly alert
 */
var toggleIllegalActionMenu = function(response) {
	alert( response );
};

/**
 * Uses the playerMenuOn array to determine if a player div is expanded or
 * collapsed. Toggles to the opposite state when clicked and transitions correctly
 */
var togglePlayersMenu = function( i ) {
	if ( playerMenuOn[i] ){
		$("#player-div" + i ).transition({height: '100px', bottom: '100px'}, 500);
		playerMenuOn[i] = false;
	} else {
		$("#player-div" + i ).transition({height: '415px', bottom: '415px'}, 500);
		playerMenuOn[i] = true;
	}
};

/**
 * Updates menus and board interactivity when a game action occurs.
 * TODO: Break this up and/or rename it. It's grown in its responsibility
 */
var toggleTurnMenu = function() {

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

	togglePlayerTurnMenus();
};

/**
 * Fades in or fades out player-turn-divs based on whose turn it is
 */
var togglePlayerTurnMenus = function() {
	for ( var i = 0; i < clientGame.game.players.length; i++) {
		if (i == clientGame.game.turn ){
			$('#player-turn-div' + i).transition({opacity: 1.0});
		}
		else {
			$('#player-turn-div' + i).transition({opacity: 0.0});
		}
	}
};

var clickBuildButton = function() {
	if ( clientGame.game.round != 0 ) {
		setPendingAction( ACT_BUILD );
		toggleMenu('#build-buttons-div');
		$('#recruit-buttons-div')[0].style.visibility = "hidden";
	}
};

var clickRecruitButton = function() {
	if ( clientGame.game.round != 0 ) {
		setPendingAction( ACT_RECRUIT );
		toggleMenu('#recruit-buttons-div');
		$('#build-buttons-div')[0].style.visibility = "hidden";
	}
};

/**
 * Simple function, hides a menu with a given id if visible, makes
 * it visible if it's hidden
 */
var toggleMenu = function( menuid ) {
	if ( $(menuid)[0].style.visibility == "hidden" ) {
		$(menuid)[0].style.visibility = "visible";  
	}
	else {
		$(menuid)[0].style.visibility = "hidden";
	}
};

var clickStructureButton = function( objecttype ){
	setPendingObject(objecttype);
	updateBoardInteractivity();
};

var clickAgentButton = function( agenttype ){
	setPendingAgent(agenttype);
	updateBoardInteractivity();

	console.log("recruiting a", AGT_ENGLISH[agenttype]);
};

var hideYourTurnMenu = function() {
	$('#turn-done-button')[0].style.visibility = "hidden";
	$("#your-turn-div").transition({ opacity: 0.00, top: "38%"}, 500, function(){
		$('#your-turn-div')[0].style.visibility = "hidden";
	});
};

var displayConfirmMenu = function() {
	displayConfirmMessage();
	$('#confirm-action-div')[0].style.visibility = "visible";
	$("#confirm-action-div").transition({ opacity: 1.00, top: "40%"}, 500 );
};

var hideConfirmMenu = function() {
	$("#confirm-action-div").transition({ opacity: 0.00, top: "38%"}, 500, 
		function(){
			$('#confirm-action-div')[0].style.visibility = "hidden";
		});
};

var displayConfirmMessage = function() {

	var message;

	var planets = clientGame.game.board.planets;
	var planet = planets[ pendingAction.planetid ];
	var planetname = planet.name;

	var actiontype = pendingAction.actiontype;
	var objecttype = pendingAction.objecttype;
	var agenttype = pendingAction.agenttype;
	var index = pendingAction.resourceid;

	var resourcekind = index == RES_NONE ? RES_NONE : planet.resources[index].kind;

	if ( actiontype == ACT_BUILD || actiontype == ACT_PLACE ) {
		message = ACT_ENGLISH[actiontype] + " a " 
				  + RES_ENGLISH[resourcekind] + " " 
				  + OBJ_ENGLISH[objecttype] + " on " 
				  + planetname + "?";
	} 
	else if ( actiontype == ACT_RECRUIT ) {
		message = ACT_ENGLISH[actiontype] + " a " 
				  + AGT_ENGLISH[agenttype] + " on " 
				  + planetname + "?";
	}

	$('#your-action-message-div')[0].innerHTML = message;
};

var showPendingActionDiv = function() {
	$('#pending-action-div')[0].style.visibility = "visible";
};

var hidePendingActionDiv = function() {
	$('#pending-action-div')[0].style.visibility = "hidden";
};

var confirmPendingAction = function() {
	hideConfirmMenu();
	submitAction();
};

var cancelPendingAction = function() {
	if(clientGame.game.round != 0) {
		clearPendingAction();
		updateBoardInteractivity();
	}
	hideConfirmMenu();
};

/**
 * Display your turn menu (and fades back out after a few seconds)
 */
var displayYourTurnMenu = function() {
	displayTurnHelpMessage();
	$('#your-turn-div')[0].style.visibility = "visible";
	$('#turn-done-button')[0].style.visibility = "visible";
	$("#your-turn-div").transition({ opacity: 1.00, top: "40%"}, 500, function() {
		$("#your-turn-div").delay(3000).transition({ opacity: 0.00, top: "38%"}, 500, function(){
			$('#your-turn-div')[0].style.visibility = "hidden";
		});
	});
};

/**
 * Displays a message in the pending-action-div div telling the player
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

/**
 * Initializes player-div and its inner divs, player-turn-div and player-stats-div
 * Creates basic structure first and then calls reusable updatePlayersTurnMenus and 
 * updatePlayersStatsMenus functions to fill contents 
 */
var createPlayersMenu = function() {

	var wrapperWidth = (210 * clientGame.players.length);
	$('#players-wrapper-div')[0].style.width = wrapperWidth + "px";

	var marginleft = Math.round(wrapperWidth / -2) + "px";
	$('#players-wrapper-div')[0].style.marginLeft = marginleft;

	var innerHTML = "";

	for ( var i = 0; i < clientGame.players.length; i++ ) {

		innerHTML += '<div id="player-div' + i 
					 + '" class="player-div" style="bottom: 100px" '
					 + ' onclick="javascript:togglePlayersMenu(' + i + ')">';

		innerHTML += '<div id="player-turn-div' + i + '" class="player-turn-div"></div>';
		innerHTML += '<div id="player-stats-div' + i +'" class="player-stats-div"></div>';

		innerHTML += '</div>';
	}

	$('#players-wrapper-div')[0].innerHTML = innerHTML;

	createPlayerTurnMenus();
	updatePlayerStatsMenus();

	$('#players-wrapper-div')[0].style.visibility = "visible";
};

var createPlayerTurnMenus = function() {

	for ( var i = 0; i < clientGame.players.length; i++ ) {
		var innerHTML = "";

		if (i == clientTurn) {
			innerHTML += "Your turn!";
		}
		else {
			innerHTML += COL_ENGLISH[i] + "'s turn!";
		}

		$('#player-turn-div' + i )[0].innerHTML = innerHTML;
	}

};

var updatePlayerStatsMenus = function() {

	for ( var i = 0; i < clientGame.players.length; i++ ) {

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