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
	var isnew = true;
	var agent_pkgs = [cons.PKG_ENVOY, cons.PKG_MINER, cons.PKG_SPY, cons.PKG_SMUGGLER, cons.PKG_COLLECT];
	if ( agent_pkgs.indexOf(pkgtype) != -1 ){
		isnew = false; // set this so ui will draw the package (don't auto-collect)
	}
	var resourcePackage = {
							pkgtype: pkgtype,
							collected: false,
							resources: resources,
							message: message,
							isnew: isnew
						};
	// automatically set collected to true for build packages. This is because
	// build packages are only added for the animation. Resources are deducted
	// when the build action is taken					
	if ( pkgtype == cons.PKG_BUILD ){
		resourcePackage.collected = true;
	}
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

var findGameToReconnect = function(u, gamesInfo){
	for ( var i = 0; i < gamesInfo.length; i++ ){
		gameInfo = gamesInfo[i];
		if ( gameInfo.ready.indexOf(u) != -1 && 
			 gameInfo.status == cons.GAME_PROGRESS ) {
			
			return i;
		}
	}
	return -1;
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
		findGameToReconnect: findGameToReconnect,
	}
}());