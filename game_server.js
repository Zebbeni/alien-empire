
var cons = require('./server_constants');

var start_planets = {
						1: [8, 3, 1],
						2: [8, 3, 1],
						3: [8, 3, 1, 12, 10],
						4: [8, 3, 1, 0, 2]
					};

(function() {

	module.exports.initializeGame = function( user_ids, gameid ) {
		var num_users = user_ids.length;
		var newGame = {
			gameid: gameid,
			num_players: num_users,
			structures: initializePlayerStructures( num_users ),
			resources: initializePlayerResources( num_users ),
			points: initializePlayerPoints( num_users ),
			players: createPlayerOrder( user_ids ),
			round: 0,
			secondmines: false,
			turn: 0,
			board: initializeBoard( num_users )
		};

		return newGame;
	};

	module.exports.resolveAction = function( action, gameInfo ) {
		// This will be a switch for all different action types.
		switch (action.actiontype) {
			case cons.ACT_LOADED_ASSETS:
				return resolveLoadingDone( action, gameInfo.game );
				break;
			case cons.ACT_TURN_DONE:
				return resolveTurnDone( action, gameInfo.game );
				break;
			case cons.ACT_PLACE:
			case cons.ACT_BUILD:
				return resolveGameAction( action, gameInfo.game );
				break;
			default:
				return false;
		}
	};

	/**
	 * Creates a randomized array of a given set of user ids
	 * 
	 * @user_ids array of user ids in the game
	 * @return array of user ids in random order
	 */
	var createPlayerOrder = function( user_ids ) {
		var players = [];
		
		for (; 1 <= user_ids.length; ) {
			var index = Math.floor(Math.random() * user_ids.length);
			players.push( user_ids[index] );
			user_ids.splice(index, 1);
		}
		return players;
	};

	// var createPlayerColors( user_ids ) {
	// 	var colors = [];

	// 	for
	// };

	var initializePlayerResources = function( num_users ) {
		var resources = [];

		for ( var i = 0; i < num_users; i++ ){

			resources.push( {} );

			resources[i][cons.RES_METAL] = 2;
			resources[i][cons.RES_WATER] = 2;
			resources[i][cons.RES_FUEL] = 2;
			resources[i][cons.RES_FOOD] = 2;
		}
		
		return resources;
	};

	var initializePlayerPoints = function( num_users ) {
		var points = [];

		for ( var i = 0; i < num_users; i++ ) {
		
			points.push( {} );

			points[i][cons.PNT_STRUCTURES] = 0;
			points[i][cons.PNT_EXPLORE] = 0;
			points[i][cons.PNT_ENVOY] = 0;
			points[i][cons.PNT_DESTROY] = 0;
			points[i][cons.PNT_TOTAL] = 0;
		}

		return points;
	};

	var initializePlayerStructures = function( num_users ) {
		var structures = [];

		for ( var i = 0; i < num_users; i++) {
			structures.push( {} );

			structures[i][cons.OBJ_MINE] = 4;
			structures[i][cons.OBJ_FACTORY] = 3;
			structures[i][cons.OBJ_EMBASSY] = 5;
			structures[i][cons.OBJ_BASE] = 1;
			structures[i][cons.OBJ_FLEET] = 3;
		}

		return structures;
	};

	var initializeBoard = function( num_players ) {
		var board = {
			// TODO: add explored attributes
			planets: [
				{ x: 2, y: 1, w: 2 },
				{ x: 4, y: 2, w: 2 },
				{ x: 3, y: 4, w: 2 },
				{ x: 1, y: 3, w: 2 },
				{ x: 0, y: 0, w: 2 },
				{ x: 5, y: 0, w: 2 },
				{ x: 5, y: 5, w: 2 },
				{ x: 0, y: 5, w: 2 },
				{ x: 3, y: 3, w: 1 },
				{ x: 4, y: 1, w: 1 },
				{ x: 5, y: 4, w: 1 },
				{ x: 2, y: 5, w: 1 },
				{ x: 1, y: 2, w: 1 },
				{ x: 2, y: 0, w: 1 },
				{ x: 6, y: 2, w: 1 },
				{ x: 4, y: 6, w: 1 },
				{ x: 0, y: 4, w: 1 }
			],
			asteroids: [
				{ x: 3, y: 0, r: 0},
				{ x: 6, y: 3, r: 1},
				{ x: 2, y: 6, r: 0},
				{ x: 0, y: 2, r: 1}
			],
			fleets: initializeFleets( num_players )
			// TODO: add borders array
		};

		//randomly assign 
		planet_art = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,
					  17,18,19,20,21,22,23,24,25,26,27,28,29];

		planet_names = ["Ezund", "Azuma", "Friani", "Azonimi", 
						"Azorsi", "Osuido", "Divyr", "Brie",
						"Engelina", "Krurn", "Yash", "Crarah",
						"Omeezah", "Fel", "Albya", "Pewbafel",
						"Led", "Lah", "Droono", "Thie",
						"Brund", "Guskulk", "Khey", "Ottaigode",
						"Maxi", "Rhotode", "Kreek", "Heye",
						"Flel", "Frunif", "Tain", "Roonoma",
						"Tafea", "Sler", "Olugong", "Uthejon",
						"Zah", "Emalel", "Katox", "Adorsea",
						"Skia", "Shishian", "Attega", "Paria",
						"Yia", "Thria", "Alongon", "Pomink",
						"Blave", "Aventea", "Rhotin", "Shral",
						"Thandoo", "Sponia", "Katyr", "Marjon",
						"Sombrea", "Godu", "Telbar", "Solian",
						"Lercia", "Kram", "Enterriune", "Alna",
						"Emesekel", "Mah", "Tassian", "Zolea"];

		for ( var i = 0; i < board.planets.length; i++) {
			// pick random planet art index
			var index = Math.floor(Math.random() * planet_art.length);
			board.planets[i].art = planet_art[ index ];
			planet_art.splice(index, 1);

			// pick random planet name index
			index = Math.floor(Math.random() * planet_names.length);
			board.planets[i].name = planet_names[ index ];
			planet_names.splice(index, 1);

			// generate random resources
			board.planets[i].resources = generateResources(board.planets[i].w);
			board.planets[i].explored = setExploredStatus(i, num_players);
			board.planets[i].base = undefined;
			board.planets[i].borders = {};
			board.planets[i].fleets = [];
		}

		// this must be run after all planets have explored value set
		initializeBorders( board );

		return board;
	};

	/**
	 * Returns true if planetid is in the starting set of planets
	 */
	var setExploredStatus = function( planetid, num_players ) {
		if ( start_planets[num_players].indexOf( planetid ) == -1 ){
			return false;
		}
		return true;
	};

	/**
	 * 
	 */
	var generateResources = function( size ) {
		var num_resources = ( size * 2 ) - 1 + Math.floor( Math.random() * 2 );
		var resources = [];

		for ( var i = 0; i < num_resources; i++ ) {
			var new_res = { 
				kind: Math.floor( Math.random() * 4 ),
		 		num: 1,
		 		structure: undefined
			};
			resources.push( new_res );
		}
		return resources;
	};

	/**
	 * Initializes fleets object which will contain all fleet objects
	 * Each fleet is identifiable by an attribute name defined by the 
	 * player it belongs to and a number between 0 and NUM_FLEETS
	 */
	var initializeFleets = function(num_players) {
		var fleets = {};
		for (var p = 0; p < num_players; p++) {
			for (var f = 0; f < cons.NUM_FLEETS; f++) {
				fleets[ String(p) + String(f) ] = {
						player: p,
						planetid: undefined,
						used: false
				};
			}
		}
		return fleets;
	};

	var initializeBorders = function(board) {

		var planets = board.planets;

		for ( var i = 0; i < planets.length; i++) {
			if ( planets[i].w == 2 ){
				for ( var j = i; j < planets.length; j++ ) {
					var distX = Math.abs(planets[j].x - planets[i].x);
					var distY = Math.abs(planets[j].y - planets[i].y);	
					if ( distX + distY <= 3) {
						createBorder(planets, i, j);
					}
				}
			}
		}
	};

	var createBorder = function(planets, i, j) {
		planets[i].borders[j] = planets[j].explored ? cons.BRD_OPEN : cons.BRD_UNEXPLORED;
		planets[j].borders[i] = planets[i].explored ? cons.BRD_OPEN : cons.BRD_UNEXPLORED;
	};

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
	var resolveTurnDone = function( action, game ) {
		// This is stand in logic. End game condition should be checked 
		// during the upkeep phase
		if ( isEndCondition( game ) ){
			return {
					to: cons.EVENT_ALL,
					evnt: 'game end',
					content: {}
				};
		}
		else if ( game.turn != action.player ){
			console.log("game.turn:", game.turn);
			console.log("action.player:", action.player);
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
					evnt: 'turn update',
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
	var resolveLoadingDone = function( action, game ) {
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
	var resolveGameAction = function( action, game ) {

		var applyResult = applyAction( action, game );

		if( applyResult.isIllegal ) {
			return {
					to: cons.EVENT_ONE,
					evnt: 'illegal action',
					content: applyResult.response
				};
		} 
		else {

			return {
					to: cons.EVENT_ALL,
					evnt: cons.ACT_ENGLISH[ action.actiontype ],
					content: {
							game: game,
							action: action
						}
					};
		}
	};

	var applyAction = function( action, game ){
		switch ( action.actiontype ) {
			case cons.ACT_PLACE:
				return applyPlaceAction( action, game );
			case cons.ACT_BUILD:
				return applyBuildAction( action, game );
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
													player: action.player,
													kind: action.objecttype
												};
			game.structures[action.player][action.objecttype] -= 1;

			updateTurn( game ); // placing should increment the turn
			
			return { isIllegal: false };
		}
	};

	var applyBuildAction = function( action, game ) {
		var planetid = action.planetid;
		var objecttype = action.objecttype;
		var index = action.resourceid;
		var player = action.player;
		var planet = game.board.planets[planetid];

		// first check to make sure player has an available structure
		if ( game.structures[ player ][ objecttype ] <= 0 ){

			return { isIllegal: true,
					 response: "You cannot build another " 
					 			+ cons.OBJ_ENGLISH[objecttype]
					};

		} 
		else if ( !hasEnoughToBuild( player, objecttype, game ) ) {
		
			return { isIllegal: true,
					 response: "You do not have enough resources to build a new " 
					 			+ cons.OBJ_ENGLISH[objecttype]
					};
		}

		// Currently we're doing all the build logic in this switch statement.
		// We should break this into functions.
		switch( objecttype ){

			case cons.OBJ_BASE:
				if ( !planet.base ) {

					// TODO: This block of ~3 lines is very similar for all
					// Structures. We should generalize this.
					game.board.planets[planetid].base = {
														player: action.player,
														used: false
													};
					payToBuild( player, objecttype, game);
					game.structures[player][cons.OBJ_BASE] -= 1;
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
				addPointsForStructure( player, objecttype, planetid, game);
				break;

			case cons.OBJ_MINE:
				game.board.planets[planetid].resources[index].structure = {
													player: player,
													kind: objecttype
												};
				payToBuild( player, objecttype, game);
				game.structures[player][cons.OBJ_MINE] -= 1;
				addPointsForStructure( player, objecttype, planetid, game);
				break;

			default:
				return { isIllegal: true,
						 response: "Unknown building type"
						};
		}
		return { isIllegal: false };
	};

	var updateTurn = function( game ){
		if(game.round == 0){
			if(game.secondmines) {
				game.turn -= 1;
				if (game.turn < 0) {
					game.turn = 0;
					game.round = 1;
				}
			} else {
				game.turn += 1;
				if (game.turn >= game.players.length) {
					game.turn = game.players.length - 1;
					game.secondmines = true;
				}
			}
		} else {
			game.turn += 1;
			if ( game.turn >= game.players.length) {
				game.round += 1;
				game.turn = 0;
			}
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

	payToBuild = function( player, objecttype, game) {
		var requirements = cons.STRUCT_REQS[objecttype].build;

		for (var res in requirements) {
			game.resources[player][res] -= requirements[res];
		}
	};

	/**
	 * This function currently just adds the number of points a structure
	 * is worth when it is built. In the long-term, this is not very smart.
	 * We should at least be considering the structure's location, whether
	 * it has all borders blocked, etc.
	 */
	addPointsForStructure = function( player, objecttype, planetid, game) {
		var value = cons.OBJ_VALUE[objecttype];
		game.points[player][cons.PNT_STRUCTURES] += value;
	};

	/**
	 * Checks to see if the end condition for the game has been met
	 * 
	 * @return true or false
	 */ 
	var isEndCondition = function( game ) {
		return ( game.round >= 3 );
	};

}());