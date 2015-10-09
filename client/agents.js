/** Agents.js contains all methods for initializing and drawing agents
 * All agents are drawn once and then hidden or shown based on their 
 * current planetid (either a number or undefined). 
 */

var initAgents = function(planetid) {

	for( var agentid in clientGame.game.board.agents ) {

		var agent = clientGame.game.board.agents[agentid];
		var agenttype = agent.agenttype;
		var player = agent.player;

		var agentshape = new createjs.Shape();
		agentshape.name = AGT_ENGLISH[ agenttype ] + player;

		var agentImg = loader.getResult( AGT_ENGLISH[agenttype] + player );
		agentshape.graphics.beginBitmapFill(agentImg, "no-repeat").drawRect(0, 0, agentImg.width, agentImg.height);
		agentshape.visible = false;
		agentshape.mouseEnabled = false; //default this to false, otherwise it slows processing down

		board.addChild( agentshape );
	}
};

var updateAgents = function(planetid) {

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
	var agentsY = planet.w == 1 ? 15 : 155 ;

	for (var i = 0; i < num_agents; i++) {

		var id = planet.agents[i];
		var agent = agents[id];
		var player = agent.player;
		var agenttype = agent.agenttype;

		var agentshape = board.getChildByName(AGT_ENGLISH[agenttype] + player);
		board.setChildIndex(agentshape, board.getNumChildren()-1);

		agentshape.visible = true;
		agentshape.x = tiles[planetid].x + agentsX;
		agentshape.y = tiles[planetid].y + agentsY;

		agentsX += agtWid + space;
	}
};