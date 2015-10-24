var DOMimageMap = [
	{ elmt: '#input-username-div', path: 'login/', img: 'login' },
	{ elmt: '#lobby-div', path: 'lobby/', img: 'lobby_menu' },
	{ elmt: '#create-game-button', path: 'lobby/', img: 'createnew_button' },
	{ elmt: '#resume-game-button', path: 'lobby/', img: 'resume_button' },
	{ elmt: '.game-button', path: 'lobby/', img: 'joingame_button' },
	{ elmt: '.send-message-button', path: 'lobby/', img: 'sendmessage_button' },
	{ elmt: '#staging-div', path: 'staging/', img: 'staging_menu' },
	{ elmt: '.staging-playernum-button', path: 'staging/', img: 'player_button' },
	{ elmt: '.staging-playernum-selected', path: 'staging/', img: 'player_button' },
	{ elmt: '.staging-pointnum-button', path: 'staging/', img: 'point_button' },
	{ elmt: '.staging-pointnum-selected', path: 'staging/', img: 'point_button' },
	{ elmt: '#staging-ready-button', path: 'staging/', img: 'ready_button' },
	{ elmt: '#staging-leave-button', path: 'staging/', img: 'back_button' }
];

$.fn.preload = function() {
    this.each(function(){
        $('<img/>')[0].src = this;
    });
};

$(document).ready(function () {
	setInterfaceImages();
});

$(window).load(function() {
	moveToLogin();
});

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
			displayTurnHelpMessage();
		}

		else {
			clearPendingAction();
		}

		displayYourTurnMenu();
		updateBoard();

	} else {

		clearPendingAction();
		toggleMenu("#pending-action-div", MENU_OFF);
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
		clearPendingAction();
		updateBoardInteractivity();
		toggleMenu('#build-buttons-div');
		toggleMenu("#pending-action-div", MENU_OFF);
		$('#recruit-buttons-div')[0].style.visibility = "hidden";
	}
};

var clickRecruitButton = function() {
	updateBoardInteractivity();
	if ( clientGame.game.round != 0 ) {
		clearPendingAction();
		updateBoardInteractivity();
		toggleMenu('#recruit-buttons-div');
		toggleMenu("#pending-action-div", MENU_OFF);
		$('#build-buttons-div')[0].style.visibility = "hidden";
	}
};

/**
 * Simple function, hides a menu with a given id if visible, makes
 * it visible if it's hidden
 */
var toggleMenu = function( menuid, val ) {
	if ( val == MENU_ON || (val != MENU_OFF && $(menuid)[0].style.visibility == "hidden" )) {
		$(menuid)[0].style.visibility = "visible";  
	}
	else {
		$(menuid)[0].style.visibility = "hidden";
	}
};

var clickStructureButton = function( objecttype ){
	setPendingAction( ACT_BUILD );
	setPendingObject(objecttype);
	toggleMenu("#build-buttons-div");
	displayTurnHelpMessage();
	updateBoardInteractivity();
};

var clickAgentButton = function( agenttype ){
	setPendingAction( ACT_RECRUIT );
	setPendingAgent(agenttype);
	toggleMenu("#recruit-buttons-div");
	displayTurnHelpMessage();
	updateBoardInteractivity();
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

var confirmPendingAction = function() {
	hideConfirmMenu();
	toggleMenu("#pending-action-div", MENU_OFF);
	submitAction();
};

var cancelPendingAction = function() {
	if(clientGame.game.round != 0) {
		clearPendingAction();
		toggleMenu("#pending-action-div", MENU_OFF);
		updateBoardInteractivity();
	}
	hideConfirmMenu();
};

var displayGameMessages = function() {
    updateMessagesHtml( clientGame.messages, "game-messages-div");
};

var displayStagingMessages = function() {
    updateMessagesHtml( clientGame.messages, "staging-messages-div");
};

var updateMessagesHtml = function( messages, div_id ) {

    var messagesHtml = '<table style="height:10px" class="message-table"><tr><td class="msg-self-td"></td><td class="msg-content-td"></td></tr>';
    var msg = null;
    var combinedMessage;

    for (var m = 0; m < messages.length; m++){

    	combinedMessage = '';
        msg = messages[m];
        messagesHtml += '<tr>'

        // if server message, message spans both columns and is centered
        if (msg.id == -1) {
            messagesHtml += '<td class="msg-server-td" colspan="2" >' + msg.message + '</td>';
        }
        else {

        	messagesHtml += ( msg.id == clientId ? '<td class="msg-self-td" >' : '<td class="msg-user-td" >' );
        	messagesHtml += all_users[msg.id].name + '</td>';

        	while ( m < messages.length && messages[ m ].id == msg.id ) {

            		combinedMessage += messages[ m ].message + '<br>';
            		m++; 
            }
            // decrement m again otherwise we'll skip the first message input by a new user
            m--;

            messagesHtml += '<td class="msg-content-td';
            messagesHtml += ( msg.id == clientId ? ' msg-self-content-td">' : '">') + combinedMessage + '</td>';
        }

        messagesHtml += '</tr>'
    }
    messagesHtml += '</table>'

    var msgDiv = document.getElementById( div_id ); //different
    msgDiv.innerHTML = messagesHtml;
    msgDiv.scrollTop = msgDiv.scrollHeight; // scroll to bottom
};

/**
 * Display your turn menu (and fades back out after a few seconds)
 */
var displayYourTurnMenu = function() {
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
	switch (pendingAction.actiontype){
		case ACT_PLACE:
			message = "Choose a location to place your mine";
			break;
		case ACT_BUILD:
			message = "Choose a location to build your " + 
					   OBJ_ENGLISH[pendingAction.objecttype];
			break;
		case ACT_RECRUIT:
			message = "Choose a planet to recruit your " + 
					   AGT_ENGLISH[pendingAction.agenttype];
			break;
		default:
			break;
	}

	$('#pending-action-div')[0].innerHTML = message;
	toggleMenu("#pending-action-div", MENU_ON);
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

	for ( var i = 0; i < clientGame.game.players.length; i++ ) {
		var innerHTML = "";

		if ( i == clientTurn) {
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

		var username = all_users[clientGame.game.players[i]].name;

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

/** 
 * Sets UX images using DOMimageMap, picking images according to the 
 * current device pixel ratio
 */
var setInterfaceImages = function() {

	var px = window.devicePixelRatio > 1.0 ? '2x_' : '1x_';

	for (var i = 0; i < DOMimageMap.length; i++){
		var element = DOMimageMap[i];

		var name = element.elmt;
		var img = element.img;
		var path = s3url + element.path + px + img;

		$( name ).css("background-image", 'url(' + path + '.png)');
	}
};

var createInterface = function() {
	var innerHTML = '<table id="recruit-agents-table"><tr>';
	var path = s3url + 'interface/';
	var imgSize = pixelRatio <= 1 ? "1x" : "2x";

	for (var i = AGT_EXPLORER; i <= AGT_SABATEUR; i++) {
		innerHTML += '<td style="padding: 0px margin: 0px">'
	 				+ '<input type="image" class="recruit-agent-button"'
					+ ' src="' + path + imgSize + '_agents_bar_' + i + '.png"'
					+ ' width="79px" height="100px"';
		if ( i >= AGT_EXPLORER && i <= AGT_SABATEUR ) {
			innerHTML += ' onclick="javascript:clickAgentButton(' + i + ');"';
		}
		innerHTML += '></input></td>';
	};

	innerHTML += '</tr></table>'
	$('#recruit-buttons-div')[0].innerHTML = innerHTML;
	$('#recruit-buttons-div').css("background-image", "url(" + path + imgSize + "_agents_bar_p" + clientTurn + ".png)");
};