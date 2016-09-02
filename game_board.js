/**
 * game_boad contains all functions for the initialization 
 * of the game, players, and game board
 */

var cons = require('./server_constants');

var start_planets = {
						1: [8, 3, 1],
						2: [8, 3, 1],
						3: [8, 3, 1, 12, 10],
						4: [8, 3, 1, 0, 2]
					};

(function() {

	/**
	 * Creates a randomized array of a given set of user ids
	 * 
	 * @user_ids array of user ids in the game
	 * @return array of user ids in random order
	 */
	module.exports.createPlayerOrder = function( user_ids ) {
		var players = [];
		
		for (; 1 <= user_ids.length; ) {
			var index = Math.floor(Math.random() * user_ids.length);
			players.push( user_ids[index] );
			user_ids.splice(index, 1);
		}
		return players;
	};

	/**
	 * Populates a users-length array with all values set to the given value
	 */
	module.exports.initializeUserArray = function( num_users, value ){
		var userArray = [];
		for (var i = 0; i < num_users; i++) {
			userArray.push(value);
		}
		return userArray;
	};

	module.exports.initializePlayerPoints = function( num_users ) {
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

	module.exports.initializePoints = function( num_users) {
		var points = {};

		points[cons.PNT_EXPLORE] = cons.PNT_AVAIL[cons.PNT_EXPLORE][num_users];
		points[cons.PNT_ENVOY] = cons.PNT_AVAIL[cons.PNT_ENVOY][num_users];
		points[cons.PNT_DESTROY] = cons.PNT_AVAIL[cons.PNT_DESTROY][num_users];

		return points;
	};

	module.exports.initializePlayerStructures = function( num_users ) {
		var structures = [];

		for ( var i = 0; i < num_users; i++) {
			structures.push( {} );

			structures[i][cons.OBJ_MINE] = cons.STRUCT_REQS[cons.OBJ_MINE].max;
			structures[i][cons.OBJ_FACTORY] = cons.STRUCT_REQS[cons.OBJ_FACTORY].max;
			structures[i][cons.OBJ_EMBASSY] = cons.STRUCT_REQS[cons.OBJ_EMBASSY].max;
			structures[i][cons.OBJ_BASE] = cons.STRUCT_REQS[cons.OBJ_BASE].max;
			structures[i][cons.OBJ_FLEET] = cons.STRUCT_REQS[cons.OBJ_FLEET].max;
		}

		return structures;
	};

	module.exports.initializeBoard = function( num_players ) {
		var board = {
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
			fleets: initializeFleets( num_players ),
			agents: initializeAgents( num_players )
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
			board.planets[i].explored = setExploredStatus(i, num_players);
			board.planets[i].resources = generateResources(board.planets[i].w);
			board.planets[i].base = undefined;
			board.planets[i].fleets = [];
			board.planets[i].agents = [];
			board.planets[i].spyeyes = initializeSpyEyes(num_players);

			board.planets[i].borders = {};
			board.planets[i].settledBy = [false, false, false, false];
			board.planets[i].buildableBy = [false, false, false, false];
		}

		var resourcesOkay = isStartingResourcesOkay(board);
		while (resourcesOkay == false) {
			for ( var i = 0; i < board.planets.length; i++) {
				board.planets[i].resources = generateResources(board.planets[i].w);
			}
			resourcesOkay = isStartingResourcesOkay(board);
		}

		// this must be run after all planets have explored value set
		initializeBorders( board );

		return board;
	};

}());

/**
 * Returns true if planetid is in the starting set of planets
 */
var setExploredStatus = function( planetid, num_players ) {
	if ( start_planets[num_players].indexOf( planetid ) == -1 ){
		return false;
	}
	return true;
};

var isStartingResourcesOkay = function( board ) {
	var resources = [0,0,0,0]
	for ( var i = 0; i < board.planets.length; i++ ){
		if (board.planets[i].explored){
			for (var r = 0; r < board.planets[i].resources.length; r++) {
				var kind = board.planets[i].resources[r].kind;
				resources[kind] += 1;
			}
		}
	}
	for ( var j = 0; j < resources.length; j++ ){
		if (resources[j] == 0) {
			console.log("gotta rerandomize resources");
			return false
		}
	}
	return true
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

var initializeAgents = function(num_players) {
	var agents = {};
	for (var p = 0; p < num_players; p++) {
		for (var a = cons.AGT_EXPLORER; a <= cons.AGT_SABATEUR; a++) {
			agents[ String(p) + String(a) ] =  {
				player: p,
				agenttype: a,
				planetid: undefined,
				used: false,
				status: cons.AGT_STATUS_OFF, // AGT_STATUS_ON, AGT_STATUS_OFF, AGT_STATUS_DEAD
				missionround: undefined // the round on which agent's mission was launched
			};
		}
	}

	return agents;
};

/*
 * Initializes an n-length array of 0s. I'm sure there's 
 * a smarter way to do this in the future
 */ 
var initializeSpyEyes = function(num_players){
	var spyeyes = [];
	for ( var i = 0; i < num_players; i++ ){
		spyeyes.push(0);
	}
	return spyeyes;
};

var initializeBorders = function(board) {

	var planets = board.planets;

	for ( var i = 0; i < planets.length; i++) {
		if ( planets[i].w == 2 ){

			for ( var j = i + 1; j < planets.length; j++ ) {

				var centX1 = planets[i].x + (0.5 * planets[i].w);
				var centY1 = planets[i].y + (0.5 * planets[i].w);
				var centX2 = planets[j].x + (0.5 * planets[j].w);
				var centY2 = planets[j].y + (0.5 * planets[j].w);

				var distX = Math.abs(centX2 - centX1);
				var distY = Math.abs(centY2 - centY1);

				var dist = Math.sqrt( ( distX * distX ) + ( distY * distY ) );

				if ( dist < 2.25) {
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