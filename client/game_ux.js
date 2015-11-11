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
	{ elmt: '#staging-leave-button', path: 'staging/', img: 'back_button' },
	{ elmt: '#player-div0', path: 'interface/', img: 'player_menu_p0'},
	{ elmt: '#player-div1', path: 'interface/', img: 'player_menu_p1'},
	{ elmt: '#player-div2', path: 'interface/', img: 'player_menu_p2'},
	{ elmt: '#player-div3', path: 'interface/', img: 'player_menu_p3'},
	{ elmt: '.metal-icon', path: 'interface/', img: 'res_metal_icon'},
	{ elmt: '.water-icon', path: 'interface/', img: 'res_water_icon'},
	{ elmt: '.fuel-icon', path: 'interface/', img: 'res_fuel_icon'},
	{ elmt: '.food-icon', path: 'interface/', img: 'res_food_icon'},
	{ elmt: '.points-icon', path: 'interface/', img: 'points_icon'},
	{ elmt: '#resources-menu-div', path: 'interface/', img: 'resources_menu'},
	{ elmt: '#structures-menu-div', path: 'interface/', img: 'structures_menu'},
	{ elmt: '#agents-menu-div', path: 'interface/', img: 'agents_menu'},
	{ elmt: '#trade-button', path: 'interface/', img: 'trade_button'},
	{ elmt: '.fourtoone-button', path: 'interface/', img: '4to1_button'},
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

	updatePlayerStatsMenus();
	updateBottomBarMenus();
	updateRoundMenu();
	updatePhaseMenus();
	updateTurnHelpMessage();

	if( clientGame.game.turn == clientTurn ) {

		if( clientGame.game.round == 0){
			setPendingObject( OBJ_MINE );
			setPendingAction( ACT_PLACE );
		}

		else {
			clearPendingAction();
		}

		displayYourTurnMenu();
		updateBoard();

	} else {

		clearPendingAction();
		hideYourTurnMenu();
		updateBoard();

	}

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
	submitAction();
};

var cancelPendingAction = function() {
	if(clientGame.game.round != 0) {
		clearPendingAction();
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

    	// combinedMessage = '';
        msg = messages[m];

        // if server message, message spans both columns and is centered
        switch (msg.id) {
	        case MSG_SERVER:
	            messagesHtml += buildServerMessage( msg );
	            break;
	        case MSG_ACTION:
	        	messagesHtml += buildActionMessage( msg.message );
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
		case ACT_COLLECT_RESOURCES:
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
	$("#your-turn-div").transition({ opacity: 1.00, top: "40%"}, 500, function() {
		$("#your-turn-div").delay(3000).transition({ opacity: 0.00, top: "38%"}, 500, function(){
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

			if (clientTurn == clientGame.game.turn){
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

			if (clientTurn == clientGame.game.turn){
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
			
		case PHS_RESOURCE:
		default:
			break;

	}

	$('#pending-action-div')[0].innerHTML = message;
};

/**
 * Initializes player-div and its inner divs, player-turn-div and player-stats-div
 * Creates basic structure first and then calls reusable updatePlayersTurnMenus and 
 * updatePlayersStatsMenus functions to fill contents 
 */
var createPlayerStatsMenus = function() {

	var wrapperWidth = (256 * clientGame.players.length);
	$('#players-wrapper-div')[0].style.width = wrapperWidth + "px";

	var marginleft = Math.round(wrapperWidth / -2) + "px";
	$('#players-wrapper-div')[0].style.marginLeft = marginleft;

	var innerHTML = "";

	for ( var i = 0; i < clientGame.players.length; i++ ) {

		innerHTML += '<div id="player-div' + i + '" class="player-div" style="bottom: 100px">';

		var username = all_users[clientGame.game.players[i]].name;
		var resources = clientGame.game.resources[i];
		var points = clientGame.game.points[i];

		innerHTML += '<div class="player-id-div">' + username + '</div>';

		innerHTML += '<div class="player-stats-div">';
		
		innerHTML += '<table class="player-stats-table"><tr>';
		innerHTML += '<td class="metal-icon"></td>';
		innerHTML += '<td class="water-icon"></td>';
		innerHTML += '<td class="fuel-icon"></td>';
		innerHTML += '<td class="food-icon"></td>';

		innerHTML += '<td class="points-icon"></td>';

		innerHTML += '</tr></table>';
		innerHTML += '</div>';
		innerHTML += '</div>';
	}

	$('#players-wrapper-div')[0].innerHTML = innerHTML;
	$('#players-wrapper-div')[0].style.visibility = "visible";
};

var updatePlayerStatsMenus = function() {

	for ( var i = 0; i < clientGame.players.length; i++ ) {

		var playerDiv = '#player-div' + i;
		var resources = clientGame.game.resources[i];
		var points = clientGame.game.points[i];

		$(playerDiv).find('.metal-icon')[0].innerHTML = resources[RES_METAL];
		$(playerDiv).find('.water-icon')[0].innerHTML = resources[RES_WATER];
		$(playerDiv).find('.fuel-icon')[0].innerHTML = resources[RES_FUEL];
		$(playerDiv).find('.food-icon')[0].innerHTML = resources[RES_FOOD];
		$(playerDiv).find('.points-icon')[0].innerHTML = points[PNT_TOTAL];
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

var createResourcesMenu = function() {
	
	var innerHTML = '';	

	for ( var i = 0; i <= RES_FOOD; i++ ){
		innerHTML += '<div class="resource-div" id="resource-div' + i + '">'
				   + '<div class="gain-div"></div><div class="loss-div"></div>'
        		   + '<table class="resource-table" cellspacing="0"></table>'
        		   + '<input type="button" class="fourtoone-button" value="4 to 1"></input>'
        		   + '</div>';
	}

	innerHTML += '<input type="button" id="trade-button" value="Trade"></input>';

	$('#resources-menu-div')[0].innerHTML = innerHTML;

	updateResourcesMenu();
};

var updateResourcesMenu = function() {

	var icons = ['metal-icon', 'water-icon', 'fuel-icon', 'food-icon'];
	var collect = clientGame.game.resourceCollect[clientTurn];
	var upkeep = clientGame.game.resourceUpkeep[clientTurn];

	for ( var i = 0; i <= RES_FOOD; i++ ){

		var resourceDiv = '#resource-div' + i;
		$(resourceDiv).find('.gain-div')[0].innerHTML = '+' + collect[i];
		$(resourceDiv).find('.loss-div')[0].innerHTML = '-' + upkeep[i];

		var resources = clientGame.game.resources[clientTurn];
		var innerHTML = '<tr>';
		for ( var n = 0; n < 10; n++ ) {
			innerHTML += (n < resources[i] ? 
						  '<td class="' + icons[i] + '"></td>':
						  '<td width="25px" height="25px"></td>');

		}
		innerHTML += '</tr>';

		$(resourceDiv).find('.resource-table').html(innerHTML);
	}
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

	$('#missions-phase-div')[0].style.visibility = "hidden";
	$('#resource-phase-div')[0].style.visibility = "hidden";
	$('#upkeep-phase-div')[0].style.visibility = "hidden";

	switch(clientGame.game.phase) {
		case PHS_MISSIONS:
			$('#missions-phase-div')[0].style.visibility = "visible";
			break;
		case PHS_RESOURCE:
			$('#resource-phase-div')[0].style.visibility = "visible";
			break;
		case PHS_UPKEEP:
			$('#upkeep-phase-div')[0].style.visibility = "visible";
			break;
		default:
			break;
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

		$( name ).css("background-image", 'url(' + path + '.png)');
	}
};