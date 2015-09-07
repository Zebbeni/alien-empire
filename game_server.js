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
			turn: 0
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