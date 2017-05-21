var imgPx = '2x_';

var DOMimageMap = {
	'#input-username-div': { path: 'login/', img: 'login' },
	'#text-title-div': { path: 'login/', img: 'title'},
	'#players-time-div': { path: 'login/', img: 'players_time' },
	'#github-div': { path: 'login/', img: 'github' },
	'#lobby-div': { path: 'lobby/', img: 'lobby_menu_v2' },
	'#lobby-title-div': { path: 'login/', img: 'title'},
	'#create-game-button': { path: 'lobby/', img: 'createnew_button' },
	'#resume-game-button': { path: 'lobby/', img: 'resume_button' },
	'.game-button': { path: 'lobby/', img: 'joingame_button' },
	'.send-message-button': { path: 'lobby/', img: 'sendmessage_button' },
	'#staging-div': { path: 'staging/', img: 'staging_menu' },
	'.staging-playernum-button': { path: 'staging/', img: 'player_button' },
	'.staging-playernum-selected': { path: 'staging/', img: 'player_button' },
	'.staging-pointnum-button': { path: 'staging/', img: 'point_button' },
	'.staging-pointnum-selected': { path: 'staging/', img: 'point_button' },
	'#staging-ready-button': { path: 'staging/', img: 'ready_button' },
	'#staging-leave-button': { path: 'staging/', img: 'back_button' },
	'#points-remaining': { path: 'interface/', img: 'points_remaining'},
	'.player-div': { path: 'interface/', img: 'player_menu'},
	'#done-button': { path: 'interface/', img: 'end_buttons'},
	'.player-trade-request-div': { path: 'interface/', img: 'request_trade', ext: '.gif'},
	'.player-start-icon': { path: 'interface/', img: 'player_start'},
	'.metal-icon': { path: 'interface/', img: 'res_metal_icon'},
	'.water-icon': { path: 'interface/', img: 'res_water_icon'},
	'.fuel-icon': { path: 'interface/', img: 'res_fuel_icon'},
	'.food-icon': { path: 'interface/', img: 'res_food_icon'},
	'.res-icon': { path: 'interface/', img: 'res_icon'},
	'.points-icon': { path: 'interface/', img: 'points_icon'},
	'.color-menu': { path: 'interface/', img: 'menus_p', player: true},
	'#trade-button': { path: 'interface/', img: 'trade_button'},
	'.trade-arrow-up': { path: 'interface/', img: 'trade_arrow_button'},
	'.trade-arrow-down': { path: 'interface/', img: 'trade_arrow_button'},
	'.trade-radio-button': { path: 'interface/', img: 'trade_radio_button'},
	'#trade-button-yes': { path: 'interface/', img: 'color_buttons'},
	'#trade-button-no': { path: 'interface/', img: 'color_buttons'},
	'.action-button': { path: 'interface/', img: 'color_buttons'},
	'.action-menu': { path: 'interface/', img: 'action_menu'},
	'.mission-arrow': { path: 'interface/', img: 'mission_arrows'},
	'.actor-pic': { path: 'interface/', img: 'agents_structures', ext: '.jpg'},
	'#info-pic': { path: 'interface/', img: 'agents_structures', ext: '.jpg'},
	'#info-points': { path: 'interface/', img: 'points'},
	'#info-defense': { path: 'interface/', img: 'defense'},
	'.fourtoone-button': { path: 'interface/', img: '4to1_button'},
	'.respkg-collect-div': { path: 'interface/', img: 'collect_menu'},
	'.respkg-upkeep-div': { path: 'interface/', img: 'upkeep_menu'},
	'.respkg-arrow-div': { path: 'interface/', img: 'resources_arrow', ext: '.gif'},
	'.struct-button': { path: 'interface/', img: 'struct_buttons_p', player: true},
	'.confirm-button': { path: 'interface/', img: 'confirm_buttons'},
	'.cancel-button': { path: 'interface/', img: 'confirm_buttons'},
	'.agent-button': { path: 'interface/', img: 'agent_buttons'},
	'.settings-button': { path: 'interface/', img: 'settings_buttons'},
	'.pending-action-stat-div': {path: 'interface/', img: 'pending_action'},
	'#game-end-menu': { path: 'interface/', img: 'end_game_menu'}
};

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
	createActionMenu();
	setInterfaceImages();
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
		
		if ( pendingAction.actionttype != undefined 
			      && pendingAction.actiontype != ACT_PLACE ){
			displayCancelAction();
		}
		else {
			displayEndTurn();
		}
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

	if (clientGame.game.isEnded){
		showEndGameMenu();
	}
};

var clickStructureButton = function( objecttype ){
	playSound('click1', 0.1);
	if ( clientGame.game.phase == PHS_BUILD ) {
		setPendingAction( ACT_BUILD );
		setPendingObject(objecttype);
		updateTurnHelpMessage();
		updateBoardInteractivity();
	}
};

var clickAgentButton = function( agenttype ){
	playSound('click1', 0.1);
	if ( clientGame.game.phase == PHS_BUILD ) {
		setPendingAction( ACT_RECRUIT );
		setPendingAgent(agenttype);
		updateTurnHelpMessage();
		updateBoardInteractivity();
	}
};

var hideYourTurnMenu = function() {
	$('#done-button').removeClass().addClass('inactive-button');
	$('#done-button').off();
	$('#done-button').attr('value', 'Waiting');
	$("#your-turn-div").transition({ opacity: 0.00, top: "28%"}, 500, function(){
		$('#your-turn-div').hide();
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
		$('#confirm-action-div').show();
		$("#confirm-action-div").transition({ opacity: 1.00, top: "40%"}, 500 );
	}
};

var hideConfirmMenu = function() {
	$("#confirm-action-div").transition({ opacity: 0.00, top: "38%"}, 500, 
		function(){
			$('#confirm-action-div').hide();
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
					if (resourcekind == undefined){
						message = "Reserve no resource on " + planetname + "?";
					}
					else {
						message = "Reserve a " + RES_ENGLISH[resourcekind]
								+ " resource on " + planetname + "?";
					}
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

	$('#your-action-message-div').html(message);
};

var displayIncludeSmugglerMenu = function(){
	$('#include-smuggler-div').show();
	$("#include-smuggler-div").transition({ opacity: 1.00, top: "40%"}, 500 );	
};

var hideIncludeSmugglerMenu = function() {
	$("#include-smuggler-div").transition({ opacity: 0.00, top: "38%"}, 500, 
		function(){
			$('#include-smuggler-div').hide();
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
			string += list[i] + " ";
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
	playSound("click1", 0.1);
	hideConfirmMenu();
	submitAction();
};

var cancelPendingAction = function() {
	playSound("click1", 0.1);
	if(clientGame.game.round != 0 && clientGame.game.phase != PHS_MISSIONS) {
		clearPendingAction();
		updateBoardInteractivity();
		displayEndTurn();
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
	var name = getUsername(player);
	var planetname = "";
	if (actionMsg.planetid != undefined){
		planetname = clientGame.game.board.planets[actionMsg.planetid].name;
	}

	messagesHtml = '<tr><td class="msg-action-td msg-action-p' + player + '" colspan="2" >';

	var message = name + ACT_ENGLISH_PAST[actionMsg.actiontype];
	switch ( actionMsg.actiontype ) {
		case ACT_PLACE:
		case ACT_BUILD:
			message += OBJ_ENGLISH[actionMsg.objecttype];
			message += ' on ' + planetname;
			break;
		case ACT_RECRUIT:
			message += AGT_ENGLISH[actionMsg.agenttype];
			message += ' on ' + planetname;
			break;
		case ACT_RETIRE:
			message += AGT_ENGLISH[actionMsg.agenttype];
			break;
		case ACT_REMOVE:
		case ACT_REMOVE_FLEET:
			message += OBJ_ENGLISH[actionMsg.objecttype];
			message += ' at ' + planetname;
			break;
		case ACT_MOVE_AGENT:
			message += AGT_ENGLISH[actionMsg.agenttype] 
					+ ' to ' + planetname;
			break;
		case ACT_FLEET_ATTACK:
		case ACT_BASE_ATTACK:
			var targetPlayer = getUsername(actionMsg.targetPlayer);
			var structure = OBJ_ENGLISH[actionMsg.objecttype];
			message += targetPlayer + "'s " + structure + " on " + planetname + ".";
			if (actionMsg.success){
				message += " Target destroyed.";
			}
			else {
				message += " Attempt failed.";
			}
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
var displayEndTurn = function() {
	$('#your-turn-div').show();
	$('#done-button').attr('value', 'End Turn');
	$('#done-button').off().click(function(){
		playSound('musicbox2', 0.1);
		if ( clientGame.game.phase != PHS_PLACING ) {
			submitTurnDone();
		}
	});
	$('#done-button').removeClass().addClass('end-turn-button');
	$("#your-turn-div").transition({ opacity: 1.00, top: "30%"}, 500, function() {
		$("#your-turn-div").delay(3000).transition({ opacity: 0.00, top: "28%"}, 500, function(){
			$('#your-turn-div').hide();
		});
	});
};

var displayCancelAction = function() {
	$('#done-button').attr('value', 'Cancel');
	$('#done-button').removeClass().addClass('cancel-action-button');
	$('#done-button').off().click( function(){
		cancelPendingAction();
	});
};

var createTurnHelpMessage = function() {
	$('#pending-action-div').show();
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
			message = "Click collect to receive your resources for this round";
			break;
		default:
			break;
	}

	if ( message == ""){
		$('#pending-action-div').hide();
	}
	else {
		$('#pending-action-div').html(message);
		$('#pending-action-div').css({opacity: 0.0});
		$('#pending-action-div').show();
		$('#pending-action-div').transition({opacity: 1.0}, 500, function(){
			setTimeout(function(){
	        	$('#pending-action-div').transition({opacity: 0.0}, 500, function(){
	        		$('#pending-action-div').hide();
	        	});
	    	}, 2500);
		});
	}
};

showPhaseExplain = function(evt){
	var left = String(evt.pageX - 150) + "px";
	var top = String(evt.pageY + 5) + "px";
	$('#phase-explain-div').css({"left": left, "top": top});
	$('#phase-explain-div').html(PHS_EXPLAIN[clientGame.game.phase]);
	$('#phase-explain-div').show();
};

hidePhaseExplain = function(evt){
	$('#phase-explain-div').hide();
};

var updatePointsRemainingMenu = function() {
	var points_remaining = clientGame.game.points_remaining;
	$('#points-remaining-explore').html(points_remaining[PNT_EXPLORE]);
	$('#points-remaining-envoy').html(points_remaining[PNT_ENVOY]);
	$('#points-remaining-destroy').html(points_remaining[PNT_DESTROY]);
};

/**
 * Initializes player-div and its inner divs, player-turn-div and player-stats-div
 * Creates basic structure first and then calls reusable updatePlayersTurnMenus and 
 * updatePlayersStatsMenus functions to fill contents 
 */
var createPlayerStatsMenus = function() {

	var innerHTML = "";

	for ( var i = 0; i < clientGame.game.players.length; i++ ) {

		innerHTML += '<div id="player-div' + i + '" class="player-div" style="bottom: 100px">';

		var username = getUsername(i);
		var resources = clientGame.game.resources[i];
		var points = clientGame.game.points[i];

		innerHTML += '<div class="player-id-div">' + username + '</div>';
		innerHTML += '<div class="player-stat-flags-div">';
		innerHTML += '<div class="player-trade-request-div" '
				   + 'style="display: none" '
				   + 'onclick="javascript:drawTradeMenu(' + i + ')">'
				   + 'Requests Trade</div>';
		innerHTML += '<div class="pending-action-stat-div" onmouseover=""></div>'
		innerHTML += '</div>';
		innerHTML += '<div class="player-points-div"></div>';
		innerHTML += '<div class="player-start-icon" style="display: none"></div>';
		innerHTML += '<div class="player-stats-div">';
		
		innerHTML += '<table class="player-stats-table"><tr>';
		innerHTML += '<td class="res-icon metal-icon"></td>';
		innerHTML += '<td class="res-icon water-icon"></td>';
		innerHTML += '<td class="res-icon fuel-icon"></td>';
		innerHTML += '<td class="res-icon food-icon"></td>';

		innerHTML += '</tr></table>';
		innerHTML += '</div>';
		innerHTML += '</div>';
	}

	$('#players-wrapper-div').html(innerHTML);
};

var createActionMenu = function() {
	$('#action-div').addClass('action-div-p' + clientTurn);
};

var updatePlayerStatsMenus = function() {

	var numPlayers = clientGame.game.players.length;
	var inc = (100.0 / numPlayers) / 2.0;
	
	var spacing = 5;
	var playerDivWid = 250 + spacing;

	var wrapperWid = ( numPlayers * playerDivWid ) - spacing;
	var wrapperMargin = -1 * (wrapperWid / 2);

	$('#players-wrapper-div').css({ width: wrapperWid, 
									'margin-left': wrapperMargin });

	for ( var i = 0; i < clientGame.game.players.length; i++ ) {
		var left = playerDivWid * i + "px";

		$('#player-div' + i).css({left: left });

		var playerDiv = '#player-div' + i;
		var resources = clientGame.game.resources[i];
		var points = clientGame.game.points[i];

		$(playerDiv).find('.metal-icon').html(resources[RES_METAL]);
		$(playerDiv).find('.water-icon').html(resources[RES_WATER]);
		$(playerDiv).find('.fuel-icon').html(resources[RES_FUEL]);
		$(playerDiv).find('.food-icon').html(resources[RES_FOOD]);
		$(playerDiv).find('.player-points-div').html(points[PNT_TOTAL]);

		if ( i != clientTurn 
			 && clientGame.game.trades[i] != undefined
			 && clientGame.game.trades[i].offered_to.indexOf(clientTurn) != -1
			 && clientGame.game.trades[i].declined.indexOf(clientTurn) == -1 ) {
			$(playerDiv).find('.player-trade-request-div').show();
			$(playerDiv).find('.player-stat-flags-div').addClass('trade-flag-on');
		}
		else {
			$(playerDiv).find('.player-trade-request-div').hide();
			$(playerDiv).find('.player-stat-flags-div').removeClass('trade-flag-on');
		}

		if ( i == clientGame.game.playerOffset ){
			$(playerDiv).find('.player-start-icon').show();
		}
		else {
			$(playerDiv).find('.player-start-icon').hide();
		}

		var pendingFlag = $(playerDiv).find('.player-stat-flags-div').find('.pending-action-stat-div');
		pendingFlag.off().mouseenter( function(event){
			showPhaseExplain(event);
		});
		pendingFlag.mouseleave( function(event){
			hidePhaseExplain(event);
		});
		switch(clientGame.game.phase) {
			case PHS_PLACING:
				if (clientGame.game.playerTurn == i){
					pendingFlag.show();
					pendingFlag.html('Placing starting mine...');
				}
				else {
					pendingFlag.hide();
				}
				break;
			case PHS_MISSIONS:
				pendingFlag.hide();
				break;
			case PHS_RESOURCE:
				if ( !clientGame.game.phaseDone[i] ){
					pendingFlag.show();
					pendingFlag.html('Collecting Resources...');
				}
				else {
					pendingFlag.hide();
				}
				break;
			case PHS_UPKEEP:
				if ( !clientGame.game.phaseDone[i] ){
					pendingFlag.show();
					pendingFlag.html('Paying Upkeep...');
				}
				else {
					pendingFlag.hide();
				}
				break;
			case PHS_BUILD:
				if (clientGame.game.playerTurn == i){
					pendingFlag.show();
					pendingFlag.html('Building & Recruiting...');
				}
				else {
					pendingFlag.hide();
				}
				break;
			case PHS_ACTIONS:
				if (clientGame.game.playerTurn == i){
					pendingFlag.show();
					pendingFlag.html('Launching Actions...');
				}
				else {
					pendingFlag.hide();
				}
				break;
			default:
				break;
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

var showIllegalMenu = function( response ){
	$('#illegal-menu-div').html(response);
	$('#illegal-menu-div').css({opacity: 0});
	$('#illegal-menu-div').show();
	$('#illegal-menu-div').transition({opacity: 1}, 500, function(){
		setTimeout(function(){
        	hideIllegalMenu();
    	},2500);
	});
};

var hideIllegalMenu = function() {
	$('#illegal-menu-div').transition({opacity: 0}, 500, function(){
		$('#illegal-menu-div').hide();
	});
};

var showInfoMenu = function(evt, type, id){
	var left = String(evt.pageX - 400) + "px";
	var top = String(evt.pageY - 190) + "px";
	$('#info-div').css({"bottom": "150px", "left": left, "top": top});
	$('#upkeep-title').html("Upkeep");

	var tds = ["metal-icon", "water-icon", "fuel-icon", "food-icon"];
	var buildHTML = '<table><tr>';
	var upkeepHTML = '<table><tr>';

	playSound("plink", 0.05);
	
	if ( type == "structure"){
		var backgroundPos = "0 " + String(-132 * (id - 1)) + "px";
		$('#info-pic').removeClass().addClass('info-struct-'+ String(id));
		$('#info-pic').css({"background-position": backgroundPos});
		$('#build-title').html("Build");
		$('#info-title').html(OBJ_ENGLISH[id]);
		$('#info-text').html(INFO_TEXT.structure[id].info);
		$('#info-text').css({'line-height': "150%"});
		$('#info-points').html(STRUCT_REQS[id].points);
		$('#info-points').show();
		$('#info-require-text').hide();
		if ( id == OBJ_MINE ){
			$('#info-defense').html("∞");
			$('#info-defense').css({'font-size': "22px", 'padding-top': '0px'});
		}
		else {
			$('#info-defense').html(String(STRUCT_REQS[id].defense) + "|6");
			$('#info-defense').css({'font-size': "15px", 'padding-top': '4px'});
		}
		$('#info-defense').show();
		var count = 0;
		for ( var i = RES_METAL; i <= RES_FOOD; i++ ){
			for ( var r = 0; r < STRUCT_REQS[id].build[i]; r++ ){
				$('#build-info-res-' + count).removeClass("metal-icon water-icon fuel-icon food-icon no-icon").addClass(tds[i]);
				count += 1;
			}
			if ( STRUCT_REQS[id].upkeep[i] > 0 ){
				$('#upkeep-info-res-' + 0).removeClass("metal-icon water-icon fuel-icon food-icon no-icon").addClass(tds[i]);
			}
		}
		for ( var i = count; i < 6; i++){
			$('#build-info-res-' + i).removeClass("metal-icon water-icon fuel-icon food-icon").addClass('no-icon');
		}
		if ( id == OBJ_MINE ){
			$('#upkeep-info-res-' + 0).removeClass("metal-icon water-icon fuel-icon food-icon").addClass('no-icon');
		}
	} else if (type == "agent"){
		var backgroundPos = "0 " + String(-132 * (id + 4)) + "px";
		$('#info-pic').removeClass().addClass('info-agent-'+ String(id));
		$('#info-pic').css({"background-position": backgroundPos});
		$('#build-title').html("Requires");
		$('#info-title').html(AGT_ENGLISH[id]);
		$('#info-text').html(INFO_TEXT.agent[id].info);
		$('#info-text').css({'line-height': "130%"});
		$('#info-points').hide();
		$('#info-defense').hide();
		$('#info-require-text').show();
		$('#info-require-text').html(AGT_REQS[id].STRUCT);
		for ( var i = 0; i < 6; i++ ){
			$('#build-info-res-' + i).removeClass("metal-icon water-icon fuel-icon food-icon").addClass('no-icon');
		}
		$('#upkeep-info-res-' + 0).removeClass("metal-icon water-icon fuel-icon no-icon").addClass('food-icon');
	}
	$('#info-div').show();
};

var hideInfoMenu = function() {
	$('#info-div').hide();
};

var createStructuresMenu = function() {
	var innerHTML = '';
	innerHTML += '<div id="structures-menu-title" class="menu-title">Structures</div>';
	innerHTML += '<div id="struct-mines-div"><table class="struct-table"><tr>';
	for ( var i = 0; i < STRUCT_REQS[OBJ_MINE].max; i++ ){
		innerHTML += '<td><input type="button" '
					+ 'id="button-' + OBJ_MINE + '-' + i + '"'
					+ 'class="struct-button struct-mine-button"'
				    + 'onclick="javascript:clickStructureButton(OBJ_MINE);">'
				    + '</input></td>';
	}
	innerHTML += '</tr></table></div>';
	innerHTML += '<div id="struct-fleets-div"><table class="struct-table"><tr>';
	for ( var i = 0; i < STRUCT_REQS[OBJ_FLEET].max; i++ ){
		innerHTML += '<td><input type="button" '
					+ 'id="button-' + OBJ_FLEET + '-' + i + '"'
					+ 'class="struct-button struct-fleet-button"'
				    + 'onclick="javascript:clickStructureButton(OBJ_FLEET);">'
				    + '</input></td>';
	}
	innerHTML += '</tr></table></div>';
	innerHTML += '<div id="struct-factories-div"><table class="struct-table"><tr>';
	for ( var i = 0; i < STRUCT_REQS[OBJ_FACTORY].max; i++ ){
		innerHTML += '<td><input type="button" '
					+ 'id="button-' + OBJ_FACTORY + '-' + i + '"'
					+ 'class="struct-button struct-factory-button"'
				    + 'onclick="javascript:clickStructureButton(OBJ_FACTORY);">'
				    + '</input></td>';
	}
	innerHTML += '</tr></table></div>';
	innerHTML += '<div id="struct-embassies-div"><table class="struct-table"><tr>';
	for ( var i = 0; i < STRUCT_REQS[OBJ_EMBASSY].max; i++ ){
		innerHTML += '<td><input type="button" '
					+ 'id="button-' + OBJ_EMBASSY + '-' + i + '"'
					+ 'class="struct-button struct-embassy-button"'
				    + 'onclick="javascript:clickStructureButton(OBJ_EMBASSY);">'
				    + '</input></td>';
	}
	innerHTML += '</tr></table></div>';
	innerHTML += '<div id="struct-base-div"><input type="button" '
				+ 'id="button-' + OBJ_BASE + '"'
				+ 'class="struct-button struct-base-button"'
			    + 'onclick="javascript:clickStructureButton(OBJ_BASE);">'
			    + '</input></div>';

	$('#structures-menu-div').html(innerHTML);

	// do this with a for loop
	$('.struct-mine-button').mouseenter(function(event){
		showInfoMenu(event, "structure", OBJ_MINE);
	});

	$('.struct-factory-button').mouseenter(function(event){
		showInfoMenu(event, "structure", OBJ_FACTORY);
	});

	$('.struct-embassy-button').mouseenter(function(event){
		showInfoMenu(event, "structure", OBJ_EMBASSY);
	});

	$('.struct-base-button').mouseenter(function(event){
		showInfoMenu(event, "structure", OBJ_BASE);
	});

	$('.struct-fleet-button').mouseenter(function(event){
		showInfoMenu(event, "structure", OBJ_FLEET);
	});

	$('.struct-button').mouseleave(function(event){
		hideInfoMenu(event);
	});
};

var updateStructuresMenu = function() {

	var structures = clientGame.game.structures[clientTurn];
	if ( structures != undefined ){
		for ( var i = 0; i < STRUCT_REQS[OBJ_MINE].max; i++ ){
			if ( i < structures[OBJ_MINE] ){
				$('#button-' + OBJ_MINE + '-' + i).removeClass('mine-button-used');
			}
			else {
				$('#button-' + OBJ_MINE + '-' + i).addClass('mine-button-used');
			}
		}

		for ( var i = 0; i < STRUCT_REQS[OBJ_FLEET].max; i++ ){
			if ( i < structures[OBJ_FLEET] ){
				$('#button-' + OBJ_FLEET + '-' + i).removeClass('fleet-button-used');
			}
			else {
				$('#button-' + OBJ_FLEET + '-' + i).addClass('fleet-button-used');
			}
		}

		for ( var i = 0; i < STRUCT_REQS[OBJ_FACTORY].max; i++ ){
			if (i < structures[OBJ_FACTORY] ) {
				$('#button-' + OBJ_FACTORY + '-' + i).removeClass('factory-button-used');
			}
			else {
				$('#button-' + OBJ_FACTORY + '-' + i).addClass('factory-button-used');
			}
		}

		for ( var i = 0; i < STRUCT_REQS[OBJ_EMBASSY].max; i++ ){
			if (i < structures[OBJ_EMBASSY] ){
				$('#button-' + OBJ_EMBASSY + '-' + i).removeClass('embassy-button-used');
			}
			else {
				$('#button-' + OBJ_EMBASSY + '-' + i).addClass('embassy-button-used');
			}
		}

		if ( structures[OBJ_BASE] > 0 ){
			$('#button-' + OBJ_BASE).removeClass('base-button-used');
		}
		else {
			$('#button-' + OBJ_BASE).addClass('base-button-used');
		}
	}
};

var createAgentsMenu = function() {
	var innerHTML = '<div id="agents-menu-title" class="menu-title">Agents</div>';
	innerHTML += '<table id="agents-table"><tr>';
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
	innerHTML += '</tr></table>';

	$('#agents-menu-div').html(innerHTML);

	// you can set all these with a for loop
	$('#agent-button-explorer').mouseenter(function(event){
		showInfoMenu(event, "agent", AGT_EXPLORER);
	});

	$('#agent-button-miner').mouseenter(function(event){
		showInfoMenu(event, "agent", AGT_MINER);
	});

	$('#agent-button-surveyor').mouseenter(function(event){
		showInfoMenu(event, "agent", AGT_SURVEYOR);
	});

	$('#agent-button-smuggler').mouseenter(function(event){
		showInfoMenu(event, "agent", AGT_SMUGGLER);
	});

	$('#agent-button-ambassador').mouseenter(function(event){
		showInfoMenu(event, "agent", AGT_AMBASSADOR);
	});

	$('#agent-button-envoy').mouseenter(function(event){
		showInfoMenu(event, "agent", AGT_ENVOY);
	});

	$('#agent-button-spy').mouseenter(function(event){
		showInfoMenu(event, "agent", AGT_SPY);
	});

	$('#agent-button-sabateur').mouseenter(function(event){
		showInfoMenu(event, "agent", AGT_SABATEUR);
	});

	$('.agent-button').mouseleave(function(event){
		hideInfoMenu(event);
	});
};

var updateAgentsMenu = function() {
	if ( clientGame.game != undefined 
		 && clientGame.game.board != undefined
		 && clientGame.game.board.agents != undefined ){

		for ( var agt = AGT_EXPLORER; agt <= AGT_SABATEUR; agt++){
			var agentid = String(clientTurn) + String(agt);
			var agent = clientGame.game.board.agents[agentid];
			var status = agent.status;
			if ( status == AGT_STATUS_ON || status == AGT_STATUS_DEAD ){
				$('#agent-button-' + AGT_IMG[agt]).addClass('agent-off');
				if ( status == AGT_STATUS_DEAD ) {
					$('#agent-button-' + AGT_IMG[agt]).attr('value', 'retired');
				}
				else if ( status == AGT_STATUS_ON ){
					$('#agent-button-' + AGT_IMG[agt]).attr('value', 'active');
				}
			}
			else if ( isAgentAvailableToRecruit(agt) == false ) {
				$('#agent-button-' + AGT_IMG[agt]).addClass('agent-off');
			}
			else {
				$('#agent-button-' + AGT_IMG[agt]).removeClass('agent-off');
			}
		}
	}
};

var isAgentAvailableToRecruit = function( agt ){
	var objecttype = AGT_REQS[agt].objecttype;
	if (clientGame.game.structures[clientTurn][objecttype] < STRUCT_REQS[objecttype].max) {
		return true
	}
	return false
};

var showEndGameMenu = function() {
	$('#game-end-div').css({opacity: '0.0'});
	$('#game-end-menu').css({opacity: '0.0'});
	var winner = clientGame.game.winner
	$('#winner-div').css({opacity: '0.0', color: color[winner]});
	$('#winner-div').html(getUsername(winner) + " Wins!");
	$('#game-end-div').show();
	$('#game-end-div').transition({opacity: 0.0}, 500, function(){
		$('#game-end-div').transition({opacity: 1.0}, 500, function(){
			$('#game-end-menu').transition({opacity: 1.0}, 500, function(){
				$('#winner-div').transition({opacity: 1.0}, 500);
			});
		});
	});
	plotEndGame(PLOT_POINTS);
};

var leaveGameToLobby = function() {
	submitGameToLobby();
	transGameToLobby();
};

var plotEndGame = function(type){
	var stats = clientGame.game.stats;
	var data = [];
	var options = {
    	series: {
        	lines: { show: true, lineWidth: 4 },
	    },
	    xaxis: { tickSize: 1, tickDecimals: 0 },
	    yaxis: { tickSize: 1, tickDecimals: 0 },
	    legend: { show: false }
	};
	if (type == PLOT_POINTS){
		var points = stats.points;
		for ( var p = 0; p < clientGame.game.players.length; p++ ){
			data.push({ color: color[p], data: points[p] });
		}
	}
	$.plot($("#end-game-graph"), data, options);
};

var createRoundMenu = function() {
	for (var i = PHS_MISSIONS; i <= PHS_ACTIONS; i++){
		$('#phase-td' + i).html(PHS_ENGLISH[i]);
	};
};

var updateRoundMenu = function() {

	if (clientGame.game.phase == PHS_PLACING){
		$('#round-td').html(PHS_ENGLISH[PHS_PLACING]);
		$('#round-td').addClass('phase-td-current');
	}
	else {
		$('#round-td').html('Round ' + clientGame.game.round);
		$('#round-td').removeClass('phase-td-current');
	}

	for (var i = PHS_MISSIONS; i <= PHS_ACTIONS; i++){
		if ( i == clientGame.game.phase) {
			$('#phase-td' + i).addClass('phase-td-current');
		} 
		else {
			$('#phase-td' + i).removeClass('phase-td-current');
		}
	};
};

var updatePhaseMenus = function() {

	var prevShowing = $('#missions-phase-div').is(":visible");

	$('#missions-phase-div').hide();
	$('#resource-phase-div').hide();
	$('#upkeep-phase-div').hide();

	switch(clientGame.game.phase) {
		case PHS_MISSIONS:
			updateMissionsMenu(undefined, undefined);
			if ( !prevShowing ){
				playSound("flutter2", 0.2);
			}
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
	if ( prevShowing && $('#missions-phase-div').is(":visible") == false){
		playSound("flutter1", 0.2);
	}
};

/**
 * Displays mission resolving information to each client based on which round
 * and mission index we're on. 
 */
var updateMissionsMenu = function(round, index) {
	
	var missionRound = clientGame.game.round - 2;
	var missionindex = clientGame.game.missionindex;
	var missions = clientGame.game.missions;

	if (round != undefined && index != undefined){
		missionRound = round - 2;
		missionindex = index;
	}

	var nowRound = missionRound + 2;
	var nowIndex = missionindex;
	var prevRound, prevIndex, nextRound, nextIndex;

	if ( missionindex - 1 >= 0 ){
		prevRound = nowRound;
		prevIndex = nowIndex - 1;
	}
	else {
		if ( nowRound - 3 >= 1 ){
			prevRound = nowRound - 1;
			var num_missions = missions[prevRound - 2].length;
			if ( num_missions > 0 ){
				prevIndex = num_missions - 1;
			}
			else {
				prevIndex = 0;
			}
		}
		else {
			prevRound = nowRound;
			prevIndex = nowIndex;
		}
	}

	if ( nowIndex >= clientGame.game.missionindex && nowRound >= clientGame.game.round ){
		nextIndex = clientGame.game.missionindex;
		nextRound = clientGame.game.round;
	}
	else if ( nowIndex + 1 < missions[nowRound - 2].length ){
		nextIndex = nowIndex + 1;
		nextRound = nowRound;
	}
	else {
		nextIndex = 0;
		nextRound = nowRound + 1;
	}

	$('#mission-prev-button').off().click( function() {
		updateMissionsMenu( prevRound, prevIndex );
	});
	$('#mission-next-button').off().click( function() {
		updateMissionsMenu( nextRound, nextIndex );
	});
	
	$('#mission-button-1').hide();
	$('#mission-button-2').hide();
	$('#mission-button-3').hide();

	$('#mission-name').html('Round ' + String(missionRound + 2));

	// if no missions to resolve this round
	if ( missionRound <= 0 || missions[missionRound].length == 0) {
		$('#mission-agent-div').removeClass().addClass('actor-pic actor-struct-1');
		$('#mission-location').html('- - -');
		$('#mission-label').html('Mission');
		$('#mission-text').html('No missions to resolve this round');
		if ( nowRound == clientGame.game.round && nowIndex == clientGame.game.missionindex ){
			$('#mission-button-3').show();
			$('#mission-button-3').attr('value', 'Okay');
			$('#mission-button-3').off().click( function() {
				playSound("click1", 0.1);
				submitMissionsViewed();
			});
		}
	}
	else {
		var mission = missions[ missionRound ][ missionindex ];
		var player = mission.player;
		var agenttype = mission.agenttype;
		var userid = clientGame.game.players[player];
		var name = player == clientTurn ? 'You' : all_users[userid].name;
		var planetname = clientGame.game.board.planets[ mission.planetTo ].name;
		var message = "";
		var picClass = 'actor-agent-' + agenttype;
		$('#mission-agent-div').removeClass().addClass('actor-pic ' + picClass);
		$('#mission-location').html(AGT_ENGLISH[agenttype] + ' to ' + planetname);
		$('#mission-label').html('Mission (' + String( missionindex + 1 ) 
										    + ' of ' + missions[missionRound].length + ')');
		$('#mission-div').removeClass().addClass('action-menu mission-div-p' + player);
		$('#mission-name').attr('value', AGT_ENGLISH[agenttype]);
		$('#mission-button-3').hide(); // Hide the view all missions button by default

		// if mission has been resolved
		if ( mission.resolution.resolved == true ) {
			// display mission resolution message (eg. no-fly zones placed on __)
			$('#missions-phase-div').show();

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
									" has no embassy on this planet";
						break;
					case AGT_SABATEUR:
						message = "Mission resolved,"
									+ " opponents have no targetable structures here";
						break;
					default:
						message = "Mission resolved";
						break;
				}
			}
			else {
				message = name + mission.result;
			}

			$('#mission-text').html(message);

			if ( nowIndex == clientGame.game.missionindex && nowRound == clientGame.game.round ) {
				if ( clientGame.game.missionViewed[clientTurn] == false ) {
					$('#mission-button-3').show();
					$('#mission-button-3').attr('value', 'Okay');
					$('#mission-button-3').off().click( function() {
						playSound("click1", 0.1);
						viewMissionAction();
					});
				}
			}
		} 

		// otherwise, if not all spies have resolved
		else if ( clientGame.game.missionSpied.indexOf(null) != -1 ) {
			// if player hasn't responded with a spy action yet
			if ( clientGame.game.missionSpied[ clientTurn ] == null ) {
				// automatically allow if this is client's own mission
				if ( clientTurn == player ){
					blockMissionAction( false );
				} 
				// automatically allow if client has no spies here
				else if ( clientGame.game.board.planets[mission.planetTo].spyeyes[clientTurn] <= 0 ) {
					blockMissionAction( false );
				}
				else {
					$('#missions-phase-div').show();
					$('#mission-text').html("Mission pending. Would you like to block this mission?");
					$('#mission-button-1').attr('value', 'Block');
					$('#mission-button-1').show();
					$('#mission-button-1').off().click( function() {
						playSound("click1", 0.1);
						blockMissionAction(true);
					});
					if ( agenttype == AGT_MINER || agenttype == AGT_ENVOY ) {
						$('#mission-text').html("Mission Pending. Use a spy eye to block or collect resources from this mission?");
						$('#mission-button-2').attr('value', 'Collect');
						$('#mission-button-2').show();
						$('#mission-button-2').off().click( function() {
							playSound("click1", 0.1);
							blockMissionAction(null);
						});
					}
					$('#mission-button-3').attr('value', 'Allow');
					$('#mission-button-3').show();
					$('#mission-button-3').off().click( function() {
						playSound("click1", 0.1);
						blockMissionAction( false );
					});
				}
			}
			else {
				$('#mission-text').html("Mission pending, waiting on spy actions...");
			}
		}

		// if all clients have responded with spy actions
		else if ( mission.waitingOnResolve ) {
			// and if this is actually this client's mission
			if ( clientTurn != player ) {
				$('#mission-text').html("Mission pending");
			}
			else {
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
							messageHtml = 'Your explorer has discovered a planet! Select a resource here to reserve it.';
							break;
						case AGT_MINER:
							messageHtml = 'Your miner has arrived! Select a resource you occupy here to collect 6.';
							break;
						case AGT_SURVEYOR:
							if ( pendingAction.choice == undefined 
								 || pendingAction.choice.constructor !== Array) {
								setPendingChoice([]);
							}
							messageHtml = 'Select up to 2 resources to increase. click Done when finished.';
							break;
						case AGT_AMBASSADOR:
							if ( pendingAction.choice == undefined 
								 || pendingAction.choice.constructor !== Array) {
								setPendingChoice([]);
								updateNoFlyZones();
								stage.update();
							}
							messageHtml = 'Select up to 2 borders to block, click Done when finished';
							break;
						case AGT_SABATEUR:
							messageHtml = 'Choose an opponent structure to destroy';
							break;
						default:
							break;
					}
					$('#mission-text').html(messageHtml);
					$('#mission-button-3').show();
					$('#mission-button-3').attr('value', 'Done');
					$('#mission-button-3').off().click( function() {
						displayConfirmMenu();
					});
				}
			}
		}
	}
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
	playSound("flutter2", 0.05);
	$('#action-div').show();
};

var hideActionMenu = function() {
	playSound("flutter1", 0.05);
	$('#action-div').hide();
	$('#action-button-1').hide();
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
	var picClass = 'actor-';
	var locationText = 'Location: ';
	if ( actortype == 'agent' ){
		picClass += 'agent-' + pendingAction.agenttype;
		$('#actor-div').removeClass().addClass('actor-pic ' + picClass);
		$('#action-name').html(AGT_ENGLISH[id]);

		var agentid = String(clientTurn) + String(id);
		var planetid = clientGame.game.board.agents[agentid].planetid;
		var agent = clientGame.game.board.agents[agentid];
		locationText += clientGame.game.board.planets[planetid].name;
		$('#action-location').html(locationText);
		$('#action-label').html('Mission');

		if ( agent.used == true ){
			if (agent.destination != undefined){
				var planetname = clientGame.game.board.planets[agent.destination].name;
				$('#action-text').html(AGT_ENGLISH[id] + ' is on mission to ' + planetname);
			}
			else {
				$('#action-text').html(AGT_ENGLISH[id] + ' already moved this turn');
			}
			$('#action-button-1').hide();
			$('#action-button-2').hide();
			$('#action-button-3').attr('value', 'Close');
		}
		else {
			$('#action-text').html(INFO_TEXT.agent[id].action);
			$('#action-button-1').attr('value', 'Move');
			$('#action-button-1').show();
			$('#action-button-1').off().click( function() {
												hideActionMenu();
												setPendingAction( ACT_MOVE_AGENT );
												updateBoardInteractivity();
												updateTurnHelpMessage();
											} );
			$('#action-button-2').attr('value', 'Mission');
			$('#action-button-2').show();
			$('#action-button-2').off().click( function() { 
												hideActionMenu();
												setPendingAction( ACT_LAUNCH_MISSION );
												updateBoardInteractivity();
												updateTurnHelpMessage();
											} );
		}

	}
	else if ( actortype == 'fleet'){
		picClass += 'struct-' + OBJ_FLEET;
		$('#actor-div').removeClass().addClass('actor-pic ' + picClass);
		if ( pendingAction.actiontype != ACT_BASE_ATTACK 
			 && pendingAction.actiontype != ACT_FLEET_ATTACK) {
			
			$('#action-name').html(OBJ_ENGLISH[OBJ_FLEET]);

			var planetid = pendingAction.planetid;
			locationText += clientGame.game.board.planets[planetid].name;
			$('#action-location').html(locationText);
			$('#action-label').html('Action');
			$('#action-text').html(INFO_TEXT.structure[OBJ_FLEET].action);

			$('#action-button-1').attr('value', 'Move');
			$('#action-button-1').show();
			$('#action-button-1').off().click( function() { 
												hideActionMenu();
												setPendingAction( ACT_FLEET_MOVE );
												updateBoardInteractivity();
											} );
			$('#action-button-2').attr('value', 'Attack');
			$('#action-button-2').show();
			$('#action-button-2').off().click( function() { 
												hideActionMenu();
												setPendingAction( ACT_FLEET_ATTACK );
												updateBoardInteractivity();
											} );
		}
	}
	else if ( actortype == 'base'){
		picClass += 'struct-' + OBJ_BASE;
		$('#actor-div').removeClass().addClass('actor-pic ' + picClass);
		$('#action-name').html(OBJ_ENGLISH[OBJ_BASE]);

		var planetid = pendingAction.planetid;
		locationText += clientGame.game.board.planets[planetid].name;
		$('#action-location').html(locationText);
		$('#action-label').html('Action');
		$('#action-text').html(INFO_TEXT.structure[OBJ_BASE].action);

		$('#action-button-1').hide();
		$('#action-button-2').prop('value', 'Attack');
		$('#action-button-2').show();
		$('#action-button-2').off().click( function() { 
											hideActionMenu();
											setPendingAction( ACT_BASE_ATTACK );
											updateBoardInteractivity();
		} );
	}
};

var initSettingsButtons = function(){
	$('.settings-button').each(function(){
		$( this ).click( function(){
			playSound('click1', 0.1);
		});
		$( this ).hover( function(){
			playSound('plink', 0.05);
		});
	});
};

var toggleRules = function(){
	if ($('#rules-div').is(":visible") ){
		$('#rules-div').hide();
		playSound("flit", 0.2);
	}
	else {
		$('#rules-div').show();
		playSound("flit", 0.2);
	}
};

var updateSoundButton = function(){
	$('.sound-button').each(function(){
		if (SOUND_ON){
			$( this ).removeClass('sound-button-off').addClass('sound-button-on');
		}
		else {
			$( this ).removeClass('sound-button-on').addClass('sound-button-off');
		}
	});
};

var updateMusicButton = function(){
	$('.music-button').each(function(){
		if (MUSIC_ON){
			$( this ).removeClass('music-button-off').addClass('music-button-on');
		}
		else {
			$( this ).removeClass('music-button-on').addClass('music-button-off');
		}
	});
};

/** 
 * Sets UX images using DOMimageMap, picking images according to the 
 * current device pixel ratio
 * TODO: this is currently being called WAY too often. there should be a better
 * function to target only css that needs to be updated
 */
var setInterfaceImages = function() {

	imgPx = window.devicePixelRatio > 1.0 ? '2x_' : '1x_';

	for (var name in DOMimageMap){
		setInterfaceImage(name);
	}
};

var setInterfaceImage = function(name) {
	var element = DOMimageMap[name];
	var img = element.img;
	var player = element.player ? String(clientTurn) : '';
	var path = s3url + element.path + imgPx + img + player;
	var ext = element.ext == undefined ? '.png' : element.ext;
	$( name ).css("background-image", 'url(' + path + ext + ')');
};