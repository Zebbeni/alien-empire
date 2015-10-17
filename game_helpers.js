var cons = require('./server_constants');

(function() {
	module.exports.playerHasStruct = function( player, planetid, objecttype, game ) {
		
		var structExists = false;

		switch (objecttype) {

			case cons.OBJ_MINE:
			case cons.OBJ_FACTORY:
			case cons.OBJ_EMBASSY:

				return playerHasResourceStruct( player, planetid, objecttype, game );

			case cons.OBJ_BASE:

				var base = game.board.planets[planetid].base;
				return ( base && base.player == player );

			default:
				return false;
		}

		return false;
	};

	module.exports.addNewServerMessage = function(gameInfo, msg) {
	    var newMsg = {
	                    id: -1, // -1 indicates a server message
	                    message: msg
	                };

	    gameInfo.messages.push(newMsg);
	    return newMsg;
	};

}());

var playerHasResourceStruct = function( player, planetid, objecttype, game ) {

	var planet = game.board.planets[planetid];

	for ( var i = 0; i < planet.resources.length; i++ ){
		var struct = planet.resources[i].structure;
		if ( struct && struct.player == player && struct.kind == objecttype ) {
			return true;
		}
	}
	return false;
};