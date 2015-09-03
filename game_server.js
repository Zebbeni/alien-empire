(function() {

	module.exports.initializeGame = function( user_ids, gameid ) {
		var newGame = {
			gameid: gameid,
			num_players: user_ids.length,
			players: createPlayerOrder( user_ids ),
			round: 0,
			turn: 1,
			history: {}
		};

		return newGame;
	};

	var createPlayerOrder = function( user_ids ) {
		// Returns a randomized array of the user ids

		var players = [];
		
		for (; 1 <= user_ids.length; ) {
			var index = Math.floor(Math.random() * user_ids.length);
			players.push( user_ids[index] );
			user_ids.splice(index, 1);
		}

		return players;
	};

}());