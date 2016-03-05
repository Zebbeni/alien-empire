/**
 * game_actions contains all functions for handling player actions during a game.
 * contains functions to change game variables and check legality of moves
 */

var cons = require('./server_constants');
var helpers = require('./game_helpers');

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
		// This is stand in logic. End game condition should be checked 
		// during the upkeep phase
		if ( isEndCondition( game ) ){
			return {
					to: cons.EVENT_ALL,
					evnt: 'game end',
					content: {}
				};
		}
		else if ( game.playerTurn != action.player ){
			return {
					to: cons.EVENT_ONE,
					evnt: 'illegal action',
					content: "it is not your turn"
				};
		}
		else { // increment round round
			updateTurn( game );
			return {
					to: cons.EVENT_ALL,
					evnt: 'game event',
					content: {
						game: game
					}
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
		case cons.ACT_VIEWED_MISSIONS:
			return applyViewedMissions( action, game );
		case cons.ACT_BLOCK_MISSION:
			return applyBlockMission( action, game );
		case cons.ACT_MISSION_RESOLVE:
			return applyMissionResolve( action, game );
		case cons.ACT_MISSION_VIEWED:
			return applyMissionViewed( action, game );
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

		updateBuildableBy( player,
						   planetid,
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

	if ( game.playerTurn != player ) {
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
	
	if ( objecttype == cons.OBJ_FACTORY || objecttype == cons.OBJ_EMBASSY ) {

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

	if ( !hasEnoughToBuild( player, objecttype, game ) ) {
	
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

				// TODO: This block of ~3 lines is very similar for all
				// Structures. We should generalize this.
				game.board.planets[planetid].base = {
													player: action.player,
													used: false
												};
				payToBuild( player, objecttype, game);
				game.structures[player][cons.OBJ_BASE] -= 1;

				updateSettledBy( player, 
								 planetid, 
								 game );

				updateBuildableBy( player,
								   planetid,
								   game );

				addPointsForStructure( player, 
									   objecttype, 
									   planetid, 
									   game);

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

						payToBuild( player, objecttype, game);
						game.structures[player][cons.OBJ_FLEET] -= 1;

						addPointsForStructure( player, 
											   objecttype, 
											   planetid, 
											   game);

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
			payToBuild( player, objecttype, game);

			game.structures[player][objecttype] -= 1;
			game.structures[player][cons.OBJ_MINE] += 1;

			updateSettledBy( player, 
						   planetid, 
						   game );

			updateBuildableBy( player,
							   planetid,
							   game );

			addPointsForStructure( player, 
								   objecttype, 
								   planetid, 
								   game );
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
			payToBuild( player, objecttype, game);
			game.structures[player][cons.OBJ_MINE] -= 1;

			updateSettledBy( player, 
							 planetid, 
							 game );

			updateBuildableBy( player,
							   planetid,
							   game );

			addPointsForStructure( player, objecttype, planetid, game);
			break;

		default:
			return { isIllegal: true,
					 response: "Unknown building type"
					};
	}

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

	findAndSetMissionResolved( game, player, agenttype );

	// remove agent from planet
	var index = game.board.planets[planetid].agents.indexOf(id);
	game.board.planets[planetid].agents.splice( index, 1 );

	agent.status = cons.AGT_STATUS_DEAD;
	
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
	var objecttype = action.objecttype;
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
		return { isIllegal: true,
				 response: "You cannot remove another player's structure." };
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

	for (var i = cons.RES_METAL; i <= cons.RES_FOOD; i++){
		if ( game.resources[player][i] - resources[i] < 0){
			return { isIllegal: true,
				 	 response: "You do not have enough resources to pay upkeep"
			};
		}
	}

	payPlayerUpkeep(player, resources, game);
	game.resourcePackages[player][pkgindex].collected = true;

	if ( pkgtype == cons.PKG_UPKEEP && game.phase == cons.PHS_UPKEEP ){
		game.phaseDone[player] = true;
		updatePhase( game );
	}

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

	moveAgent( agent, agentid, planetid, planets );
	agent.used = true;

	return { isIllegal: false };

};

var applyLaunchMission = function( action, game ) {

	var player = action.player;
	var agenttype = action.agenttype;
	var planetid = action.planetid;

	var agentid = String(player) + String(agenttype);
	var agent = game.board.agents[ agentid ];
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

	var newMission = {
						player: player,
						agenttype: agenttype,
						planetTo: planetid,
						planetFrom: agent.planetid,
						resolution: {
							resolved: false,
							blocked: undefined,
							blockedBy: undefined,
						} // object with details of how mission was completed
					};

	if ( agenttype == cons.AGT_MINER || agenttype == cons.AGT_ENVOY ){
		newMission.collectors = [player];
	}

	// TODO: check for SMUGGLER and add an extra attribute for the agent he
	// is smuggling in
	game.missions[ game.round ].push( newMission );

	agent.used = true;
	agent.missionround = game.round;

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
	var index = game.missionindex;
	var round = game.round - 2;
	var mission = game.missions[round][index];
	var planetid = mission.planetTo;

	if ( game.missionSpied[ player ] != null ){
		// Do not return illegal, but also do not change game state
		return { isDuplicate: false }; 
	}

	// choice is null if spying player wants to collect resources from mission
	// this should update their spy eyes and opponent's mission info before
	// falling through to resolve as a non-blocked mission
	if ( choice == null && game.board.planets[planetid].spyeyes[player] > 0 ) {

		game.board.planets[planetid].spyeyes[player] -= 1;
		game.missions[round][ index ].collectors.push( player );
	}

	// choice is true if player has chosen to block the mission
	if ( choice == true && game.board.planets[planetid].spyeyes[player] > 0 ){

		game.missionSpied[ player ] = true;

		game.missions[round][ index ].resolution.blocked = true;
		game.missions[round][ index ].resolution.blockedBy = player;
		game.missions[round][ index ].resolution.resolved = true;
		game.board.planets[planetid].spyeyes[player] -= 1;

		helpers.resetMissionSpied(game);
	}

	else {

		game.missionSpied[ player ] = false;

		if ( game.missionSpied.indexOf(true) == -1 
			 && game.missionSpied.indexOf(null) == -1) {

			// set flag letting player know they need to resolve this mission
			game.missions[round][ index ].waitingOnResolve = true;

			switch (mission.agenttype) {
				
				case cons.AGT_EXPLORER:
					
					// apply planet explored here, not in applyMissionsResolve, 
					// since player needs to be able to see planet to resolve.

					if ( game.board.planets[planetid].explored == false ){
						addPointsLimited( mission.player, 
										  planetid, 
										  cons.PNT_EXPLORE, 
										  game );
						game.board.planets[planetid].explored = true;
					}

					var is_unreserved = false;
					var resources = game.board.planets[planetid].resources;

					for ( var i = 0; i < resources.length; i++ ) {
						if ( resources[i].reserved == undefined ) {
							is_unreserved = true;
						}
					}

					// Add flag if player has no remaining options 
					if ( !is_unreserved ) {
						game.missions[round][index].resolution.nochoice = true;
					}
					break;

				case cons.AGT_MINER:

					var planet = game.board.planets[planetid];
					// Add flag if player has no remaining options
					if ( !planet.settledBy[mission.player] ) {
						game.missions[round][index].resolution.nochoice = true;
					}
					break;

				case cons.AGT_ENVOY:

					var planet = game.board.planets[planetid];
					var hasEmbassy = false;

					for ( var r = 0; r < planet.resources.length; r++ ){
						
						var res = planet.resources[r];
						
						if ( res.structure != undefined 
								&& res.structure.kind == cons.OBJ_EMBASSY
							 	&& res.structure.player == mission.player ) {
						
							hasEmbassy = true;
							break;
						}
					}	

					if ( !hasEmbassy ) {
						game.missions[round][index].resolution.nochoice = true;
					}
					break;

				case cons.AGT_SABATEUR:

					var planet = game.board.planets[planetid];
					var possibleTarget = false;

					for ( var r = 0; r < planet.resources.length; r++ ){
						
						var res = planet.resources[r];
						
						if ( res.structure != undefined 
								&& res.structure.kind != cons.OBJ_MINE
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
						game.missions[round][index].resolution.nochoice = true;
					}

					break;

				default:
					break;
			}
		}

		if (choice == true) {
			return { isIllegal: true,
				 response: "You have no spy markers to block a mission here"
			};
		}
	}

	return { isIllegal: false};
};

var applyMissionResolve = function( action, game ){

	var player = action.player;
	var choice = action.choice;
	var agenttype = action.agenttype;
	var agentid = String(player) + String(agenttype);
	var planetid = action.planetid;
	var index = game.missionindex;
	var round = game.round - 2;
	var mission = game.missions[ round ][ index ];

	var agent = game.board.agents[ agentid ];
	var planets = game.board.planets;

	if ( mission.player != player ){
		return { isIllegal: true,
				 response: "This is not your mission to resolve"
			};
	}

	if ( mission.planetTo != planetid ||  mission.agenttype != agenttype ){
		// don't return illegal if on a different mission but do not proceed either
		return { isDuplicate: false };
	}

	if ( game.missionSpied.indexOf( null ) != -1 ) {
		// Do not return illegal if not all spies have come in yet
		// but do not update the game state
		return { isDuplicate: false };
	}

	if ( planets[ agent.planetid ].borders[planetid] == cons.BRD_BLOCKED ){

		game.missions[round][ index ].resolution.noflyblocked = true;

	}

	else if ( game.missions[round][index].resolution.nochoice ) {
		moveAgent( agent, agentid, planetid, planets );
	}

	else if ( !game.missions[round][ index ].resolution.agentmia ) {

		// THIS is where we should actually apply the agent mission logic
		// depending on the type of agent
		// we may need to create a switch/case series here sending to 
		// more granulated functions
		switch (agenttype) {
			
			case cons.AGT_EXPLORER:
				
				var resid = action.resourceid;
				var resource = game.board.planets[planetid].resources[resid];
				
				if ( resource.reserved != undefined) {
					return { isIllegal: true,
						 	 response: "This resource is already reserved"
					};
				}
								
				resource.reserved = player;
				break;

			case cons.AGT_MINER:
				
				var resid = action.resourceid;
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
					helpers.addResourcePackage( game, 
							mission.collectors[i], 
							cons.PKG_MINER, 
							resources, 
							'From Miner' );
				}
				break;

			case cons.AGT_SPY:

				game.board.planets[mission.planetTo].spyeyes[player] += 1;
				game.board.planets[mission.planetFrom].spyeyes[player] += 1;
				break;

			case cons.AGT_ENVOY:

				var planet_resources = game.board.planets[planetid].resources;
				var resources = [0, 0, 0, 0];
				
				for ( var r = 0; r < planet_resources.length; r++ ){
					var res = planet_resources[r];
					var struct = res.structure;
					if (struct != undefined && struct.player != mission.player){
						resources[res.kind] += 1;
					}
				}

				for ( var i = 0; i < mission.collectors.length; i++ ) {
					helpers.addResourcePackage( game, 
							mission.collectors[i], 
							cons.PKG_ENVOY, 
							resources, 
							'From Envoy' );
				}

				addPointsLimited( mission.player, 
								  planetid, 
								  cons.PNT_ENVOY, 
								  game );
				break;

			case cons.AGT_SABATEUR:

				var objecttype = mission.objecttype;
				var resid = mission.resourceid;
				var resource = game.board.planets[planetid].resources[resid];

				addPointsLimited( mission.player, 
								  planetid, 
								  cons.PNT_DESTROY, 
								  game );
				
				// Some things to consider as we figure out how to click on things
				// if we remove a base, make sure to remove all of that player's fleets
				// also remove all agents if removing last factory or embassy
				// in fact, let's make a generic removeStructure() function to do this
				// it's dumb we're doing it in multiple places

				break;

			default:
				break;

		}

		moveAgent( agent, agentid, planetid, planets );
	}
	
	game.missions[round][ index ].resolution.resolved = true;
	helpers.resetMissionSpied( game );
	agent.missionround = undefined;
	agent.used = false;

	return { isIllegal: false };
};

var applyMissionViewed = function( action, game ){
	var player = action.player;
	var index = action.choice;
	var round = game.round - 2;

	if ( index != game.missionindex) {
		// don't return illegal if on a different mission
		// but do not proceed either
		return { isDuplicate: false };
	}

	game.missionViewed[ player ] = true;

	// if all players have viewed missions, 
	if ( game.missionViewed.indexOf( false ) == -1 ){

		for ( var i = 0; i < game.missionViewed.length; i++ ){
			game.missionViewed[i] = false;
		}

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

var moveAgent = function( agent, agentid, planetid, planets ) {

	var index = planets[ agent.planetid ].agents.indexOf( agentid );
	planets[ agent.planetid ].agents.splice( index, 1 );

	agent.planetid = planetid;
	planets[planetid].agents.push( agentid );
};

// checks if an agent being removed has a pending mission
// if so, sets the mission as resolved with the appropriate reason
var findAndSetMissionResolved = function( game, player, agenttype ){
	
	var mission;

	for ( var r = game.round - 1; r > 0; r-- ) {

		for ( var m = 0; m < game.missions[r].length; m++ ) {

			mission = game.missions[r][m];

			if ( mission.player == player && mission.agenttype == agenttype ){
				
				if ( mission.resolution.resolved == false ) {

					mission.resolution.resolved = true;
				
					// TODO: this should eventually allow 
					//       for different resolution reasons
					mission.resolution.agentmia = true;
				}

				return;
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

		updateBuildableBy( player,
						   planetid,
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

					var agent = game.board.agents[ String(player) + String(a)];
					
					if ( agent.status == cons.AGT_STATUS_ON ) {

						findAndSetMissionResolved( game, player, a );

						agent.status = cons.AGT_STATUS_OFF;
						agent.used = false;
					}
				}
			}
		}
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

// Updates planet.buildableBy[player] to true or false for this planet
// and all planets adjacent to it
//
// Currently assumes we added a bulding. We will need to add logic
// To remove from planet.settledBy if the last structure a player
// has on planetid is removed
var updateBuildableBy = function( player, planetid, game ) {

	var planets = game.board.planets;

	planets[planetid].buildableBy[player] = true;

	// for each planet id bordering this planet (including itself)
	for ( var pid in planets[planetid].borders ){
		// if border is open with this planet (not unexplored or blocked)
		if ( planets[planetid].borders[pid] == cons.BRD_OPEN ){
			// set buildableBy to true for this player
			planets[pid].buildableBy[player] = true;
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
		// including missions here is temporary. Eventually there should
		// be extra logic to move to the next mission in the queue, and so on
		// until all missions have been viewed, and THEN update the phase
		case cons.PHS_RESOURCE:
		case cons.PHS_UPKEEP:
			
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
};

var updateRound = function( game ){
	if ( game.phase != cons.PHS_PLACING ){
		game.playerOffset = ( game.playerOffset + 1 ) % game.num_players;
	}
	game.round += 1;
	game.missionindex = 0; // reset mission index to resolve
	updateAgentsUsed( game );
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
};

var hasEnoughToBuild = function( player, objecttype, game ) {
	var requirements = cons.STRUCT_REQS[objecttype].build;

	for (var res in requirements) {
		if ( game.resources[player][res] < requirements[res] ) {

			return false;

		}
	}

	return true;
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
var removePointsForStructure = function( player, objecttype, game ){
	var value = cons.OBJ_VALUE[objecttype];
	game.points[player][cons.PNT_STRUCTURES] -= value;
	calcPoints(game, player);
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

/**
 * Checks to see if the end condition for the game has been met
 * 
 * @return true or false
 */ 
var isEndCondition = function( game ) {
	return ( game.round >= 3 );
};