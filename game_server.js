
var cons = require('./server_constants');
var board = require('./game_board');
var actions = require('./game_actions');

(function() {

	module.exports.initializeGame = function( user_ids, gameid ) {
		var num_users = user_ids.length;
		var newGame = {
			gameid: gameid,
			num_players: num_users,
			structures: board.initializePlayerStructures( num_users ),

			resources: initPlayerResources( num_users ),
			resourceCollect: initResourceCollect( num_users ),
			resourceUpkeep: initResourceUpkeep( num_users ),

			points: board.initializePlayerPoints( num_users ),
			players: board.createPlayerOrder( user_ids ),
			round: 0,
			phase: cons.PHS_PLACING,
			phaseDone: board.initializePhaseDone( num_users ),
			turn: 0,
			secondmines: false,
			board: board.initializeBoard( num_users )
		};

		return newGame;
	};

	module.exports.resolveAction = function( action, gameInfo ) {
		// This will be a switch for all different action types.
		switch (action.actiontype) {
			case cons.ACT_LOADED_ASSETS:
				return actions.resolveLoadingDone( action, gameInfo.game );
			case cons.ACT_TURN_DONE:
				return actions.resolveTurnDone( action, gameInfo.game );
			case cons.ACT_PLACE:
			case cons.ACT_VIEWED_MISSIONS:
			case cons.ACT_BUILD:
			case cons.ACT_RECRUIT:
			case cons.ACT_RETIRE:
			case cons.ACT_REMOVE:
			case cons.ACT_COLLECT_RESOURCES:
			case cons.ACT_PAY_UPKEEP:
				return actions.resolveGameAction( action, gameInfo.game );
			default:
				return false;
		}
	};

}());

var initPlayerResources = function( num_users ) {
	var resources = [];

	for ( var i = 0; i < num_users; i++ ){

		resources.push( {} );

		resources[i][cons.RES_METAL] = 7;
		resources[i][cons.RES_WATER] = 7;
		resources[i][cons.RES_FUEL] = 7;
		resources[i][cons.RES_FOOD] = 7;
	}
	
	return resources;
};

var initResourceCollect = function( num_users ){
	var resourceCollect = [];
	for (var i = 0; i < num_users; i++) {
		resourceCollect.push( [0, 0, 0, 0] );
	}
	return resourceCollect;
};

var initResourceUpkeep = function( num_users ){
	var resourceUpkeep = [];
	for (var i = 0; i < num_users; i++) {
		resourceUpkeep.push( [0, 0, 0, 0] );
	}
	return resourceUpkeep;
};