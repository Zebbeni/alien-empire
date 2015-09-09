var ACT_TURN_DONE = 1;
// These constants are duplicated in app.js, let's centralize them
var EVENT_ONE = 1;
var EVENT_ALL = 2;

(function() {

	module.exports.initializeGame = function( user_ids, gameid ) {
		var newGame = {
			gameid: gameid,
			num_players: user_ids.length,
			players: createPlayerOrder( user_ids ),
			round: 0,
			turn: 0,
			board: initializeBoard( user_ids.length )
		};

		return newGame;
	};

	module.exports.resolveAction = function( action, gameInfo ) {
		// This will be a switch for all different action types.
		if ( action.actiontype == ACT_TURN_DONE ){
			return resolveTurnDone( action, gameInfo.game );
		} else {
			console.log('not ACT_TURN_DONE?');
			return false; // do nothing, return false if illegal action
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

	var initializeBoard = function( num_players ) {
		var board = {
			// TODO: add explored attributes
			planets: [
				{ x: 3, y: 3, w: 1 },
				{ x: 2, y: 1, w: 2 },
				{ x: 4, y: 1, w: 1 },
				{ x: 4, y: 2, w: 2 },
				{ x: 5, y: 4, w: 1 },
				{ x: 3, y: 4, w: 2 },
				{ x: 2, y: 5, w: 1 },
				{ x: 1, y: 3, w: 2 },
				{ x: 1, y: 2, w: 1 },
				{ x: 0, y: 0, w: 2 },
				{ x: 2, y: 0, w: 1 },
				{ x: 5, y: 0, w: 2 },
				{ x: 6, y: 2, w: 1 },
				{ x: 5, y: 5, w: 2 },
				{ x: 4, y: 6, w: 1 },
				{ x: 0, y: 5, w: 2 },
				{ x: 0, y: 4, w: 1 }
			]
			// TODO: add borders array
		};

		//randomly assign 
		planet_art = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,
					  17,18,19,20,21,22,23,24,25,26,27,28,29];

		for ( var i = 0; i < board.planets.length; i++) {
			// pick random planet art index
			var index = Math.floor(Math.random() * planet_art.length);
			board.planets[i].art = planet_art[ index ];
			planet_art.splice(index, 1);
			// generate random resources
			board.planets[i].resources = generateResources(board.planets[i].w);
		}

		return board;
	};

	/**
	 * 
	 */
	var generateResources = function( size ) {
		// num_resources = 3, 4 for planets with w = 2, 1 or 2 for planets of w = 1
		var num_resources = ( size * 2 ) - 1 + Math.floor( Math.random() * 2 );
		var resources = [];

		for ( var i = 0; i < num_resources; i++ ) {
			var new_res = { 
				type: Math.floor( Math.random() * 4 ),
		 		num: 1 
			};
			resources.push( new_res )
		}
		return resources;
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
		// This is stand in logic. End game condition should be checked during the upkeep phase
		if ( isEndCondition( game ) ){
			return [EVENT_ALL, 'game end', action, {}];
		}
		else if ( game.players[ game.turn ] != action.userid ){
			return [EVENT_ONE, 'illegal action', action, {}];
		}
		else { // increment round round
			game.turn += 1;
			if ( game.turn >= game.players.length) {
				game.round += 1;
				game.turn = 0;
			}
			return [EVENT_ALL, 'turn end', action, game];
		}
	};

	/**
	 * Checks to see if the end condition for the game has been met
	 * 
	 * @return true or false
	 */ 
	var isEndCondition = function( game ) {
		return ( game.round >= 2 );
	};

}());