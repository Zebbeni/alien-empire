var DOMimageMap = [
	{ elmt: '#input-username-div', path: 'login/', img: 'login' },
	{ elmt: '#text-title-div', path: 'login/', img: 'title'},
	{ elmt: '#players-time-div', path: 'login/', img: 'players_time' },
	{ elmt: '#github-div', path: 'login/', img: 'github' },
	{ elmt: '#lobby-div', path: 'lobby/', img: 'lobby_menu' },
	{ elmt: '#lobby-title-div', path: 'login/', img: 'title'},
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
	{ elmt: '#staging-leave-button', path: 'staging/', img: 'back_button' },
	{ elmt: '#points-remaining', path: 'interface/', img: 'points_remaining'},
	{ elmt: '.player-div', path: 'interface/', img: 'player_menu'},
	{ elmt: '.player-trade-request-div', path: 'interface/', img: 'request_trade', ext: '.gif'},
	{ elmt: '.player-start-icon', path: 'interface/', img: 'player_start'},
	{ elmt: '.metal-icon', path: 'interface/', img: 'res_metal_icon'},
	{ elmt: '.water-icon', path: 'interface/', img: 'res_water_icon'},
	{ elmt: '.fuel-icon', path: 'interface/', img: 'res_fuel_icon'},
	{ elmt: '.food-icon', path: 'interface/', img: 'res_food_icon'},
	{ elmt: '.points-icon', path: 'interface/', img: 'points_icon'},
	{ elmt: '#resources-menu-div', path: 'interface/', img: 'resources_menu'},
	{ elmt: '#structures-menu-div', path: 'interface/', img: 'structures_menu'},
	{ elmt: '#agents-menu-div', path: 'interface/', img: 'agents_menu'},
	{ elmt: '#trade-button', path: 'interface/', img: 'trade_button'},
	{ elmt: '#trade-menu-div', path: 'interface/', img: 'trade_menu'},
	{ elmt: '.trade-arrow-up', path: 'interface/', img: 'trade_arrow_button'},
	{ elmt: '.trade-arrow-down', path: 'interface/', img: 'trade_arrow_button'},
	{ elmt: '.trade-radio-button', path: 'interface/', img: 'trade_radio_button'},
	{ elmt: '#trade-button-yes', path: 'interface/', img: 'trade_choice_button'},
	{ elmt: '#trade-button-no', path: 'interface/', img: 'trade_choice_button'},
	{ elmt: '.fourtoone-button', path: 'interface/', img: '4to1_button'},
	{ elmt: '.respkg-collect-div', path: 'interface/', img: 'collect_menu'},
	{ elmt: '.respkg-upkeep-div', path: 'interface/', img: 'upkeep_menu'},
	{ elmt: '.respkg-arrow-div', path: 'interface/', img: 'resources_arrow', ext: '.gif'},
	{ elmt: '.struct-mine-button', path: 'interface/', img: 'structmine_button'},
	{ elmt: '.struct-factory-button', path: 'interface/', img: 'structfactory_button'},
	{ elmt: '.struct-embassy-button', path: 'interface/', img: 'structembassy_button'},
	{ elmt: '.struct-base-button', path: 'interface/', img: 'structbase_button'},
	{ elmt: '.struct-fleet-button', path: 'interface/', img: 'structfleet_button'},
	{ elmt: '#agent-button-explorer', path: 'interface/', img: 'agentexplorer_button'},
	{ elmt: '#agent-button-miner', path: 'interface/', img: 'agentminer_button'},
	{ elmt: '#agent-button-surveyor', path: 'interface/', img: 'agentsurveyor_button'},
	{ elmt: '#agent-button-ambassador', path: 'interface/', img: 'agentambassador_button'},
	{ elmt: '#agent-button-envoy', path: 'interface/', img: 'agentenvoy_button'},
	{ elmt: '#agent-button-spy', path: 'interface/', img: 'agentspy_button'},
	{ elmt: '#agent-button-smuggler', path: 'interface/', img: 'agentsmuggler_button'},
	{ elmt: '#agent-button-sabateur', path: 'interface/', img: 'agentsabateur_button'},
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

var createInterface = function() {
	createPlayerStatsMenus();
	createTurnHelpMessage();
	createBottomBarMenus();
	createRoundMenu();
}
/**
 * Updates menus and board interactivity when a game action occurs.
 * TODO: Break this up and/or rename it. It's grown in its responsibility
 */
var updateInterface = function() {

	clearPendingAction();

	if( clientGame.game.playerTurn == clientTurn ) {

		if( clientGame.game.round == 0){
			setPendingObject( OBJ_MINE );
			setPendingAction( ACT_PLACE );
		}

		displayYourTurnMenu();
		updateBoard();

	} else {

		hideYourTurnMenu();
		updateBoard();

	}
	updatePointsRemainingMenu();
	updatePlayerStatsMenus();
	updateBottomBarMenus();
	updateRoundMenu();
	updatePhaseMenus();
	updateTurnHelpMessage();
	updateResourcePkgMenu();
	updateResourceAnimations();

	setInterfaceImages();
};

/**
 * Displays an 'illegal action' message returned from the server.
 * TODO: Animate this in a nice div instead of an ugly alert
 */
var toggleIllegalActionMenu = function(response) {
	alert( response );
};

var clickBuildButton = function() {
	if ( clientGame.game.round != 0 ) {
		updateBoardInteractivity();
		$('#recruit-buttons-div')[0].style.visibility = "hidden";
	}
};

var clickRecruitButton = function() {
	if ( clientGame.game.round != 0 ) {
		updateBoardInteractivity();
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
	if ( clientGame.game.phase == PHS_BUILD ) {
		setPendingAction( ACT_BUILD );
		setPendingObject(objecttype);
		updateTurnHelpMessage();
		updateBoardInteractivity();
	}
};

var clickAgentButton = function( agenttype ){
	if ( clientGame.game.phase == PHS_BUILD ) {
		setPendingAction( ACT_RECRUIT );
		setPendingAgent(agenttype);
		updateTurnHelpMessage();
		updateBoardInteractivity();
	}
};

var hideYourTurnMenu = function() {
	$('#turn-done-button')[0].style.visibility = "hidden";
	$("#your-turn-div").transition({ opacity: 0.00, top: "28%"}, 500, function(){
		$('#your-turn-div')[0].style.visibility = "hidden";
	});
};

var displayConfirmMenu = function() {
	if ( clientGame.game.phase == PHS_ACTIONS 
		 && pendingAction.agenttype != AGT_SMUGGLER
		 && pendingAction.actiontype == ACT_LAUNCH_MISSION
		 && pendingAction.usesmuggler == undefined
		 && isSmugglerAvailable(pendingAction.planetid) ){
		displayIncludeSmugglerMenu();
	}
	else {
		displayConfirmMessage();
		$('#confirm-action-div')[0].style.visibility = "visible";
		$("#confirm-action-div").transition({ opacity: 1.00, top: "40%"}, 500 );
	}
};

var hideConfirmMenu = function() {
	$("#confirm-action-div").transition({ opacity: 0.00, top: "38%"}, 500, 
		function(){
			$('#confirm-action-div')[0].style.visibility = "hidden";
		});
};

var displayConfirmMessage = function() {

	var message;

	var actiontype = pendingAction.actiontype;
	var objecttype = pendingAction.objecttype;
	var agenttype = pendingAction.agenttype;
	var planets = clientGame.game.board.planets;

	if ( actiontype != ACT_RETIRE ) {

		var planet = planets[ pendingAction.planetid ];
		var sectorname = sectors.charAt( pendingAction.planetid );
		var planetname = planet.explored ? planet.name : "Sector " + sectorname;

		if ( pendingAction.resourceid != undefined ) {

			var index = pendingAction.resourceid;
			var resourcekind = index == RES_NONE ? RES_NONE : planet.resources[index].kind;
		}
	}

	switch (actiontype) {
		
		case ACT_PLACE:
			message = "Place a ";
			if (resourcekind != RES_NONE){
				message += RES_ENGLISH[resourcekind] + "-collecting ";
			}
			message += OBJ_ENGLISH[objecttype] + " on " + planetname + "?";
			break;

		case ACT_BUILD:
			message = "Build a ";
			if (resourcekind != RES_NONE){
				message += RES_ENGLISH[resourcekind] + "-collecting ";
			}
			message += OBJ_ENGLISH[objecttype] + " on " + planetname + "?";
			break;

		case ACT_RECRUIT:
			message = "Recruit your " + AGT_ENGLISH[agenttype] 
						+ " on " + planetname + "?";
			break;

		case ACT_RETIRE:
			message = "Retire your " + AGT_ENGLISH[agenttype] 
						+ "? <br>(Agents cannot be recruited once retired)";
			break;

		case ACT_REMOVE:
			message = "Remove your ";
			if (resourcekind != RES_NONE){
				message += RES_ENGLISH[resourcekind] + "-collecting ";
			}
			message += OBJ_ENGLISH[objecttype] + " from " + planetname + "?";
			break;

		case ACT_REMOVE_FLEET:
			message = "Remove your " + OBJ_ENGLISH[OBJ_FLEET] + " from "
						+ planetname + "?";
			break;

		case ACT_MOVE_AGENT:
			message = "Move your " + AGT_ENGLISH[agenttype] + " to " 
						+ planetname + "?";
			break;

		case ACT_FLEET_MOVE:
			var fleet = clientGame.game.board.fleets[pendingAction.targetid];
			var planetfrom = planets[fleet.planetid].name;
			message = "Move your " + OBJ_ENGLISH[OBJ_FLEET] + " from "
						+ planetfrom + " to " + planetname + "?";
			break;

		case ACT_FLEET_ATTACK:
			var targetPlayer = pendingAction.targetPlayer;
			var userid = clientGame.game.players[targetPlayer];
			var targetName = all_users[userid].name;
			message = "Attack " + targetName + "'s " + OBJ_ENGLISH[objecttype] + " with your fleet?";
			break;

		case ACT_BASE_ATTACK:
			var targetPlayer = pendingAction.targetPlayer;
			var userid = clientGame.game.players[targetPlayer];
			var targetName = all_users[userid].name;
			message = "Attack " + targetName + "'s " + OBJ_ENGLISH[objecttype] + " with your base?";
			break;

		case ACT_LAUNCH_MISSION:
			message = "Send your " + AGT_ENGLISH[agenttype] + " on a mission "
						+ " to " + planetname + "?";
			break;

		case ACT_BLOCK_MISSION:
			var choice = pendingAction.choice == true ? "Block" : "Allow";
			message = choice + " this mission?";
			break;

		case ACT_MISSION_RESOLVE:
			switch (agenttype) {
				
				case AGT_EXPLORER:
					message = "Reserve a " + RES_ENGLISH[resourcekind]
								+ " resource on " + planetname + "?";
					break;
				
				case AGT_MINER:
					message = "Collect 6 " + RES_ENGLISH[resourcekind] + "?";
					break;

				case AGT_SABATEUR:

					var targetPlayer = pendingAction.targetPlayer;
					var userid = clientGame.game.players[targetPlayer];
					var targetName = all_users[userid].name;
					var resObjects = [OBJ_EMBASSY, OBJ_FACTORY, OBJ_MINE];

					message = "Destroy " + targetName + "'s ";

					if ( resObjects.indexOf(pendingAction.objecttype) != -1 ) {
						message += RES_ENGLISH[ resourcekind ] + "-collecting ";
					}
					
					message += OBJ_ENGLISH[objecttype] + " on " + planetname + "?";
					
					break;

				case AGT_SURVEYOR:

					var choices = pendingAction.choice;
					message = "Increase mine production for ";
					var names = [];
					for ( var i = 0; i < choices.length; i++ ){
						names.push(RES_ENGLISH[ planet.resources[choices[i]].kind ]);
					}
					message += englishList(names, "no resources");
					message += " on " + planetname + "?";

					break;

				case AGT_AMBASSADOR:

					var choices = pendingAction.choice;
					message = "Block travel from " + planetname + " to ";
					var names = [];
					for ( var i = 0; i < choices.length; i++ ){
						names.push(planets[ choices[i] ].name);
					}
					message += englishList(names, "no planets") + "?";
					break;
				default:
					break;
			}
			break;

		default:
			message = "";
			break;
	}

	$('#your-action-message-div')[0].innerHTML = message;
};

var displayIncludeSmugglerMenu = function(){
	$('#include-smuggler-div')[0].style.visibility = "visible";
	$("#include-smuggler-div").transition({ opacity: 1.00, top: "40%"}, 500 );	
};

var hideIncludeSmugglerMenu = function() {
	$("#include-smuggler-div").transition({ opacity: 0.00, top: "38%"}, 500, 
		function(){
			$('#include-smuggler-div')[0].style.visibility = "hidden";
		});
};

var englishList = function(list, ifnone){
	var string = "";
	if (list.length <= 0) {
		string += ifnone;
	}
	else if (list.length == 1) {
		string += list[0];
	}
	else {
		for ( var i = 0; i < list.length - 1; i++ ){
			string += list[i] + ", ";
		}
		string += " and " + list[i];
	}
	return string;
};

var includeSmuggler = function( include ){
	setPendingSmuggler(include);
	hideIncludeSmugglerMenu();
	displayConfirmMenu();
};

var confirmPendingAction = function() {
	hideConfirmMenu();
	submitAction();
};

var cancelPendingAction = function() {
	if(clientGame.game.round != 0 && clientGame.game.phase != PHS_MISSIONS) {
		clearPendingAction();
		updateBoardInteractivity();
	}
	hideConfirmMenu();
};

var isSmugglerAvailable = function( planetid ){
	var agentid = String(clientTurn) + String(pendingAction.agenttype);
	var smugglerid = String(clientTurn) + String(AGT_SMUGGLER);
	var agent = clientGame.game.board.agents[ agentid ];
	var smuggler = clientGame.game.board.agents[ smugglerid ];
	return (smuggler.planetid == agent.planetid && !smuggler.used && smuggler.status == AGT_STATUS_ON);
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
	var ignore = [ ACT_BLOCK_MISSION, 
				   ACT_MISSION_RESOLVE, 
				   ACT_MISSION_VIEWED];

	for (var m = 0; m < messages.length; m++){

		// combinedMessage = '';
		msg = messages[m];

		// if server message, message spans both columns and is centered
		switch (msg.id) {
			case MSG_SERVER:
				messagesHtml += buildServerMessage( msg );
				break;
			case MSG_ACTION:
				var actiontype = msg.message.actiontype;
				if ( ignore.indexOf(actiontype) == -1 ) {
					messagesHtml += buildActionMessage( msg.message );
				}
				break;
			default:
				var htmlAndM = buildChatMessage( msg, messages, m );
				messagesHtml += htmlAndM.html;
				m = htmlAndM.m;
				break;
		}
	}
	messagesHtml += '</table>'

	var msgDiv = document.getElementById( div_id ); //different
	msgDiv.innerHTML = messagesHtml;
	msgDiv.scrollTop = msgDiv.scrollHeight; // scroll to bottom
};

// return a message spanning both columns
var buildServerMessage = function( msg ) {
	return '<tr><td class="msg-server-td" colspan="2" >' + msg.message + '</td></tr>';
};

// builds and returns a message based on the variables in @action
var buildActionMessage = function( actionMsg ){
	var player = actionMsg.player;
	var userid = clientGame.game.players[player];
	var name = all_users[userid].name;

	messagesHtml = '<tr><td class="msg-action-td msg-action-p' + player + '" colspan="2" >';

	var message = name + ACT_ENGLISH_PAST[actionMsg.actiontype];
	switch ( actionMsg.actiontype ) {
		case ACT_PLACE:
		case ACT_BUILD:
			message += OBJ_ENGLISH[actionMsg.objecttype];
			message += ' at ' + clientGame.game.board.planets[actionMsg.planetid].name;
			break;
		case ACT_RECRUIT:
			message += AGT_ENGLISH[actionMsg.agenttype];
			message += ' at ' + clientGame.game.board.planets[actionMsg.planetid].name;
			break;
		case ACT_RETIRE:
			message += AGT_ENGLISH[actionMsg.agenttype];
			break;
		case ACT_REMOVE:
		case ACT_REMOVE_FLEET:
			message += OBJ_ENGLISH[actionMsg.objecttype];
			message += ' at ' + clientGame.game.board.planets[actionMsg.planetid].name;
			break;
		case ACT_MOVE_AGENT:
			message += AGT_ENGLISH[actionMsg.agenttype] 
					+ ' to ' + clientGame.game.board.planets[actionMsg.planetid].name;
			break;
		default:
			break;
	}

	messagesHtml += message;
	messagesHtml += '</td></tr>'
	return messagesHtml;
};

// loops through and combines all concurrent messages from the same user into
// one. Returns this as well as an updated value for @m (the message index)
var buildChatMessage = function( msg, messages, m) {

	messagesHtml = ( msg.id == clientId ? '<tr><td class="msg-self-td" >' : '<td class="msg-user-td" >' );
	messagesHtml += all_users[msg.id].name + '</td>';

	var combinedMessage = '';

	while ( m < messages.length && messages[ m ].id == msg.id ) {

			combinedMessage += messages[ m ].message + '<br>';
			m++; 
	}
	// decrement m again otherwise we'll skip the first message input by a new user
	m--;

	messagesHtml += '<td class="msg-content-td';
	messagesHtml += ( msg.id == clientId ? ' msg-self-content-td">' : '">') + combinedMessage + '</td></tr>';

	return { html: messagesHtml, m: m };
};

/**
 * Display your turn menu (and fades back out after a few seconds)
 */
var displayYourTurnMenu = function() {
	$('#your-turn-div')[0].style.visibility = "visible";
	$('#turn-done-button')[0].style.visibility = "visible";
	$("#your-turn-div").transition({ opacity: 1.00, top: "30%"}, 500, function() {
		$("#your-turn-div").delay(3000).transition({ opacity: 0.00, top: "28%"}, 500, function(){
			$('#your-turn-div')[0].style.visibility = "hidden";
		});
	});
};

var createTurnHelpMessage = function() {
	$('#pending-action-div')[0].style.visibility = "visible";
};

var updateTurnHelpMessage = function() {

	var message = "";
	var actiontype = (pendingAction != {} ? pendingAction.actiontype : null)

	switch (clientGame.game.phase) {

		case PHS_PLACING:

			if (clientTurn == clientGame.game.playerTurn){
				if ( clientGame.game.secondmines ){
					message = "Choose an empty resource to place"
								+ " your last free mine";
				} 
				else {
					message = "Choose an empty resource to place"
								+ " your first free mine";
				}
			}
			break;

		case PHS_UPKEEP:

			if ( !clientGame.game.phaseDone[clientTurn] ) {
				message = "You may click structures or agents to remove"
							+ " before paying upkeep";
			}
			break;

		case PHS_BUILD:

			if (clientTurn == clientGame.game.playerTurn){
				if (actiontype == ACT_BUILD){
					message = "Choose a location to place your "
								+ OBJ_ENGLISH[pendingAction.objecttype];
				} else if (actiontype == ACT_RECRUIT) {
					message = "Choose a planet to recruit your "
								+ AGT_ENGLISH[pendingAction.agenttype];
				} else {
					message = "Click a structure or agent to place on board"
								+ " (or click End Turn)";
				}
			}
			break;

		case PHS_ACTIONS:

			if ( clientTurn == clientGame.game.playerTurn ){
				if ( actiontype == ACT_MOVE_AGENT ){
					message = "Click a location to move your "
								+ AGT_ENGLISH[pendingAction.agenttype];
				}
				else if ( actiontype == ACT_LAUNCH_MISSION ){
					message = "Click a location to send your "
							+ AGT_ENGLISH[pendingAction.agenttype]
							+ " on a mission";
				}
			}
			break;
			
		case PHS_RESOURCE:
		default:
			break;

	}

	$('#pending-action-div')[0].innerHTML = message;
};

var updatePointsRemainingMenu = function() {
	var points_remaining = clientGame.game.points_remaining;
	$('#points-remaining-explore')[0].innerHTML = points_remaining[PNT_EXPLORE];
	$('#points-remaining-envoy')[0].innerHTML = points_remaining[PNT_ENVOY];
	$('#points-remaining-destroy')[0].innerHTML = points_remaining[PNT_DESTROY];
};

/**
 * Initializes player-div and its inner divs, player-turn-div and player-stats-div
 * Creates basic structure first and then calls reusable updatePlayersTurnMenus and 
 * updatePlayersStatsMenus functions to fill contents 
 */
var createPlayerStatsMenus = function() {

	var innerHTML = "";

	for ( var i = 0; i < clientGame.players.length; i++ ) {

		innerHTML += '<div id="player-div' + i + '" class="player-div" style="bottom: 100px">';

		var username = all_users[clientGame.game.players[i]].name;
		var resources = clientGame.game.resources[i];
		var points = clientGame.game.points[i];

		innerHTML += '<div class="player-id-div">' + username + '</div>';
		innerHTML += '<div class="player-trade-request-div" onclick="javascript:drawTradeMenu(' + i + ')">Requesting Trade</div>';
		innerHTML += '<div class="player-points-div"></div>';
		innerHTML += '<div class="player-start-icon"></div>';
		innerHTML += '<div class="player-stats-div">';
		
		innerHTML += '<table class="player-stats-table"><tr>';
		innerHTML += '<td class="metal-icon"></td>';
		innerHTML += '<td class="water-icon"></td>';
		innerHTML += '<td class="fuel-icon"></td>';
		innerHTML += '<td class="food-icon"></td>';

		innerHTML += '</tr></table>';
		innerHTML += '</div>';
		innerHTML += '</div>';
	}

	$('#players-wrapper-div')[0].innerHTML = innerHTML;
	$('#players-wrapper-div')[0].style.visibility = "visible";
};

var updatePlayerStatsMenus = function() {

	var numPlayers = clientGame.players.length;
	var inc = (100.0 / numPlayers) / 2.0;
	
	var spacing = 5;
	var playerDivWid = 250 + spacing;

	var wrapperWid = ( numPlayers * playerDivWid ) - spacing;
	var wrapperMargin = -1 * (wrapperWid / 2);

	$('#players-wrapper-div').css({ width: wrapperWid, 
									'margin-left': wrapperMargin });

	for ( var i = 0; i < clientGame.players.length; i++ ) {
		var left = playerDivWid * i + "px";

		$('#player-div' + i).css({left: left });

		var playerDiv = '#player-div' + i;
		var resources = clientGame.game.resources[i];
		var points = clientGame.game.points[i];

		$(playerDiv).find('.metal-icon')[0].innerHTML = resources[RES_METAL];
		$(playerDiv).find('.water-icon')[0].innerHTML = resources[RES_WATER];
		$(playerDiv).find('.fuel-icon')[0].innerHTML = resources[RES_FUEL];
		$(playerDiv).find('.food-icon')[0].innerHTML = resources[RES_FOOD];
		$(playerDiv).find('.player-points-div')[0].innerHTML = points[PNT_TOTAL];

		if ( i != clientTurn 
			 && clientGame.game.trades[i] != undefined
			 && clientGame.game.trades[i].offered_to.indexOf(clientTurn) != -1
			 && clientGame.game.trades[i].declined.indexOf(clientTurn) == -1 ) {
			$(playerDiv).find('.player-trade-request-div')[0].style.visibility = "visible";
		}
		else {
			$(playerDiv).find('.player-trade-request-div')[0].style.visibility = "hidden";
		}

		if ( i == clientGame.game.playerOffset ){
			$(playerDiv).find('.player-start-icon')[0].style.visibility = "visible";
		}
		else {
			$(playerDiv).find('.player-start-icon')[0].style.visibility = "hidden";
		}
	}
};

var createBottomBarMenus = function() {
	createResourcesMenu();
	createStructuresMenu();
	createAgentsMenu();
};

var updateBottomBarMenus = function() {
	updateResourcesMenu();
	updateStructuresMenu();
	updateAgentsMenu();
};

var createStructuresMenu = function() {
	var innerHTML = '';

	innerHTML += '<div id="struct-mines-div"><table class="struct-table">'
					+ '</table></div>';
	innerHTML += '<div id="struct-fleets-div"><table class="struct-table">'
					+ '</table></div>';
	innerHTML += '<div id="struct-factories-div"><table class="struct-table">'
					+ '</table></div>';
	innerHTML += '<div id="struct-embassies-div"><table class="struct-table">'
					+ '</table></div>';
	innerHTML += '<div id="struct-base-div"></div>';

	$('#structures-menu-div')[0].innerHTML = innerHTML;

	updateStructuresMenu();
};

var updateStructuresMenu = function() {

	var structures = clientGame.game.structures[clientTurn];

	var innerHTML = '<tr>';
	for ( var i = 0; i < 4; i++ ){
		innerHTML += (i < structures[OBJ_MINE] ? 
				  '<td><input type="button" class="struct-mine-button"'
				  + 'onclick="javascript:clickStructureButton(OBJ_MINE);"></input></td>':
				  '<td width="34px" height="34px"></td>');
	}
	innerHTML += '</tr>';
	$('#struct-mines-div').find('.struct-table').html(innerHTML);

	innerHTML = '<tr>';
	for ( var i = 0; i < 3; i++ ){
		innerHTML += (i < structures[OBJ_FLEET] ? 
				  '<td><input type="button" class="struct-fleet-button"'
				  + 'onclick="javascript:clickStructureButton(OBJ_FLEET);"></input></td>':
				  '<td width="42px" height="33px"></td>');
	}
	innerHTML += '</tr>';
	$('#struct-fleets-div').find('.struct-table').html(innerHTML);

	innerHTML = '<tr>';
	for ( var i = 0; i < 3; i++ ){
		innerHTML += (i < structures[OBJ_FACTORY] ? 
				  '<td><input type="button" class="struct-factory-button"'
				  + 'onclick="javascript:clickStructureButton(OBJ_FACTORY);"></input></td>':
				  '<td width="34px" height="50px"></td>');
	}
	innerHTML += '</tr>'
	$('#struct-factories-div').find('.struct-table').html(innerHTML);

	innerHTML = '<tr>';
	for ( var i = 0; i < 5; i++ ){
		innerHTML += (i < structures[OBJ_EMBASSY] ? 
				  '<td><input type="button" class="struct-embassy-button"'
				  + 'onclick="javascript:clickStructureButton(OBJ_EMBASSY);"></input></td>':
				  '<td width="37px" height="50px"></td>');
	}
	innerHTML += '</tr>'
	$('#struct-embassies-div').find('.struct-table').html(innerHTML);

	innerHTML = (structures[OBJ_BASE] > 0 ? 
			  '<input type="button" class="struct-base-button"'
			  + 'onclick="javascript:clickStructureButton(OBJ_BASE);"></input>':
			  '');
	$('#struct-base-div').html(innerHTML);
};

var createAgentsMenu = function() {
	var innerHTML = '<table id="agents-table"></table>';

	$('#agents-menu-div')[0].innerHTML = innerHTML;

	updateAgentsMenu();
};

var updateAgentsMenu = function() {
	var innerHTML = '<tr>';

	innerHTML += '<td><input type="button" class="agent-button" id="agent-button-explorer" '
				+ 'onclick="javascript:clickAgentButton(AGT_EXPLORER);"></input></td>';
	innerHTML += '<td><input type="button" class="agent-button" id="agent-button-miner" '
				+ 'onclick="javascript:clickAgentButton(AGT_MINER);"></input></td>';
	innerHTML += '<td><input type="button" class="agent-button" id="agent-button-surveyor" '
				+ 'onclick="javascript:clickAgentButton(AGT_SURVEYOR);"></input></td>';
	innerHTML += '<td><input type="button" class="agent-button" id="agent-button-smuggler" '
				+ 'onclick="javascript:clickAgentButton(AGT_SMUGGLER);"></input></td>';

	innerHTML += '</tr><tr>';

	innerHTML += '<td><input type="button" class="agent-button" id="agent-button-ambassador" '
				+ 'onclick="javascript:clickAgentButton(AGT_AMBASSADOR);"></input></td>';
	innerHTML += '<td><input type="button" class="agent-button" id="agent-button-envoy" '
				+ 'onclick="javascript:clickAgentButton(AGT_ENVOY);"></input></td>';
	innerHTML += '<td><input type="button" class="agent-button" id="agent-button-spy" '
				+ 'onclick="javascript:clickAgentButton(AGT_SPY);"></input></td>';
	innerHTML += '<td><input type="button" class="agent-button" id="agent-button-sabateur" '
				+ 'onclick="javascript:clickAgentButton(AGT_SABATEUR);"></input></td>';

	innerHTML += '</tr>';

	$('#agents-table').html(innerHTML);
};

var createRoundMenu = function() {
	for (var i = PHS_MISSIONS; i <= PHS_ACTIONS; i++){
		$('#phase-td' + i)[0].innerHTML = PHS_ENGLISH[i];
	};
};

var updateRoundMenu = function() {

	if (clientGame.game.phase == PHS_PLACING){
		$('#round-td')[0].innerHTML = PHS_ENGLISH[PHS_PLACING];
		$('#round-td').css({background: "rgba(255, 255, 100, 0.5"});
	}
	else {
		$('#round-td')[0].innerHTML = 'Round ' + clientGame.game.round;
		$('#round-td').css({background: "none"});
	}

	for (var i = PHS_MISSIONS; i <= PHS_ACTIONS; i++){
		if ( i == clientGame.game.phase) {
			$('#phase-td' + i).addClass('phase-td-current')
		} 
		else {
			$('#phase-td' + i).removeClass('phase-td-current')
		}
	};
};

var updatePhaseMenus = function() {

	$('#missions-phase-div').hide();
	$('#resource-phase-div').hide();
	$('#upkeep-phase-div').hide();

	switch(clientGame.game.phase) {
		case PHS_MISSIONS:
			updateMissionsMenu();
			$('#missions-phase-div').show();
			break;
		case PHS_RESOURCE:
			$('#resource-phase-div').show();
			break;
		case PHS_UPKEEP:
			$('#upkeep-phase-div').show();
			break;
		default:
			break;
	}
};

/**
 * Displays mission resolving information to each client based on which round
 * and mission index we're on. 
 */
var updateMissionsMenu = function() {

	var missionRound = clientGame.game.round - 2;
	var missionindex = clientGame.game.missionindex;
	var missions = clientGame.game.missions;
	var innerHTML = '';

	$('#missions-choice-menu')[0].style.visibility = "hidden";
	$('#missions-spy-menu')[0].style.visibility = "hidden";
	$('#mission-collect-button')[0].style.visibility = "hidden";
	$('#missions-resolution-menu')[0].style.visibility = "hidden";

	if ( missionRound <= 0 || missions[missionRound].length == 0) {
		innerHTML += 'There are no missions to resolve this round';
	}
	else {
		var mission = missions[ missionRound ][ missionindex ];
		var player = mission.player;
		var agenttype = mission.agenttype;
		var userid = clientGame.game.players[player];
		var name = player == clientTurn ? 'You' : all_users[userid].name;
		var planetname = clientGame.game.board.planets[ mission.planetTo ].name;
		var message = "";

		// display basic mission information
		// (eg. Bob sent an Explorer to Sector G!)
		innerHTML += name + ' sent a ' 
						+ AGT_ENGLISH[agenttype] 
						+ ' to ' + planetname;

		// if mission has been resolved
		if ( mission.resolution.resolved == true ) {
			// display mission resolution message (eg. no-fly zones placed on __)
			$('#missions-resolution-menu')[0].style.visibility = "visible";

			if ( mission.resolution.blocked ) {
				var blocker = mission.resolution.blockedBy;
				var blockerid = clientGame.game.players[blocker];
				message = "Mission blocked by " + all_users[blockerid].name;
			}
			else if ( mission.resolution.agentmia ){
				message = "Agent no longer on board to complete mission";
			}
			else if ( mission.resolution.noflyblocked ){
				message = "Agent blocked by no fly zone";
			}
			else if ( mission.resolution.nochoice ){
				switch ( agenttype ){
					case AGT_EXPLORER:
						message = "Mission resolved,"
									+ " no more resources to reserve here";
						break;
					case AGT_MINER:
						message = "Mission resolved,"
									+ " no occupied resources to collect here";
						break;
					case AGT_ENVOY:
						message = "Mission resolved,"
									+ name + " has no embassy on this planet";
						break;
					default:
						message = "Mission resolved";
						break;
				}
			}
			else {
				message = "Mission is resolved";
			}

			$('#missions-resolution-menu')[0].innerHTML = message;

			if ( clientGame.game.missionViewed[clientTurn] == false ) {
				// wait 5 seconds and move to next mission
				viewMissionAction();
			}
		}

		// otherwise, if we can block this mission
		// display spy block menu (block mission, allow)
		else if ( clientGame.game.missionSpied[ clientTurn ] == undefined ) {

			// automatically allow if this is client's own mission
			if ( clientTurn == player ){
				blockMissionAction( false );
			} 
			else if ( clientGame.game.board.planets[mission.planetTo].spyeyes[clientTurn] <= 0 ) {
				blockMissionAction( false );
			}
			else {
				$('#missions-spy-menu')[0].style.visibility = "visible";
				if ( agenttype == AGT_MINER || agenttype == AGT_ENVOY ) {
					$('#mission-collect-button')[0].style.visibility = "visible";
				}
			}
		}

		// if all clients have responded with spy actions
		else if ( mission.waitingOnResolve ) {
			// and if this is actually this client's mission
			if ( clientTurn == player ) {

				setPendingAction( ACT_MISSION_RESOLVE );
				setPendingAgent( agenttype );
				setPendingPlanet( mission.planetTo );

				// if this is a mission type that requires no additional choices, 
				// just submit a generic resolution to the server without waiting
				if ( [AGT_SMUGGLER, AGT_SPY, AGT_ENVOY].indexOf(agenttype) != -1 ) {
					submitAction();
				}
				// if mission type would normally require some extra decision
				// (eg. select resource) and no remaining legal options exist
				// just submit a generic resolution to the server
				else if ( mission.resolution.nochoice ) {
					submitAction();
				}
				// otherwise, show help message (with done button)
				else {
					var messageHtml = '';
					switch ( agenttype ) {
						case AGT_EXPLORER:
							messageHtml = 'Choose a resource to reserve';
							break;
						case AGT_MINER:
							messageHtml = 'Choose a resource you occupy to collect 6';
							break;
						case AGT_SURVEYOR:
							if ( pendingAction.choice == undefined 
								 || pendingAction.choice.constructor !== Array) {
								setPendingChoice([]);
							}
							messageHtml = 'Choose up to 2 resources to increase and click Done';
							break;
						case AGT_AMBASSADOR:
							if ( pendingAction.choice == undefined 
								 || pendingAction.choice.constructor !== Array) {
								setPendingChoice([]);
								updateNoFlyZones();
								stage.update();
							}
							messageHtml = 'Choose up to 2 borders to block';
							break;
						case AGT_SABATEUR:
							messageHtml = 'Choose an opponent structure to destroy';
							break;
						default:
							break;
					}
					$('#missions-choice-message')[0].innerHTML = messageHtml;
					$('#missions-choice-menu')[0].style.visibility = "visible";
				}
			}
		}
	}

	$('#missions-phase-info')[0].innerHTML = innerHTML;

};

// sets pending action to ACT_BLOCK_MISSION and submits it to
// the server with a decision (true, false, or null)
// true: block, false: don't block, null: collect resources for mission
var blockMissionAction = function( value ){
	setPendingAction( ACT_BLOCK_MISSION );
	setPendingChoice( value );
	submitAction();
};

var viewMissionAction = function() {
	setPendingAction( ACT_MISSION_VIEWED );
	setPendingChoice( clientGame.game.missionindex );
	submitAction();
};

var showActionMenu = function() {
	$('#agent-action-div')[0].style.visibility = "visible";
};

var hideActionMenu = function() {
	$('#agent-action-div')[0].style.visibility = "hidden";
	$('#agent-move-button')[0].style.visibility = "hidden";
};

var cancelAction = function() {
	clearPendingAction();
	hideActionMenu();
	updateBoardInteractivity();
};

// actortype is a string, 'fleet' 'agent' or 'base'
// id is a fleetid, agenttype, or base planetid
var updateActionMenu = function( actortype, id ){
	setPendingChoice(undefined); // ensure choice is not an array (This might be better when switching phases)
	if ( actortype == 'agent' ){
		$('#agent-action-name')[0].innerHTML = "Action: " + AGT_ENGLISH[id];
		$('#agent-move-button').prop('value', 'Move');
		$('#agent-move-button')[0].style.visibility = "visible";
		$('#agent-move-button').off().click( function() { 
											hideActionMenu();
											setPendingAction( ACT_MOVE_AGENT );
											updateBoardInteractivity();
											updateTurnHelpMessage();
										} );
		$('#agent-mission-button').prop('value', 'Mission');
		$('#agent-mission-button').off().click( function() { 
											hideActionMenu();
											setPendingAction( ACT_LAUNCH_MISSION );
											updateBoardInteractivity();
											updateTurnHelpMessage();
										} );
	}
	else if ( actortype == 'fleet'){
		if ( pendingAction.actiontype != ACT_BASE_ATTACK 
			 && pendingAction.actiontype != ACT_FLEET_ATTACK) {
			$('#agent-action-name')[0].innerHTML = "Action: " + OBJ_ENGLISH[OBJ_FLEET];
			$('#agent-move-button').prop('value', 'Move');
			$('#agent-move-button')[0].style.visibility = "visible";
			$('#agent-move-button').off().click( function() { 
												hideActionMenu();
												setPendingAction( ACT_FLEET_MOVE );
												updateBoardInteractivity();
												// updateTurnHelpMessage();
											} );
			$('#agent-mission-button').prop('value', 'Attack');
			$('#agent-mission-button').off().click( function() { 
												hideActionMenu();
												setPendingAction( ACT_FLEET_ATTACK );
												updateBoardInteractivity();
												// updateTurnHelpMessage();
											} );
		}
	}
	else if ( actortype == 'base'){
		$('#agent-action-name')[0].innerHTML = "Action: " + OBJ_ENGLISH[OBJ_BASE];
		$('#agent-move-button')[0].style.visibility = "hidden";
		$('#agent-mission-button').prop('value', 'Attack');
		$('#agent-mission-button').off().click( function() { 
											hideActionMenu();
											setPendingAction( ACT_BASE_ATTACK );
											updateBoardInteractivity();
											// updateTurnHelpMessage();
										} );
	}
};

/** 
 * Sets UX images using DOMimageMap, picking images according to the 
 * current device pixel ratio
 * TODO: this is currently being called WAY too often. there should be a better
 * function to target only css that needs to be updated
 */
var setInterfaceImages = function() {

	var px = window.devicePixelRatio > 1.0 ? '2x_' : '1x_';

	for (var i = 0; i < DOMimageMap.length; i++){
		var element = DOMimageMap[i];

		var name = element.elmt;
		var img = element.img;
		var path = s3url + element.path + px + img;
		var ext = element.ext == undefined ? '.png' : element.ext;
		$( name ).css("background-image", 'url(' + path + ext + ')');
	}
};