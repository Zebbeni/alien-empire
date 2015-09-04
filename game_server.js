var ACT_TURN_DONE = 1;

(function() {

	module.exports.initializeGame = function( user_ids, gameid ) {
		var newGame = {
			gameid: gameid,
			num_players: user_ids.length,
			players: createPlayerOrder( user_ids ),
			// round: 0,
			turn: 0
			// history: {}
		};

		return newGame;
	};

	module.exports.resolveAction = function( action, gameInfo ) {
		if ( action.actiontype == ACT_TURN_DONE ){
			return resolveTurnDone( action, gameInfo.game );
		} else {
			console.log('not ACT_TURN_DONE?');
			return false; // do nothing, return false if illegal action
		}
	};

	var createPlayerOrder = function( user_ids ) {
		// Returns a randomized array of the user ids

		var players = [];
		
		for (; 1 <= user_ids.length; ) {
			var index = Math.floor(Math.random() * user_ids.length);
			players.push( user_ids[index] );
			user_ids.splice(index, 1);
		}
		console.log('players:', players);
		return players;
	};

	var resolveTurnDone = function( action, game ) {
		console.log('turn:', game.turn);
		console.log('resolving done turn, game.num_players:', game.num_players);

		if ( game.players[ game.turn ] != action.userid ){
			return false;
		}
		else {
			game.turn = ( game.turn + 1 ) % game.num_players;
			return game;
		}
	};

}());