/**
 * game_actions contains all functions for handling player actions during a game.
 * contains functions to change game variables and check legality of moves
 */

var cons = require('./server_constants');
var helpers = require('./game_helpers');
var gamedata = require('./game_data');

(function() {

	/**
	 * Assumes the action type of the player is the ending of a turn
	 * Returns the appropriate event and game update
	 * Returns a value indicating the sockets to update, the socket
	 * event to call, and a game object update.
	 *
	 * @action {action} action object sent from client
	 * @game game object pulled from gameInfo of client's game
	 * @return [sockets to update, event type, game object]
	 */
	module.exports.resolveTurnDone = function( action, game ) {
		if ( gamedata.isPlayerTurn(game, action.player)) {
            updateTurn( game );
            return {
                to: cons.EVENT_ALL,
                evnt: 'game event',
                content: {
                    game: game
                }
            };
		} else {
			return {
				to: cons.EVENT_ONE,
				evnt: 'illegal action',
				content: "it is not your turn"
			};
		}
	};

	/**
	 * Send players a turn update to give them the current status of the board
	 * when they've loaded their art assets. 
	 * (reasoning: it is possible some clients will load slowly and it should be 
	 * legal for other players to begin placing mines during this time)
	 */
	module.exports.resolveLoadingDone = function( action, game ) {
		return {
				to: cons.EVENT_ONE,
				evnt: 'loading done',
				content: {
					game: game
				}
			};
	};

	/** 
	 * Resolves a placement action. Calls functions to update the game state 
	 * and returns true. Returns false if illegal
	 */
	module.exports.resolveGameAction = function( action, game ) {

		// calls applyAction to apply user action to game
		// gets a return value that includes isIllegal status,
		// 
		var applyResult = applyAction( action, game );

		if( applyResult.isIllegal ) {
			return {
					to: cons.EVENT_ONE,
					evnt: 'illegal action',
					content: applyResult.response
				};
		} 
		else if ( applyResult.isDuplicate ) {
			return {
					to: cons.EVENT_ONE,
					evnt: 'duplicate',
					content: applyResult.response
				};
		}
		else if ( applyResult.endGame ){
			return {
				to: cons.EVENT_ALL,
				evnt: 'game end',
				content: {
					game: game,
					action: action,
					response: applyResult.response
				}
			};
		}
		else {
			return {
					to: cons.EVENT_ALL,
					evnt: 'game event',
					content: {
							game: game,
							action: action,
							response: applyResult.response
						}
					};
		}
	};

}());

var applyAction = function( action, game ){
	switch ( action.actiontype ) {
		case cons.ACT_PLACE:
			return applyPlaceAction( action, game );
		case cons.ACT_BUILD:
			return applyBuildAction( action, game );
		case cons.ACT_RECRUIT:
			return applyRecruitAction( action, game );
		case cons.ACT_RETIRE:
			return applyRetireAction( action, game );
		case cons.ACT_REMOVE_FLEET:
			return applyRemoveFleet( action, game );
		case cons.ACT_REMOVE:
			return applyRemoveAction( action, game );
		case cons.ACT_MOVE_AGENT:
			return applyMoveAgentAction( action, game );
		case cons.ACT_LAUNCH_MISSION:
			return applyLaunchMission( action, game );
		case cons.ACT_COLLECT_RESOURCES:
			return applyCollectResourcesAction( action, game );
		case cons.ACT_PAY_UPKEEP:
			return applyPayUpkeep( action, game );
		case cons.ACT_TRADE_FOUR_TO_ONE:
			return applyTradeFourToOne( action, game );
		case cons.ACT_TRADE_REQUEST:
			return applyTradeRequest( action, game );
		case cons.ACT_TRADE_CANCEL:
			return applyTradeCancel( action, game );
		case cons.ACT_TRADE_ACCEPT:
			return applyTradeAccept( action, game );
		case cons.ACT_TRADE_DECLINE:
			return applyTradeDecline( action, game );
		case cons.ACT_VIEWED_MISSIONS:
			return applyViewedMissions( action, game );
		case cons.ACT_BLOCK_MISSION:
			return applyBlockMission( action, game );
		case cons.ACT_MISSION_RESOLVE:
			return applyMissionResolve( action, game );
		case cons.ACT_MISSION_VIEWED:
			return applyMissionViewed( action, game );
		case cons.ACT_FLEET_MOVE:
			return applyFleetMove( action, game );
		case cons.ACT_FLEET_ATTACK:
			return applyFleetAttack( action, game );
		case cons.ACT_BASE_ATTACK:
			return applyBaseAttack( action, game );
		default:
			return { 
					isIllegal: true,
					response: "That is an unknown action"			
				};
	}
};

/**
 * Determines if placement is legal. If so, modifies the game and 
 * returns true. Returns false if illegal.
 */
var applyPlaceAction = function( action, game ){ 
	var player = action.player;
	var objecttype = action.objecttype;
	var planetid = action.planetid;
	var index = action.resourceid;

	if(index == cons.RES_NONE) {
		return { 
				isIllegal: true,
				response: "You must place this on a resource"
			};
	}
	else if( game.board.planets[planetid].resources[index].structure ) {
		return { 
				isIllegal: true,
				response: "You cannot place this on another structure"
			};
	}
	else {
		game.board.planets[planetid].resources[index].structure = {
												player: player,
												kind: objecttype
											};
		game.structures[action.player][action.objecttype] -= 1;

		updateSettledBy( player, 
						 planetid, 
						 game );

		updateBuildable( player,
						 game );

		updateTurn( game ); // placing should increment the turn
		
		calcResourcesToCollect( game, player );
		return { isIllegal: false };
	}
};

var applyBuildAction = function( action, game ) {
	var planetid = action.planetid;
	var objecttype = action.objecttype;
	var index = action.resourceid;
	var player = action.player;
	var planet = game.board.planets[planetid];

	// check to make sure game is on the build phase
	if ( game.phase != cons.PHS_BUILD ){
		return { isIllegal: true,
				 response: "This action must be done during the build phase" };
	}

	if ( !gamedata.isPlayerTurn(game, player) ) {
		return { isIllegal: true,
				 response: "This action must be done during your turn" };
	}

	// check to make sure player has an available structure
	if ( game.structures[ player ][ objecttype ] <= 0 ){

		return { isIllegal: true,
				 response: "You cannot build another " 
							+ cons.OBJ_ENGLISH[objecttype]
				};
	} 
	
	if ( objecttype == cons.OBJ_MINE ) {
		if ( planet.buildableBy[player] == false ){
			return { isIllegal: true,
					 response: "You may only build on or next to a planet"
					 			+ " you have already settled."
			};
		}
	}

	else if ( objecttype == cons.OBJ_FACTORY || objecttype == cons.OBJ_EMBASSY ) {

		var structure = planet.resources[index].structure;
		
		if ( !structure || structure.kind != cons.OBJ_MINE) {
			return { isIllegal: true,
					 response: "Choose an existing mine to build your " 
					 	+ cons.OBJ_ENGLISH[objecttype]
					};
		}
		else if ( structure.player != player ) {
			return { isIllegal: true,
					 response: "You must build this structure on your own mine."
					};
		}
	}

	if ( !gamedata.playerCanBuild(game, player, objecttype) ) {
	
		return { isIllegal: true,
				 response: "You do not have enough resources to build a new " 
							+ cons.OBJ_ENGLISH[objecttype]
				};
	}

	// Currently we're doing all the build logic in this switch statement.
	// We should break this into functions.
	switch( objecttype ){

		case cons.OBJ_BASE:

			if ( !game.board.planets[planetid].settledBy[player] ) {
				return { 
					isIllegal: true,
				 	response: "Your base must be built on a planet you have settled"
				};
			}

			if ( !planet.base ) {

				game.board.planets[planetid].base = {
													player: action.player,
													used: false
												};
				game.structures[player][cons.OBJ_BASE] -= 1;

			}
			else {
				return { 
					isIllegal: true,
					response: "Only one base can be built on a planet"
				};
			}
			break;

		case cons.OBJ_FLEET:

			// Go through all fleets, set planetid of first fleet 
			// with planetid set to null
			// If none found, return illegal action message
			for ( var i = 0; i < cons.NUM_FLEETS; i++ ) {

				var id = String(player) + String(i);
				var fleet = game.board.fleets[ id ];
				var base = game.board.planets[planetid].base;

				if ( base && base.player == player ) {

					// update fleet and planet.fleets
					if ( fleet.planetid == undefined ) {

						fleet.planetid = planetid;
						fleet.used = false;
						planet.fleets.push( id );
						game.structures[player][cons.OBJ_FLEET] -= 1;

						break;
					}
				}
				else {
						
					return { 
						isIllegal: true,
						response: "You must build fleets where you have a base"
					};
				}
			}
			break;

		case cons.OBJ_FACTORY:
		case cons.OBJ_EMBASSY:
			game.board.planets[planetid].resources[index].structure = {
												player: player,
												kind: objecttype
											};
			game.structures[player][objecttype] -= 1;
			game.structures[player][cons.OBJ_MINE] += 1;
			break;

		case cons.OBJ_MINE:

			var resource = game.board.planets[planetid].resources[index];
			
			if (resource.reserved != undefined && resource.reserved != player){
				return { isIllegal: true,
					 	 response: "This resource is reserved by another player"
					};
			}
			
			resource.structure = {
									player: player,
									kind: objecttype
								};
			game.structures[player][cons.OBJ_MINE] -= 1;
			break;

		default:
			return { isIllegal: true,
					 response: "Unknown building type"
					};
	}

	payToBuild( player, objecttype, game);
	addBuildResourcePackage(game, player, objecttype);
	updateSettledBy( player, planetid, game );
	updateBuildable( player, game );
	addPointsForStructure( player, objecttype, planetid, game);
	calcResourcesToCollect( game, player);
	calcResourceUpkeep( game, player );

	return { isIllegal: false };
};

var applyRecruitAction = function( action, game ) {
	var agenttype = action.agenttype;
	var planetid = action.planetid;
	var player = action.player;

	var id = String(player) + String(agenttype);
	var agent = game.board.agents[ id ];
	var objecttype = cons.AGT_OBJTYPE[ agenttype ];

	// check to make sure game is on the build phase
	if ( game.phase != cons.PHS_BUILD ){
		return { isIllegal: true,
				 response: "You must recruit new agents during the build phase" };
	}

	if ( game.playerTurn != player ) {
		return { isIllegal: true,
				 response: "You must recruit agents during your turn" };
	}

	if ( agent.status == cons.AGT_STATUS_DEAD ) {
		return { isIllegal: true,
				 response: "Your " + cons.AGT_ENGLISH[agenttype] 
				 			+ " cannot return during this game."
			};
	}

	if ( agent.status == cons.AGT_STATUS_ON ) {
		return { isIllegal: true,
				 response: "Your " + cons.AGT_ENGLISH[agenttype] 
				 			+ " is already on the board."
			};
	}

	if ( !helpers.playerHasStruct( player, planetid, objecttype, game)){
		return { isIllegal: true,
				 response: "You must recruit a new " + cons.AGT_ENGLISH[agenttype] 
				 			+ " at your " + cons.OBJ_ENGLISH[objecttype]
			};
	}

	agent.planetid = planetid;
	agent.used = false;
	agent.status = cons.AGT_STATUS_ON;
	game.board.planets[planetid].agents.push( id );

	calcResourceUpkeep( game, player );

	return { isIllegal: false};
};

var applyRetireAction = function( action, game ){
	var agenttype = action.agenttype;
	var player = action.player;

	var id = String(player) + String(agenttype);

	var agent = game.board.agents[id];

	if (agent == undefined){
		return { isIllegal: true,
				 response: "Something went wrong. Please try again." };
	}

	var planetid = agent.planetid;

	if (agent.player != player){
		return { isIllegal: true,
				 response: "You cannot retire another player's agent." };
	}

	if (agent.status == cons.AGT_STATUS_OFF) {
		return { isIllegal: true,
				 response: "This agent is not on the board." };
	}

	if (agent.status == cons.AGT_STATUS_DEAD) {
		return { isIllegal: true,
				 response: "This agent is already retired." };
	}

	removeAgent(game, player, agenttype, cons.AGT_STATUS_DEAD);
	
	// create a different upkeep package if removing during upkeep phase
	if ( game.phase == cons.PHS_UPKEEP ){
		replaceUpkeepPackage(game, player);
	} 
	else { // either way we recalculate resource upkeep
		calcResourceUpkeep( game, player );
	}

	return { isIllegal: false};
};

var applyRemoveFleet = function( action, game ) {

	var planetid = action.planetid;
	var fleetid = action.targetid;
	var player = action.player;

	if ( fleetid == undefined || fleetid == null ){
		return { isIllegal: true,
				 response: "No fleet id chosen." };
	}

	var planet = game.board.planets[planetid];
	var fleet = game.board.fleets[fleetid];
	var index = planet.fleets.indexOf(fleetid);

	if ( fleet.planetid != planetid ) {
		return { isIllegal: true,
				 response: "This fleet is not on this planet." };
	}

	if ( fleet.player != action.player ) {
		return { isIllegal: true,
				 response: "You cannot remove another player's fleet." };
	}

	if ( index == -1 ) {
		return { isIllegal: true,
				 response: "This fleet is not registered with this planet." };
	}

	removeStructure( game, player, cons.OBJ_FLEET, planetid, fleetid); // WIP, the function's not done yet

	return { isIllegal: false};
};

var applyRemoveAction = function( action, game ) {
	var planetid = action.planetid;
	var objecttype = action.objecttype;
	var index = action.resourceid;
	var player = action.player;
	var planet = game.board.planets[planetid];

	var structure = index != cons.RES_NONE ? planet.resources[index].structure : planet.base;

	if (structure == undefined || structure == null){
		return { isIllegal: true,
				 response: "There is no structure to remove here." };
	}

	if (structure.player != player){
		console.log('trying to remove another player structure:');
		console.log(structure);
		return { isIllegal: true,
				 response: "You cannot remove another player's structure."};
	}

	if (objecttype != cons.OBJ_BASE && structure.kind != objecttype){
		return { isIllegal: true,
				 response: "This does not match the structure type for this location." };
	}

	removeStructure(game, player, objecttype, planetid, index);
	return { isIllegal: false};
};

var applyCollectResourcesAction = function( action, game ){
	var player = action.player;
	var pkgindex = action.pkgindex;
	var resource_pkg = game.resourcePackages[player][pkgindex];

	game.resourcePackages[player][pkgindex].isnew = false;

	if ( resource_pkg.collected ) {
		return { isDuplicate: true };
	}

	var resources =  resource_pkg.resources;
	var pkgtype = resource_pkg.pkgtype;

	// Check here if the user has too many resources and reject until
	// they've 4:1'd their extras before allowing them to collect new resources
	for (var i = cons.RES_METAL; i <= cons.RES_FOOD; i++){
		if (game.resources[player][i] + resources[i] > 10){
			return { isIllegal: true,
				 response: "You must trade or 4 to 1 before collecting more"
			};
		}
	}

	collectPlayerResources(player, resources, game);
	game.resourcePackages[player][pkgindex].collected = true;

	if ( pkgtype == cons.PKG_COLLECT && game.phase == cons.PHS_RESOURCE ){
		game.phaseDone[player] = true;
		updatePhase( game );
	}

	return { isIllegal: false};
};

var applyPayUpkeep = function( action, game ){

	var player = action.player;
	var pkgindex = action.pkgindex;
	var resource_pkg = game.resourcePackages[player][pkgindex];

	game.resourcePackages[player][pkgindex].isnew = false;

	if ( resource_pkg.collected || resource_pkg.cancelled ) {
		return { isDuplicate: true };
	}

	resources = resource_pkg.resources;
	pkgtype = resource_pkg.pkgtype;

	if (!gamedata.playerCanPay(game, player, resources)){
        return { isIllegal: true,
            response: "You do not have enough resources to pay upkeep"
        };
	}

	payPlayerUpkeep(player, resources, game);
	game.resourcePackages[player][pkgindex].collected = true;

	updateStructurePoints(game, player);
	calcPoints(game, player);
	updateGameStats(game, player);

	if ( pkgtype == cons.PKG_UPKEEP && game.phase == cons.PHS_UPKEEP ){
		game.phaseDone[player] = true;
	}

	// This is where we check to see if the game should end
	if ( isEndCondition( game ) ){
		return { endGame: true };
	}

	if ( pkgtype == cons.PKG_UPKEEP && game.phase == cons.PHS_UPKEEP ){
		updatePhase( game );
	}

	return { isIllegal: false };
};

var applyTradeFourToOne = function( action, game){
	var player = action.player;
	var paytype = action.paytype;
	var gettype = action.gettype;

	if ( game.resources[player][paytype] < 4 ){
		return { isIllegal: true,
			 	 response: "You do not have enough of this resource to 4 to 1"
		};
	}

	game.resources[player][paytype] -= 4;

	var resources = [0,0,0,0];
	resources[gettype] = 1;

	helpers.addResourcePackage( game, 
							player, 
							cons.PKG_TRADE, 
							resources, 
							'From 4 to 1' );

	return { isIllegal: false};
};

var applyTradeRequest = function( action, game ){
	var player = action.player;
	var offered_to = action.offered_to;
	var requester_resources = action.requester_resources;
	var opponent_resources = action.opponent_resources;

	if ( offered_to.length <= 0 ){
		return { isIllegal: true,
				 response: "You must offer this trade to at least one player"
			};
	}

	for ( var i = 0; i < requester_resources.length; i++ ){
		if ( game.resources[player][i] < requester_resources[i] ){
			return { isIllegal: true,
				 	 response: "You do not have the resources for this trade"
			};
		}
	}

	var time_offered = Date.now() / 1000;

	game.trades[player] = {
		time_offered: time_offered,
		requester_resources: requester_resources,
		opponent_resources: opponent_resources,
		offered_to: offered_to,
		declined: []
	};

	// variable only for ai players to randomize and
	// spread out trade actions
	game.time_next_trade_allowed[player] = time_offered + (Math.random() * 30) + 30;

	return { isIllegal: false };
};

var applyTradeCancel = function( action, game ){
	var player = action.player;

	game.trades[player] = undefined;

	return { isIllegal: false };
};

var applyTradeAccept = function( action, game ){
	var requester = action.requester;
	var opponent = action.player;

	if ( game.trades[requester] == undefined ) {
		return { isIllegal: true,
				 response: "This trade is no longer available"
		};
	}

	var requester_resources = game.trades[requester].requester_resources;
	var opponent_resources = game.trades[requester].opponent_resources;

	for (var i = cons.RES_METAL; i <= cons.RES_FOOD; i++){
		if ( game.resources[opponent][i] < opponent_resources[i] ){
			return { isIllegal: true,
					 response: "You do not have enough resources for this trade"
			};
		}
		if ( game.resources[requester][i] < requester_resources[i] ){
			return { isIllegal: true,
					 response: "Your opponent does not have these resources"
			};
		}
	}

	for (var i = cons.RES_METAL; i <= cons.RES_FOOD; i++){
		game.resources[requester][i] -= requester_resources[i];
		game.resources[opponent][i] -= opponent_resources[i];
	}

	helpers.addResourcePackage( game, 
								requester, 
								cons.PKG_TRADE, 
								opponent_resources, 
								'From Trade' );

	helpers.addResourcePackage( game, 
								opponent, 
								cons.PKG_TRADE, 
								requester_resources, 
								'From Trade' );

	game.trades[requester] = undefined;

	return { isIllegal: false };
};

var applyTradeDecline = function( action, game ){
	var requester = action.requester;
	var opponent = action.player;

	if ( !game.trades[requester] ) {
		return { isIllegal: true,
				 response: "This trade is no longer available"
		};
	}

	if ( game.trades[requester].declined.indexOf(opponent) != -1 ) {
		return { isIllegal: true,
				 response: "You have already declined this trade"
		};
	}

	game.trades[requester].declined.push(opponent);

	return { isIllegal: false };
};

var applyMoveAgentAction = function( action, game ){

	var player = action.player;
	var agenttype = action.agenttype;
	var planetid = action.planetid;

	var agentid = String(player) + String(agenttype);
	var agent = game.board.agents[ agentid ];
	var planets = game.board.planets;

	if ( !(planetid in planets[agent.planetid].borders ) ) {
		return { isIllegal: true,
				 response: "Agents can only move to adjacent planets"
			};
	}

	if ( planets[agent.planetid].borders[planetid] == cons.BRD_BLOCKED ){
		return { isIllegal: true,
				 response: "Agents cannot move through blocked borders"
			};
	}

	if ( agent.missionround != undefined ) {
		return { isIllegal: true,
				 response: "This agent is on a pending mission"
			};
	}

	if ( agent.used ) {
		return { isIllegal: true,
				 response: "This agent can only do one action per round"
			};
	}

	moveAgent( game, agentid, planetid );
	agent.used = true;

	return { isIllegal: false };

};

var applyFleetMove = function( action, game ){

	var player = action.player;
	var fleetid = action.targetid;
	var fleet = game.board.fleets[fleetid];
	var planetfrom = game.board.planets[fleet.planetid];

	if ( game.playerTurn != player ) {
		return { isIllegal: true,
				 response: "You must move fleets during your turn"
		};
	}

	if ( fleet.used ){
		return { isIllegal: true,
				 response: "Fleet has already been used this turn"
		};
	}

	if ( fleet.planetid == action.planetid ) {
		return { isIllegal: true,
				 response: "Fleet is already on this planet"
		};
	}

	if ( !(action.planetid in planetfrom.borders )) {
		return { isIllegal: true,
				 response: "Fleets can only move one planet per turn"
		};
	}

	if ( planetfrom.borders[action.planetid] == cons.BRD_BLOCKED ) {
		return { isIllegal: true,
				 response: "Fleets cannot cross no-fly zones"
		};
	}

	moveFleet( game, fleetid, action.planetid);

	return { isIllegal: false };
};

var applyFleetAttack = function( action, game ){
	var player = action.player;
	var objecttype = action.objecttype;
	var fleetid = action.targetid;
	var attackid = action.choice;
	var planetid = action.planetid;
	var targetPlayer = action.targetPlayer;
	var planet = game.board.planets[planetid];
	var fleet = game.board.fleets[fleetid];
	action.success = false;

	if ( game.playerTurn != player ) {
		return { isIllegal: true,
				 response: "You may only attack during your turn"
		};
	}

	if ( fleet.used ){
		return { isIllegal: true,
				 response: "This fleet has already been used this turn"
		};
	}

	if ( objecttype == cons.OBJ_MINE ){
		return { isIllegal: true,
				 response: "Mines cannot be attacked"
		};
	}

	if ( planetid != fleet.planetid ){
		return { isIllegal: true,
				 response: "Your fleet does not appear to be on this planet"
		};
	}

	if ( player == targetPlayer ){
		return { isIllegal: true,
				 response: "You cannot attack your own structures"
		};
	}

	if ( objecttype == cons.OBJ_FLEET ){
		var attackfleet = game.board.fleets[attackid];

		if ( fleet.planetid != attackfleet.planetid ){
			return { isIllegal: true,
				 	 response: "You must attack a fleet on the same planet"
			};
		}

		var attackRoll = Math.ceil(Math.random() * 6);

		if ( attackRoll > cons.STRUCT_REQS[objecttype].defense ){

			addPointsLimited( player, 
							  planetid, 
							  cons.PNT_DESTROY,
							  game );

			removeStructure(game, targetPlayer, objecttype, planetid, attackid);
			action.success = true;
		}
	}
	else if ( objecttype == cons.OBJ_BASE) {
		if ( planet.base == undefined || planet.base.player != targetPlayer ) {
			return { isIllegal: true,
				 	 response: "You must attack a base on the same planet"
			};
		}

		var attackRoll = Math.ceil(Math.random() * 6);
		if ( attackRoll > cons.STRUCT_REQS[objecttype].defense ){

			addPointsLimited( player, 
							  planetid, 
							  cons.PNT_DESTROY,
							  game );

			removeStructure(game, targetPlayer, objecttype, planetid, attackid);
			action.success = true;
		}
		// Do logic to attack base here
	}
	else {
		var resource = planet.resources[attackid];
		
		if ( resource.structure == undefined 
			 || resource.structure.player != targetPlayer
			 || resource.structure.kind != objecttype ) {
			return { isIllegal: true,
				 	 response: "You must attack a structure on the same planet"
			};
		}

		// Do logic to attack fleets and embassies here
		var attackRoll = Math.ceil(Math.random() * 6);
		if ( attackRoll > cons.STRUCT_REQS[objecttype].defense ){

			addPointsLimited( player, 
							  planetid, 
							  cons.PNT_DESTROY,
							  game );

			removeStructure(game, targetPlayer, objecttype, planetid, attackid);
			action.success = true;
		}
	}

	game.board.fleets[fleetid].used = true;

	return { isIllegal: false };
};

var applyBaseAttack = function( action, game ){
	var player = action.player;
	var objecttype = action.objecttype;
	var attackid = action.choice;
	var planetid = action.planetid;
	var targetPlayer = action.targetPlayer;
	var planet = game.board.planets[planetid];
	var base = planet.base;

	action.success = false;

	if ( game.playerTurn != player ) {
		return { isIllegal: true,
				 response: "You may only attack during your turn"
		};
	}

	if ( base.used ){
		return { isIllegal: true,
				 response: "Your base has already been used this turn"
		};
	}

	if (objecttype != cons.OBJ_FLEET){
		return { isIllegal: true,
				 response: "Bases can only attack fleets"
		};
	}

	if ( player == targetPlayer ){
		return { isIllegal: true,
				 response: "You cannot attack your own fleet"
		};
	}

	var fleet = game.board.fleets[attackid];

	if ( fleet.planetid != planetid ) {
		return { isIllegal: true,
				 response: "Your base can only attack fleets at the same planet"
		};
	}

	// Do logic to attack fleet here
	var attackRoll = Math.ceil(Math.random() * 6);

	if ( attackRoll > cons.STRUCT_REQS[cons.OBJ_FLEET].defense ){

		addPointsLimited( player, 
						  planetid, 
						  cons.PNT_DESTROY,
						  game );

		removeStructure(game, targetPlayer, objecttype, planetid, attackid);
		action.success = true;
	}

	game.board.planets[planetid].base.used = true;

	return { isIllegal: false };
};

var applyLaunchMission = function( action, game ) {

	var player = action.player;
	var agenttype = action.agenttype;
	var planetid = action.planetid;

	var agentid = String(player) + String(agenttype);
	var smugglerid = String(player) + String(cons.AGT_SMUGGLER);
	var agent = game.board.agents[ agentid ];
	var smuggler = game.board.agents[ smugglerid ];

	var planets = game.board.planets;

	if ( planetid != agent.planetid && !(planetid in planets[agent.planetid].borders ) ) {
		return { isIllegal: true,
				 response: "Choose a location within one space of your agent"
			};
	}

	if ( agent.missionround != undefined ){
		return { isIllegal: true,
				 response: "This agent is on a pending mission"
			};
	}

	if ( game.playerTurn != player ) {
		return { isIllegal: true,
				 response: "You must launch missions during your turn"
			};
	}

	if ( agent.used ) {
		return { isIllegal: true,
				 response: "This agent can only do one action per round"
			};
	}

	if ( action.usesmuggler == true ) {
		if ( smuggler.status != cons.AGT_STATUS_ON ) {
			return { isIllegal: true,
				 	 response: "Your smuggler is not on the board"
			};
		}

		if ( smuggler.used ) {
			return { isIllegal: true,
				 	 response: "Your smuggler cannot perform another action this turn"
			};
		}

        if ( agenttype == cons.AGT_SMUGGLER ) {
            return { isIllegal: true,
                response: "Smugglers cannot smuggle their own missions"
            };
        }

		if ( smuggler.planetid != agent.planetid ) {
			return { isIllegal: true,
				 	 response: "Your smuggler must be on the same planet as your mission agent"
			};
		}

		smuggler.used = true;
		smuggler.missionround = game.round;
		smuggler.destination = planetid;
	}

	var newMission = {
						player: player,
						agenttype: agenttype,
						index: game.missions[game.round].length,
						planetTo: planetid,
						planetFrom: agent.planetid,
						useSmuggler: action.usesmuggler,
						result: "Mission pending...",
						status: cons.MISSION_UNRESOLVED,
						blockers: [], // list of players who blocked mission
						viewers: helpers.initializeViewed(game),
        				spyActions: helpers.initializeSpyActions(game)
					};

	if ( agenttype == cons.AGT_MINER || agenttype == cons.AGT_ENVOY ){
		newMission.collectors = [player];
	}

	game.missions[ game.round ].push( newMission );

	agent.used = true;
	agent.missionround = game.round;
	agent.destination = planetid;

	return { isIllegal: false };
};

var applyViewedMissions = function( action, game) {
	var player = action.player;

	if ( game.phase != cons.PHS_MISSIONS ){
		return { isIllegal: true,
				 response: "The resolve missions phase is complete"
			};
	}

	if ( game.phaseDone[player] ){
		return { isIllegal: true,
				 response: "Waiting for other players to finish viewing"
			};
	}

	game.phaseDone[player] = true;
	updatePhase( game );

	return { isIllegal: false };
};

var applyBlockMission = function( action, game ){

	var player = action.player;
	var choice = action.choice;
	var mission = gamedata.getCurrentMission(game);
	var planetid = mission.planetTo;

	if ( mission.spyActions[ player ] != cons.SPY_ACT_NULL ){
		// Do not return illegal, but also do not change game state
		return { isDuplicate: false }; 
	}

    if (choice == cons.SPY_ACT_BLOCK || choice == cons.SPY_ACT_COLLECT) {
		if ( game.board.planets[planetid].spyeyes[player] <= 0 ) {
			return { isIllegal: true,
				response: "You have no spy markers to block a mission here"
			};
		}
    }

	// this should update their spy eyes and opponent's mission info before
	// falling through to resolve as a non-blocked mission
	if ( choice == cons.SPY_ACT_COLLECT && game.board.planets[planetid].spyeyes[player] > 0 ) {

		game.board.planets[planetid].spyeyes[player] -= 1;
		mission.collectors.push( player );
	}

	// choice is true if player has chosen to block the mission
	if ( choice == cons.SPY_ACT_BLOCK && game.board.planets[planetid].spyeyes[player] > 0 ){

		mission.spyActions[player] = cons.SPY_ACT_BLOCK;
        mission.status = cons.MISSION_BLOCKED_SPY;
        mission.blockers.push(player);
        game.board.planets[planetid].spyeyes[player] -= 1;
	}

	else {

		mission.spyActions[ player ] = cons.SPY_ACT_ALLOW;

		// If all player responses are in with no blockers...
		if ( mission.spyActions.indexOf(cons.SPY_ACT_BLOCK) == -1
			&& mission.spyActions.indexOf(cons.SPY_ACT_NULL) == -1
			&& mission.status != cons.MISSION_BLOCKED_NO_FLY) {

			// set flag letting player know they need to resolve this mission
            mission.status = cons.MISSION_PENDING_CHOICE;

			switch (mission.agenttype) {
				
				case cons.AGT_EXPLORER:
					
					// apply planet explored here, not in applyMissionsResolve, 
					// since player needs to be able to see planet to resolve.

					if ( game.board.planets[planetid].explored == false ){
						var points = addPointsLimited( mission.player, 
										 			   planetid, 
										  			   cons.PNT_EXPLORE, 
										  			   game );

						setPlanetExplored( game, planetid );
						var planet = game.board.planets[planetid];
						var result = " discovered a planet and earned " + points + " points,";
                        mission.result = result;
					}

					var is_unreserved = false;
					var resources = game.board.planets[planetid].resources;

					for ( var i = 0; i < resources.length; i++ ) {
						if ( resources[i].reserved == undefined && !resources[i].structure ) {
							is_unreserved = true;
						}
					}

					// Add flag if player has no remaining options 
					if ( !is_unreserved ) {
                        mission.status = cons.MISSION_RESOLVED_NO_CHOICE;
					}
					break;

				case cons.AGT_MINER:

					var planet = game.board.planets[planetid];
					// Add flag if player has no remaining options
					if ( !planet.settledBy[mission.player] ) {
                        mission.status = cons.MISSION_RESOLVED_NO_CHOICE;
					}

					break;

				case cons.AGT_ENVOY:

					var planet = game.board.planets[planetid];
					var hasEmbassy = false;

					for ( var r = 0; r < planet.resources.length; r++ ){
						
						var res = planet.resources[r];
						
						if ( res.structure != undefined 
								&& res.structure.kind == cons.OBJ_EMBASSY ) {
						
							hasEmbassy = true;
							break;
						}
					}	

					if ( !hasEmbassy ) {
                        mission.status = cons.MISSION_RESOLVED_NO_CHOICE;
					}
					break;

				case cons.AGT_SABATEUR:

					var planet = game.board.planets[planetid];
					var possibleTarget = false;

					for ( var r = 0; r < planet.resources.length; r++ ){
						
						var res = planet.resources[r];
						
						if ( res.structure != undefined 
							 	&& res.structure.player != mission.player ) {
						
							possibleTarget = true;
							break;
						}
					}

					if ( !possibleTarget ){
						var base = planet.base;

						if ( base && base.player != mission.player ){
							possibleTarget = true;
						}
					} 

					if ( !possibleTarget ){
						
						var fleets = planet.fleets;

						for ( var f = 0; f < fleets.length; f++ ){
							
							var fleetid = fleets[f];
							var fleet = game.board.fleets[ fleetid ];

							if ( fleet.player != mission.player ){

								possibleTarget = true;
								break;
							}
						}
					}

					if ( !possibleTarget ) {
                        mission.status = cons.MISSION_RESOLVED_NO_CHOICE;
					}

					break;

				default:
					break;
			}
		}
	}

	return { isIllegal: false};
};

var applyMissionResolve = function( action, game ){

	console.log('server, trying to resolve mission');
	console.log(action);

	var player = action.player;
	var choice = action.choice;
	var agenttype = action.agenttype;
	var agentid = String(player) + String(agenttype);
	var planetid = action.planetid;
	// TODO: create a getCurrentMission helper function to do these three lines
	var index = game.missionindex;
	var round = game.round - 2;
	var mission = gamedata.getCurrentMission(game);

	console.log('server, mission object:');
	console.log(mission);

	var agent = game.board.agents[ agentid ];
	var planets = game.board.planets;

	if ( mission.player != player ){
		return { isIllegal: true,
				 response: "This is not your mission to resolve"
			};
	}

	if ( mission.planetTo != planetid ||  mission.agenttype != agenttype ){
		// don't return illegal if on a different mission but do not proceed either
		console.log('! Rejected resolve, planetTo: ' + mission.planetTo + ', planetid: ' + planetid, 'm.agenttype: ' + mission.agenttype +  ', agenttype: ' + agenttype);
		return { isDuplicate: false };
	}

	if ( mission.spyActions.indexOf(cons.SPY_ACT_NULL) != -1 ) {
		// Do not return illegal if not all spies have come in yet
		// but do not update the game state
		console.log('! Rejected resolve: not all spy actions in');
		return { isDuplicate: false };
	} else if ( mission.status == cons.MISSION_RESOLVED_NO_CHOICE || mission.status == cons.MISSION_BLOCKED_SPY ) {
		moveAgent( game, agentid, planetid );
    } else if ( mission.status != cons.MISSION_CANCELLED_NO_AGENT && mission.status != cons.MISSION_BLOCKED_NO_FLY ) {
		// THIS is where we should actually apply the agent mission logic
		// depending on the type of agent
		// we may need to create a switch/case series here sending to 
		// more granulated functions
		switch (agenttype) {
			
			case cons.AGT_EXPLORER:
				
				var resid = action.resourceid;

				// if explorer player has elected not to reserve a resource
				if ( resid == undefined ){
					break;
				}

				var resource = game.board.planets[planetid].resources[resid];

				if ( resource.reserved != undefined) {
					return { isIllegal: true,
						 	 response: "This resource is already reserved"
					};
				}
				
				mission.result = ' reserved ' + cons.RES_ENGLISH[resource.kind] + ".";

				resource.reserved = player;
				break;

			case cons.AGT_MINER:

				var resid = action.resourceid;
				
				if ( resid == undefined ) {
					return { isIllegal: true,
						 	 response: "You must choose a resource to collect"
					};
				}

				var resource = game.board.planets[planetid].resources[resid];
				var resource_kind = resource.kind;
				
				if (resource.structure == undefined || resource.structure.player != player) {
					return { isIllegal: true,
						 	 response: "You must choose a resource you occupy"
					};
				}

				var resources = [0,0,0,0];
				resources[resource_kind] = 6;

				for ( var i = 0; i < mission.collectors.length; i++ ) {

					if (mission.collectors[i] == player) {
						helpers.addResourcePackage( game, 
							mission.collectors[i], 
							cons.PKG_MINER, 
							resources, 
							'From Miner' );
					}
					else {
						helpers.addResourcePackage( game, 
							mission.collectors[i], 
							cons.PKG_SPY, 
							resources, 
							'From Spy' );
					}
				}

				var result = " collected 6 " + cons.RES_ENGLISH[resource_kind] + " resources.";
                mission.result = result;
				break;

			case cons.AGT_SURVEYOR:
				
				var planet_resources = game.board.planets[planetid].resources;

				if (choice.length > 2){
					return { isIllegal: true,
					 		 response: "You may only increase 2 resources per mission"
					};
				}

				for ( var i = 0; i < choice.length; i++ ){
					if ( planet_resources[choice[i]].num >= 2 ){
						return { isIllegal: true,
					 		 	 response: "One of these resources has already been increased"
						};
					}
				}

				for ( var c = 0; c < choice.length; c++ ){
					game.board.planets[planetid].resources[choice[c]].num = 2;
				}

				for ( var p = 0; p < game.num_players; p++ ){
					calcResourcesToCollect( game, p );
				}

				var result = " increased mining resources on " + planets[planetid].name + ".";
                mission.result = result;
                // bump number of successful surveyor missions
				game.num_surveyor_missions[player] += 1;
				break;

			case cons.AGT_AMBASSADOR:
				
				if (choice.length > 2){
					return { isIllegal: true,
					 		 response: "You may only block 2 borders per mission"
					};
				}

				for ( var i = 0; i < choice.length; i++ ){
					if ( planets[planetid].borders[ choice[i] ] == cons.BRD_BLOCKED ){
						return { isIllegal: true,
					 		 	 response: "One of these borders has already been blocked"
						};
					}

					if ( !planets[ choice[i] ].explored ){
						return { isIllegal: true,
					 		 	 response: "You cannot block a border to an unexplored planet"
						};
					}
				}

				var result = ' blocked borders from ' + planets[planetid].name + ' to ';

				for ( var i = 0; i < choice.length; i++ ){
					planets[planetid].borders[ choice[i] ] = cons.BRD_BLOCKED;
					planets[ choice[i] ].borders[ planetid ] = cons.BRD_BLOCKED;

					for ( var p = 0; p < game.players.length; p++ ){
						updatePlanetBuildable( p, game, planetid );
						updatePlanetBuildable( p, game, choice[i] );
					}
					if (i > 0){ 
						result += ' and '; 
					}
					result +=  planets[ choice[i] ].name;
				}

				result += ".";
                mission.result = result;

				break;

			case cons.AGT_SPY:

				game.board.planets[mission.planetTo].spyeyes[player] += 1;
				game.board.planets[mission.planetFrom].spyeyes[player] += 1;

				var result = ' added spy tokens to ' + planets[mission.planetTo].name;
				if (mission.planetTo != mission.planetFrom){
					result += ' and ' + planets[mission.planetFrom].name;
				}
                mission.result = result + ".";
				break;

			case cons.AGT_ENVOY:

				var planet_resources = game.board.planets[planetid].resources;
				var resources = [0, 0, 0, 0];
				var num_resources_collected = 0;
				var has_opponent_embassy = false;
				
				for ( var r = 0; r < planet_resources.length; r++ ){
					var res = planet_resources[r];
					var struct = res.structure;
					if (struct != undefined && struct.player != mission.player){
						if (res.num == 2 || struct.kind != cons.OBJ_MINE){
							resources[res.kind] += 2;
							num_resources_collected += 2;
							if (struct.kind == cons.OBJ_EMBASSY){
								has_opponent_embassy = true;
							}
						}
						else {
							resources[res.kind] += 1;
							num_resources_collected += 1;
						}
					}
				}

				for ( var i = 0; i < mission.collectors.length; i++ ) {
					if (mission.collectors[i] == player) {
						helpers.addResourcePackage( game, 
							mission.collectors[i], 
							cons.PKG_ENVOY, 
							resources, 
							'From Envoy' );
					}
					else {
						helpers.addResourcePackage( game, 
							mission.collectors[i], 
							cons.PKG_SPY, 
							resources, 
							'From Spy' );
					}
				}

				var points = 'no';
				if (has_opponent_embassy){
					points = addPointsLimited( mission.player, 
											   planetid, 
								  			   cons.PNT_ENVOY, 
								  			   game );
					if (points == 0){
						points = 'no';
					}
				}
				
				var result = ' collected ' + num_resources_collected 
							 + ' resources and gained ' + points + ' point.';
                mission.result = result;
				break;

			case cons.AGT_SABATEUR:
				var objecttype = action.objecttype;
				var targetPlayer = action.targetPlayer;
				var idx = action.resourceid;

				if (objecttype == cons.OBJ_FLEET){
					idx = action.targetid;
				}

				var points = addPointsLimited( mission.player, 
								  planetid, 
								  cons.PNT_DESTROY, 
								  game );

				removeStructure(game, targetPlayer, objecttype, planetid, idx);
				action.choice = idx;
				action.success = true;
				var result = ' destroyed a ' + cons.OBJ_ENGLISH[objecttype] + ' for ' + points + ' point.';
                mission.result = result;

				break;

			case cons.AGT_SMUGGLER:
				var planet = game.board.planets[planetid];
				var resources = [0, 0, 0, 0];
				var num_stolen = 0;
				for ( var i = 0; i < planet.resources.length; i++ ){
					var res = planet.resources[i];
					var struct = res.structure;
					if ( struct != undefined && struct.player != mission.player ){
						var kind = res.kind;
						if ( game.resources[struct.player][kind] > 0) {
							num_stolen += 1;
							resources[res.kind] += 1;
							game.resources[struct.player][kind] -= 1;
						}
					}
				}

				helpers.addResourcePackage( game, 
							player, 
							cons.PKG_SMUGGLER, 
							resources, 
							'From Smuggler' );

				var result = ' stole ' + num_stolen + ' resources.';
                mission.result = result;
				break;

			default:
				break;

		}
	}
	
	mission.status = cons.MISSION_COMPLETE;

	return { isIllegal: false };
};

var applyMissionViewed = function( action, game ){
	var player = action.player;
	var index = action.choice;
	var round = game.round - 2;
	var mission = gamedata.getCurrentMission(game);

	if ( index != game.missionindex) {
		// don't return illegal if on a different mission
		// but do not proceed either
		return { isDuplicate: false };
	}

	mission.viewers[ player ] = true;

	// if all players have viewed missions 
	if ( mission.viewers.indexOf( false ) == -1 ){

		updateMissionIndex( game, round );
	}

	return { isIllegal: false };
};

var collectPlayerResources = function( player, resources, game){

	for ( var i = 0; i < resources.length; i++){
		game.resources[player][i] += resources[i];
	}
};

var payPlayerUpkeep = function(player, resources, game){

	for ( var i = 0; i < resources.length; i++) {
		game.resources[player][i] -= resources[i];
	}
};

var moveAgent = function( game, agentid, planetid ) {
	var planets = game.board.planets;
	var agent = game.board.agents[ agentid ];
	var index = planets[ agent.planetid ].agents.indexOf( agentid );
	game.board.planets[ agent.planetid ].agents.splice( index, 1 );
	game.board.agents[agentid].planetid = planetid;
	game.board.planets[planetid].agents.push( agentid );
};

var moveFleet = function( game, fleetid, planetid) {

	var planets = game.board.planets;
	var fleet = game.board.fleets[fleetid];
	var planetfrom = planets[fleet.planetid];
	var planetto = planets[planetid];

	var index = planetfrom.fleets.indexOf(fleetid);
	game.board.planets[fleet.planetid].fleets.splice( index, 1 );

	game.board.planets[planetid].fleets.push(fleetid);
	game.board.fleets[fleetid].planetid = planetid;
	game.board.fleets[fleetid].used = true;
};

// checks if an agent being removed has a pending mission
// if so, sets the mission as resolved with the appropriate reason
var findAndSetMissionResolved = function( game, player, agenttype ){
	
	var mission;

	for ( var r = game.round; r > 0; r-- ) {

		if (game.missions[r] && game.missions[r].length > 0) {

            for (var m = 0; m < game.missions[r].length; m++) {

                mission = game.missions[r][m];

				// set unresolved missions to resolved (mia) if using agenttype
                if (mission.player == player && mission.status == cons.MISSION_UNRESOLVED) {

                	if (mission.agenttype == agenttype) {
                        // TODO: this should eventually allow
                        //       for different resolution reasons
						mission.status = cons.MISSION_CANCELLED_NO_AGENT;

                        var smugglerid = String(player) + String(cons.AGT_SMUGGLER);
                        var smuggler = game.board.agents[smugglerid];
                        if (mission.useSmuggler && smuggler.status == cons.AGT_STATUS_ON) {
                            game.board.agents[smugglerid].used = false;
                            game.board.agents[smugglerid].missionround = undefined;
                            game.board.agents[smugglerid].destination = undefined;
                        }
                        return;
                    }
                    else if (mission.useSmuggler && agenttype == cons.AGT_SMUGGLER) {
						mission.useSmuggler = false;
						return;
					}
                }
            }
        }
	}
};

var removeStructure = function( game, player, objecttype, planetid, idx){
	
	var fleets = game.board.fleets;
	var planets = game.board.planets;
	var planet = game.board.planets[planetid];

	game.structures[player][objecttype] += 1;
	removePointsForStructure( player, objecttype, game );

	if (objecttype == cons.OBJ_FLEET) {

		var index = planets[planetid].fleets.indexOf(idx);

		fleets[idx].planetid = undefined;
		fleets[idx].used = false;
		game.board.planets[planetid].fleets.splice( index, 1 );
	}

	else {

		if ( objecttype == cons.OBJ_BASE ) {
			game.board.planets[planetid].base = undefined;
			removeAllFleets( game, player );
		}

		else {

			if ([cons.OBJ_FACTORY, cons.OBJ_EMBASSY].indexOf(objecttype) != -1){
				
				if ( game.structures[player][cons.OBJ_MINE] >= 1 ) {
					game.board.planets[planetid].resources[idx].structure = {
															player: player, 
															kind: cons.OBJ_MINE
														};
					game.structures[player][cons.OBJ_MINE] -= 1;
				}

				else {
					game.board.planets[planetid].resources[idx].structure = undefined;
				}

			} 

			else {
				game.board.planets[planetid].resources[idx].structure = undefined;
			}

		}

		checkAndRemoveAllAgentsFor( game, 
									player, 
									objecttype );

		updateSettledBy( player, 
						 planetid, 
						 game );

		updateBuildable( player,
						 game );

		calcResourcesToCollect( game, player );
	}

	// create a different upkeep package if removing during upkeep phase
	if ( game.phase == cons.PHS_UPKEEP ){
		replaceUpkeepPackage(game, player);
	} 
	else { // either way we recalculate resource upkeep
		calcResourceUpkeep( game, player );
	}
};

var checkAndRemoveAllAgentsFor = function( game, player, objecttype ){
	if ( objecttype != cons.OBJ_FLEET && objecttype != cons.OBJ_MINE ) {
		// if player has no more of this objecttype on the board
		if ( game.structures[player][objecttype] >= cons.STRUCT_REQS[objecttype].max ) {

			for ( var a = cons.AGT_EXPLORER; a <= cons.AGT_SABATEUR; a++ ) {
				
				if ( cons.AGT_OBJTYPE[a] == objecttype ){
					removeAgent(game, player, a, cons.AGT_STATUS_OFF);
				}
			}
		}
	}
};

var removeAgent = function(game, player, agenttype, status) {
	var id = String(player) + String(agenttype);
	var agent = game.board.agents[ id ];
	
	if ( agent.status == cons.AGT_STATUS_ON ) {

		findAndSetMissionResolved( game, player, agenttype );

		var planetid = agent.planetid;
		var index = game.board.planets[planetid].agents.indexOf(id);
		game.board.planets[planetid].agents.splice( index, 1 );

		agent.missionround = undefined;
		agent.destination = undefined;

		agent.status = status;
		agent.used = false;
	}
};


// Removes all fleets from the board for a given player
var removeAllFleets = function( game, player ){

	var fleets = game.board.fleets;
	var planets = game.board.planets;

	for ( var fleetid in fleets ){

		if ( fleets[fleetid].player == player ){

			var planetid = fleets[fleetid].planetid;

			if ( planetid != undefined ){

				removeStructure( game, player, cons.OBJ_FLEET, planetid, fleetid);

			}
		}
	}
};

var setPlanetExplored = function( game, planetid ){
	game.board.planets[planetid].explored = true;

	for ( var p = 0; p < game.players.length; p++ ){
		updateBuildable( p, game );
	}
};

// Updates planet.settledBy[player] to true or false 
// 
// True if player has a non-space structure on this planet
// False if not (fleets and bases alone do not count as settled)
var updateSettledBy = function( player, planetid, game ) {

	game.board.planets[planetid].settledBy[player] = false;

	var planet = game.board.planets[planetid];
	
	for ( var i = 0; i < planet.resources.length; i++ ) {
		
		var structure = planet.resources[i].structure;
		
		if ( structure && structure.player == player ){ 
			game.board.planets[planetid].settledBy[player] = true;
		}
	}
};

// Updates planet.buildableBy[player] to true or false for all planets
// for a given player. Should be called whenever a player has a structure 
// added or removed from the board.
//
// TODO: Think of a more efficient way to update this
var updateBuildable = function( player, game ) {

	var planets = game.board.planets;

	// for all planets on board
	for ( var planetid = 0; planetid < planets.length; planetid++ ){
		updatePlanetBuildable( player, game, planetid);
	}
};

var updatePlanetBuildable = function( player, game, planetid ) {
	var planets = game.board.planets;

	// initialize buildable by to false
	planets[planetid].buildableBy[player] = false;

	if ( planets[planetid].settledBy[player] ){
		planets[planetid].buildableBy[player] = true;
	}

	else if ( planets[planetid].explored ){
		// for each planet id bordering this planet (including itself)
		for ( var pid in planets[planetid].borders ){
			// if border open with this planet (not unexplored or blocked)
			if ( planets[pid].settledBy[player] 
				 && planets[planetid].borders[pid] != cons.BRD_BLOCKED ){
				// set buildableBy to true for this player
				planets[planetid].buildableBy[player] = true;
				break;
			}
		}
	}
};

/**
 * This calculates and updates the resourceCollect array for a single
 * player. It should be run at various times during each round, particularly
 * when a building is created or removed, or a mission is completed.
 *
 * TODO: this is technically pretty inefficent. It would be better
 * to only update when a building is added, upgraded, destroyed, or a 
 * resource num is changed, but it shouldn't be a big deal for the numbers
 * we're dealing with
 */
var calcResourcesToCollect = function( game, player ) {
	
	var resourceCollect = [0, 0, 0, 0];
	var planets = game.board.planets;
	
	for ( var i = 0; i < planets.length; i++ ) {
		
		if (planets[i].explored) {

			for ( var r = 0; r < planets[i].resources.length; r++ ){

				var resource = planets[i].resources[r];
				var structure = resource.structure;

				if ( structure != undefined ) {
					
					// add 2 if a non-mine type of structure, otherwise use num
					var kind = structure.kind;
					var numToAdd = (kind == cons.OBJ_MINE ? resource.num : 2);

					if (structure.player == player) {
						resourceCollect[resource.kind] += numToAdd;
					}
				}
			}
		}
	}

	game.resourceCollect[player] = resourceCollect;
};

var calcResourceUpkeep = function( game, player ) {
	var resourceUpkeep = [0, 0, 0, 0];

	for ( var obj = cons.OBJ_MINE; obj <= cons.OBJ_FLEET; obj++ ){

		// get number of structures of type obj that are on board
		var num = cons.STRUCT_REQS[obj].max - game.structures[player][obj];
		// get upkeep object for this type of structure
		var upkeep = cons.STRUCT_REQS[obj].upkeep;

		for (var res in upkeep){
			resourceUpkeep[res] += (upkeep[res] * num);
		}
	}

	for (var a = cons.AGT_EXPLORER; a <= cons.AGT_SABATEUR; a++) {
		// ugh TODO: why did we ever use this way of indexing agents?
		var agent = game.board.agents[ String(player) + String(a) ];
		if ( agent.status == cons.AGT_STATUS_ON ){
			resourceUpkeep[cons.RES_FOOD] += 1;
		}
	}

	game.resourceUpkeep[player] = resourceUpkeep;
};

var updateTurn = function( game ){
	switch (game.phase){

		case cons.PHS_PLACING:

			if(game.secondmines) {
				
				game.turn -= 1;

				if (game.turn < 0) {
					updatePhase( game );
				}
			} else {
				
				game.turn += 1;

				if (game.turn >= game.players.length) {
					game.turn = game.players.length - 1;
					game.secondmines = true;
				}
			}

			break;

		case cons.PHS_RESOURCE:
		case cons.PHS_UPKEEP:

			break;

		case cons.PHS_BUILD:
		case cons.PHS_ACTIONS:

			game.turn += 1;
			if ( game.turn >= game.players.length) {
				updatePhase( game );

			}
			break;
	}

	updatePlayerTurn( game );
};

var updatePlayerTurn = function( game ) {
	game.playerTurn = ( game.turn + game.playerOffset ) % game.num_players;
};

var updatePhase = function( game ){
	
	game.turn = 0;

	if (game.phase == cons.PHS_ACTIONS || game.phase == cons.PHS_PLACING) {
		updateRound( game );
	}

	switch (game.phase) {
		case cons.PHS_PLACING:
			game.phase = cons.PHS_RESOURCE;
			addCollectionPhaseResourcePackages(game);
			break;
		case cons.PHS_RESOURCE:
		case cons.PHS_UPKEEP:
			// if all players have completed this phase
			if(game.phaseDone.indexOf(false) == -1){

				game.phase = (game.phase + 1) % 5;
				helpers.clearPhaseDone( game );

				// if we've just switched to the resource phase
				// add resource collection packages for each player
				if ( game.phase == cons.PHS_RESOURCE ){
					addCollectionPhaseResourcePackages(game);
				}
				else if  ( game.phase == cons.PHS_UPKEEP ){
					addUpkeepPhaseResourcePackages(game);
				}
			}
			break;

		case cons.PHS_MISSIONS:
		case cons.PHS_BUILD:
		case cons.PHS_ACTIONS:
			game.phase = (game.phase +1) % 5;
			helpers.clearPhaseDone( game );

			if ( game.phase == cons.PHS_RESOURCE ){
				addCollectionPhaseResourcePackages(game);
			}
			break;
		default:
			break;
	}

	if (game.phase == cons.PHS_MISSIONS ){
		preProcessMission( game );
	}
};

var updateRound = function( game ){
	if ( game.phase != cons.PHS_PLACING ){
		game.playerOffset = ( game.playerOffset + 1 ) % game.num_players;
	}
	game.round += 1;
	game.missionindex = 0; // reset mission index to resolve
	updateAgentsUsed( game );
	updateFleetsUsed( game );
	updateBasesUsed( game );
	updateMissions( game, game.round );
};

// Increment mission index. If we're out of missions,
// set mission index to 0 and call updatePhase.
var updateMissionIndex = function(game, round) {
	game.missionindex += 1;
	if ( game.missionindex >= game.missions[round].length ) {
		game.missionindex = 0;
		updatePhase( game );
	}
	else {
		preProcessMission( game );
	}
};

var preProcessMission = function( game ){
	var index = game.missionindex;
	var round = game.round - 2;

	if ( game.missions[round] && game.missions[round].length > 0 ){

		var mission = game.missions[round][index];
		var player = mission.player;
		var planets = game.board.planets;
		var smugglerid = String(player) + String(cons.AGT_SMUGGLER);
		var smuggler = game.board.agents[ smugglerid ];
		var agentid = String(player) + String(mission.agenttype);
		var agent = game.board.agents[ agentid ];
		var hasSmuggler = false;

		if ( mission.status == cons.MISSION_UNRESOLVED ) {

			if ( mission.useSmuggler && smuggler.status == cons.AGT_STATUS_ON ){
				hasSmuggler = true;
				game.board.agents[ smugglerid ].missionround = undefined;
				game.board.agents[ smugglerid ].used = false;
				game.board.agents[ smugglerid ].destination = undefined;
				moveAgent( game, smugglerid, mission.planetTo );
			}
			
			if ( game.board.planets[ mission.planetFrom ].borders[ mission.planetTo ] == cons.BRD_BLOCKED ){
				if (!hasSmuggler){
					game.missions[round][ index ].status = cons.MISSION_BLOCKED_NO_FLY;
				}
			}
			else {
				moveAgent( game, agentid, mission.planetTo );
			}
		}
		agent.missionround = undefined;
		agent.used = false;
		agent.destination = undefined;
	}
};

var payToBuild = function( player, objecttype, game) {
	var requirements = cons.STRUCT_REQS[objecttype].build;

	for (var res in requirements) {
		game.resources[player][res] -= requirements[res];
	}
};

// to be called on round updates, resets all agents used
// attributes to false, if not on mission
var updateAgentsUsed = function( game ) {
	var agents = game.board.agents;
	for ( var id in agents ) {
		if ( agents[id].missionround == undefined ) {
			agents[id].used = false;
		}
	}
};

// to be called on round updates, resets all fleets used
// attributes to false
var updateFleetsUsed = function( game ){
	var fleets = game.board.fleets;
	for ( var id in fleets ){
		fleets[id].used = false;
	}
};

// to be called on round updates, resets all base used
// attributes to false
var updateBasesUsed = function( game ){
	for (var i = 0; i < game.board.planets.length; i++){
		if (game.board.planets[i].base != undefined){
			game.board.planets[i].base.used = false;
		}
	}
};

// adds a new array of missions for the new round
var updateMissions = function( game, round ){
	game.missions[round] = [];
};

/**
 * This function currently just adds the number of points a structure
 * is worth when it is built. In the long-term, this is not very smart.
 * We should at least be considering the structure's location, whether
 * it has all borders blocked, etc.
 */
var addPointsForStructure = function( player, objecttype, planetid, game) {
	var value = cons.OBJ_VALUE[objecttype];
	game.points[player][cons.PNT_STRUCTURES] += value;

	calcPoints(game, player);
};

// this is also dumb. We should eventually replace both the add and remove
// points functions with one that searches all planets and returns the definitive
// point total for all structures, considering blocked borders
// TODO: update calls to this function with the new updateStructurePoints function
var removePointsForStructure = function( player, objecttype, game ){
	var value = cons.OBJ_VALUE[objecttype];
	game.points[player][cons.PNT_STRUCTURES] -= value;
	calcPoints(game, player);
};

var updateStructurePoints = function(game, player){
	var protected = getAllProtectedPlanets(game);
	var planets = game.board.planets;
	var total = 0;

	for (var p = 0; p < planets.length; p++){
		for (var r = 0; r < planets[p].resources.length; r++){
			var struct = planets[p].resources[r].structure;
			if (struct != undefined && struct.player == player){
				total += cons.OBJ_VALUE[struct.kind];
				if ( protected.indexOf(p) != -1 ){
					total += 1;
				}
			}
		}

		if ( planets[p].base && planets[p].base.player == player) {
			total += cons.OBJ_VALUE[cons.OBJ_BASE];
			if ( protected.indexOf(p) != -1 ){
				total += 1;
			}
		}
	}

	for ( var i = 0; i < cons.NUM_FLEETS; i++ ) {
		var id = String(player) + String(i);
		var fleet = game.board.fleets[ id ];
		if ( fleet.planetid != undefined ){
			total += cons.OBJ_VALUE[cons.OBJ_FLEET];
			if ( protected.indexOf(fleet.planetid) != -1 ){
				total += 1;
			}
		}
	}

	game.points[player][cons.PNT_STRUCTURES] = total;
};

var getAllProtectedPlanets = function( game ){
	var protected = [];
	var planets = game.board.planets;

	for (var pid = 0; pid < planets.length; pid++){
		if ( planets[pid].explored ){	
			var is_enclosed = true;
			for ( var bid in planets[pid].borders ){
				if ( planets[bid].explored 
					 && planets[pid].borders[bid] != cons.BRD_BLOCKED ){
					is_enclosed = false;
					break;
				}
			}
			if (is_enclosed) {
				protected.push(pid);
			}
		}
	}

	return protected;
};

var addPointsLimited = function( player, planetid, pointtype, game ){
	var value = 0;

	switch ( pointtype ){
		case cons.PNT_EXPLORE:
			value = game.board.planets[planetid].w; // point value is same as w
			break;
		case cons.PNT_ENVOY:
		case cons.PNT_DESTROY:
			value = 1;
			break;
		default:
			break;
	}

	var points_remaining = game.points_remaining[pointtype];
	var points_to_add = Math.min(value, points_remaining);
	game.points[player][pointtype] += points_to_add;
	game.points_remaining[pointtype] -= points_to_add;

	calcPoints(game, player);
	return points_to_add;
};

var addCollectionPhaseResourcePackages = function(game) {
	for ( var player = 0; player < game.num_players; player++ ){
		
		calcResourcesToCollect( game, player );
		var resources = game.resourceCollect[player];
		helpers.addResourcePackage( game, 
									player, 
									cons.PKG_COLLECT, 
									resources, 
									'Resource phase' );
	}
};

var addUpkeepPhaseResourcePackages = function( game ) {
	for ( var player = 0; player < game.num_players; player++ ){
		addUpkeepPhaseResourcePackage( game, player );
	}
};

var addUpkeepPhaseResourcePackage = function( game, player ) {
	calcResourceUpkeep( game, player );
	var resources = game.resourceUpkeep[player];
	helpers.addResourcePackage( game, 
								player,
								cons.PKG_UPKEEP, 
								resources,
								'Upkeep phase' );
};

var addBuildResourcePackage = function( game, player, objecttype ){
	var resources = cons.STRUCT_REQS[objecttype].build;
	helpers.addResourcePackage( game,
								player,
								cons.PKG_BUILD,
								resources,
								'Build ' + cons.OBJ_ENGLISH[objecttype] )
};

var replaceUpkeepPackage = function(game, player){
	var respkgs = game.resourcePackages[player];
	for ( var r = 0; r < respkgs.length; r++ ){
		if ( respkgs[r].collected == false && !respkgs[r].cancelled
			&& respkgs[r].pkgtype == cons.PKG_UPKEEP ) {
			game.resourcePackages[player][r].cancelled = true;
			addUpkeepPhaseResourcePackage( game, player);
			break;
		}
	}
};

var calcPoints = function( game, player ) {
	var points = game.points[player];
	var total = 0;
	total += points[cons.PNT_STRUCTURES];
	total += points[cons.PNT_EXPLORE];
	total += points[cons.PNT_ENVOY];
	total += points[cons.PNT_DESTROY];
	game.points[player][cons.PNT_TOTAL] = total;
};

var updateGameStats = function(game, player){
	var round = game.round;
	var points = game.points[player][cons.PNT_TOTAL];
	game.stats.points[player].push([round, points]);
};

/**
 * Checks to see if the end condition for the game has been met
 * 
 * @return true or false
 */ 
var isEndCondition = function( game ) {
	var isEnd = false;
	var maxScore = 0;
	var winner = undefined;
	var isTie = false;
	if ( game.phase == cons.PHS_UPKEEP && game.phaseDone.indexOf(false) == -1 ) {
		for ( var p = 0; p < game.players.length; p++ ) {
			if (game.points[p][cons.PNT_TOTAL] > maxScore){
				maxScore = game.points[p][cons.PNT_TOTAL];
				winner = p;
				isTie = false;
			}
			else if (game.points[p][cons.PNT_TOTAL] == maxScore){
				isTie = true;
			}
		}
		if ( maxScore >= game.points_to_win && !isTie ) {
			game.isEnded = true;
			game.winner = winner;
			return true;
		}
	}
	return ( false );
};