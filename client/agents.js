
/** Agents.js contains all methods for initializing and drawing agents
 * All agents are drawn once and then hidden or shown based on their 
 * current planetid (either a number or undefined). 
 */

var U_ALPHA = 1.0;
var U_HOVER = 0.5;
var ALPHA = 0.1;
var HOVER = 0.0;

var initAgents = function() {

	//create container to store all agent shapes
	var agentsContainer = new createjs.Container();
	agentsContainer.name = 'agentsContainer';
	agentsContainer.mouseEnabled = true;
	agentsContainer.x = 0;
	agentsContainer.y = 0;

	for( var agentid in clientGame.game.board.agents ) {

		var agent = clientGame.game.board.agents[agentid];
		var agenttype = agent.agenttype;
		var player = agent.player;

		var agentContainer = new createjs.Container();

		agentContainer.name = AGT_ENGLISH[ agenttype ] + player;
		agentContainer.agenttype = agenttype;

		var agentshape = new createjs.Shape();
		agentshape.name = "agentshape";

		var yOffset = 108 * (agenttype - 1);

		var agentImg = loader.getResult( "agents" + player );
		agentshape.graphics.beginBitmapFill(agentImg, "no-repeat").drawRect(0, yOffset, 108, 108);
		agentshape.shadow = new createjs.Shadow("rgba(0,0,0,0.5)", 2, 2, 1);
		agentshape.x = 0;
		agentshape.y = -1 * yOffset;

		var darkshape = new createjs.Shape();
		darkshape.name = "darkshape";
		darkshape.graphics.beginBitmapFill(agentImg, "no-repeat").drawRect(108, yOffset, 108, 108);
		darkshape.x = -108;
		darkshape.y = -1 * yOffset;
		darkshape.alpha = ALPHA;

		var agenttext = new createjs.Text(AGT_ENGLISH[ agenttype ], "normal 20px Play", "white");
		agenttext.name = "agenttext";
		agenttext.textAlign = "center";
		agenttext.x = 55;
		agenttext.y = 80;
		agenttext.shadow = new createjs.Shadow("rgba(0,0,0,0.8)", 3, 3, 1);

		agentContainer.visible = false;
		agentContainer.mouseEnabled = false;
		agentContainer.used = false;

		agentContainer.on("mouseover", function() {
			selectAgent( this.name );
			this.getChildByName("darkshape").alpha = this.used ? U_HOVER : HOVER;
		});

		agentContainer.on("mouseout", function() {
			hideSelection();
			this.getChildByName("darkshape").alpha = this.used ? U_ALPHA : ALPHA;
		});

		agentContainer.on("click", function() {
			handleClickAgent( this.agenttype )
		});

		agentContainer.addChild( agentshape );
		agentContainer.addChild( darkshape );
		agentContainer.addChild( agenttext );
		agentsContainer.addChild(agentContainer);

		agentContainer.scaleX = 0.81;
		agentContainer.scaleY = 0.81;
	}

	board.addChild(agentsContainer);
};

var updateAgents = function(planetid) {

	var agentsContainer = board.getChildByName('agentsContainer');
	var planet = clientGame.game.board.planets[planetid];
	var agents = clientGame.game.board.agents;
	var num_agents = planet.agents.length;

	var space = agtSpace;
	var agtWidAll = (agtWid * num_agents) + (space * (num_agents - 1));

	if (agtWidAll > planet.w * sWid) {
		space = ((planet.w * sWid) - (num_agents * agtWid)) / (num_agents - 1);
		agtWidAll = (agtWid * num_agents) + (space * (num_agents - 1));
	}

	var agentsX = ((planet.w * sWid) / 2.0) - ( agtWidAll / 2.0);
	var agentsY = planet.w == 1 ? 25 : 155 ;

	for (var i = 0; i < num_agents; i++) {

		var id = planet.agents[i];
		var agent = agents[id];
		var player = agent.player;
		var agenttype = agent.agenttype;
		var agentname = AGT_ENGLISH[agenttype] + player;

		var agentContainer = agentsContainer.getChildByName(agentname);

		agentsContainer.setChildIndex( agentContainer, 
									   agentsContainer.getNumChildren() - 1);

		var newAgentX = tiles[planetid].x + agentsX;
		var newAgentY = tiles[planetid].y + agentsY;

		if( agentContainer.visible ){
			if ( newAgentX != agentContainer.x || Math.abs(newAgentY - agentContainer.y) < 50 ) {
				num_objects_moving += 1;
				createjs.Tween.get(agentContainer).to({ x:newAgentX, y:newAgentY}, 500 ).call(handleTweenComplete);
			}
			if ( player == clientTurn && agentContainer.used != agent.used ){
				var darkshape = agentContainer.getChildByName("darkshape");
				darkshape.alpha = agent.used ? U_ALPHA : ALPHA;
				agentContainer.used = agent.used;
			}
		} 
		else {
			agentContainer.x = newAgentX;
			agentContainer.y = newAgentY;
			fadeIn(agentContainer, 500, true, false);
		}

		agentsX += agtWid + space;
	}
};

var updateDeadAgents = function() {

	var agents = clientGame.game.board.agents;
	var agentsContainer = board.getChildByName('agentsContainer');

	for ( var key in agents ){

		if ( agents[key].status != AGT_STATUS_ON ){
			
			var player = agents[key].player;
			var agenttype = agents[key].agenttype;

			var agentContainer = agentsContainer.getChildByName( AGT_ENGLISH[agenttype] + player );

			agentContainer.visible = false;
		}
	}
};

var updateAgentsInteractivity = function() {

	var agentsContainer = board.getChildByName('agentsContainer');

	switch ( clientGame.game.phase ) {
		case PHS_UPKEEP:
		case PHS_ACTIONS:
			mouseOnAgents( true );
			break;
		case PHS_PLACING:
		case PHS_MISSIONS:
		case PHS_RESOURCE:
		case PHS_BUILD:
		default:
			mouseOnAgents( false );
			break;
	}
};

var mouseOnAgents = function( on ) {
	var agentsContainer = board.getChildByName('agentsContainer');

	for ( var i = AGT_EXPLORER; i <= AGT_SABATEUR; i++ ){
		var agentContainer = agentsContainer.getChildByName( AGT_ENGLISH[i] 
														+ clientTurn );
		agentContainer.mouseEnabled = on;
	}
};

var handleClickAgent = function( agenttype ) {
	setPendingAgent( agenttype );
	switch ( clientGame.game.phase ){
		case PHS_UPKEEP:
			updateAgentRetireMenu( agenttype );
			showAgentRetireMenu();
			break;
		case PHS_ACTIONS:
			updateActionMenu( 'agent', agenttype );
			showActionMenu();
			break;
		default:
			break;
	}
};

var showAgentRetireMenu = function() {
	$('#agent-retire-div').show();
};

var hideAgentRetireMenu = function() {
	$('#agent-retire-div').hide();
};

var updateAgentRetireMenu = function( agenttype ){
	var agentid = String(clientTurn) + String(agenttype);
	var agent = clientGame.game.board.agents[agentid];
	var planetid = agent.planetid;
	var planet = clientGame.game.board.planets[planetid];
	$('#agent-retire-pic').removeClass().addClass('actor-pic actor-agent-' + agenttype);
	$('#agent-retire-name').html(AGT_ENGLISH[agenttype]);
	$('#agent-retire-div').addClass('action-div-p' + clientTurn);
	$('#agent-retire-location').html('Location: ' + planet.name);
	if (agent.used) {
		var dest_id = agent.destination;
		var dest = clientGame.game.board.planets[dest_id].name
		$('#agent-retire-text').html('Currently on mission to ' + dest);
	}
	else {
		$('#agent-retire-text').html('Not on mission');
	}
	$('#agent-retire-button').click( function() { 
											hideAgentRetireMenu();
											setPendingAction( ACT_RETIRE );
											displayConfirmMenu();
										} );
};

var selectAgent = function( agentname) {
	var agentsContainer = board.getChildByName('agentsContainer');
	var agentContainer = agentsContainer.getChildByName( agentname );
	setSelection(agentContainer.x + 20, agentContainer.y - 28);
};