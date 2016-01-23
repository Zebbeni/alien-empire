var cons = require('./server_constants');

var playerHasStruct = function( player, planetid, objecttype, game ) {
	
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

/**
 * addGameMessage appends a new message object to a gameInfo object
 * @msg is either a string or an action object
 */
var addGameMessage = function(gameInfo, userid, msg) {
    var newMsg = {
                    id: userid, // when userid is MSG_ACTION...
                    message: msg // msg is an action, client will show in english
                };

    gameInfo.messages.push(newMsg);
    return newMsg;
};

/**
 * addResourcePackage appends a new resourcePackage object to the game
 * resourcePackages object for the corect player, defaults collected status
 * to false. Expects array of all resource types with numbers to add
 */
var addResourcePackage = function(game, player, pkgtype, resources, message) {
	var resourcePackage = {
							pkgtype: pkgtype,
							collected: false,
							resources: resources,
							message: message,
							isnew: true
						};
	game.resourcePackages[player].push( resourcePackage );
};

var addGameActionMessage = function(gameInfo, userid, action) {

	var newMsg = addGameMessage( gameInfo, 
								 cons.MSG_ACTION, 
								 action );
	return newMsg;
};

var addLobbyMessage = function(messages, userid, msg) {
    var newMsg = {
                    id: userid, // -1 indicates a server message
                    message: msg
                };

    messages.push(newMsg);
    return newMsg;
};

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

var clearPhaseDone = function( game ){
	for (var i = 0; i < game.phaseDone.length; i++) {
		game.phaseDone[i] = false;
	}
};

var resetMissionSpied = function( game ) {
	for ( var i = 0; i < game.missionSpied.length; i++ ){
		game.missionSpied[i] = null;
	}
};

(function() {
	module.exports = {
		playerHasStruct: playerHasStruct,
		addGameMessage: addGameMessage,
		addGameActionMessage: addGameActionMessage,
		addResourcePackage: addResourcePackage,
		addLobbyMessage: addLobbyMessage,
		clearPhaseDone: clearPhaseDone,
		resetMissionSpied: resetMissionSpied,
	}
}());