var cons = require('./server_constants');
var game_server = require('./game_server');
var helpers = require('./game_helpers');

var addUserToGame = function(gameInfo, user) {

	// set this user's gameid to the game they just joined
	user.gameid = gameInfo.gameid;

	// update gameInfo with new player id
	gameInfo.players.push(user.userid);

};

var addPlayerToReady = function(gameInfo, userid) {
	var index = gameInfo.ready.indexOf(userid);

	if ( index == -1 ){
		gameInfo.ready.push(userid);
		return true;
	}
	return false;
};

var removeUserFromStaging = function(gameInfo, user) {
	var index = gameInfo.players.indexOf(user.userid);

	if (index != -1) {

		gameInfo.players.splice(index, 1);

		if (gameInfo.players.length == 0) {
			gameInfo.status = cons.GAME_CLOSED;
		}

	}
	user.gameid = null;
};

var removePlayerFromReady = function(gameInfo, userid) {
	var index = gameInfo.ready.indexOf(userid);

	if ( index != -1 ) {
		gameInfo.ready.splice(index, 1);
	}
};

var allPlayersReady = function(gameInfo) {
	var players = gameInfo.players;
	var ready = gameInfo.ready;
	// TODO: add a requestedPlayers option that the host
	// of the game can set. Only return true if
	// all players ready and all slots are filled
	return (players.length == ready.length);
};

var userCreateGame = function(socket, io, users, gamesInfo) {
	var roomId = 'game' + gamesInfo.length;
	var gameid = gamesInfo.length;
	var gameInfo = {
					gameid: gameid,
					status: 1, // 0: CLOSED, 1: STAGING: 2: INGAME
					players: [],
					ready: [],
					room: roomId,
					messages: [],
					requestedPlayers: 4 // 4 is default
				};

	gamesInfo.push(gameInfo);

	addUserToGame( gamesInfo[gameid], users[socket.userid] );

	socket.join( roomId );

	// emit a different function to the socket who created the game
	// as they are also joining it
	socket.emit('self joined game', gameInfo);
	io.in('lobby').emit('new game added', gameInfo);
	};

var userJoinGame = function(socket, users, gamesInfo, gameid, fn) {
	var gameInfo = gamesInfo[gameid];

	if ( gameInfo.players.indexOf(socket.userid) === -1 && gameInfo.players.length < 4)
	{
		addUserToGame( gamesInfo[gameid], users[socket.userid] );

		socket.join( gameInfo.room );
		
		var username = users[socket.userid].name;

		var newMsg = helpers.addGameMessage( gamesInfo[gameid], 
											 cons.MSG_SERVER, 
											 username + " joined the game");

		socket.emit('self joined game', gameInfo);
		socket.broadcast.to(gameInfo.room).emit(
										'room user joined staging', 
										gameInfo.players, 
										newMsg );

		socket.in('lobby').emit('user joined game', gameInfo);

		fn('true');
	}
	else {
		fn('false');
	}
};

var setUserReady = function(socket, io, users, gamesInfo, fn) {
	var gameid = users[socket.userid].gameid;
	var returnValue = addPlayerToReady(gamesInfo[gameid], socket.userid);

	fn(returnValue);

	io.in(gamesInfo[gameid].room).emit(
						'room user ready staging', 
						gamesInfo[gameid].ready);

	// START game if all players in staging are now ready
	if ( allPlayersReady( gamesInfo[gameid] )) {

		gamesInfo[gameid].status = 2;
		gamesInfo[gameid].game = game_server.initializeGame( gamesInfo[gameid].players, gameid );

		io.in('lobby').emit('game starting', gamesInfo[gameid]);
		io.in(gamesInfo[gameid].room).emit('room game starting', 
											gamesInfo[gameid]);
	}
};

var userLeaveStaging = function(socket, io, users, gamesInfo, gameid) {
	var gameInfo = gamesInfo[gameid];

	removeUserFromStaging(gamesInfo[gameid], users[socket.userid]);
	removePlayerFromReady(gamesInfo[gameid], socket.userid);

	socket.leave(gameInfo.room);

	var username = users[socket.userid].name;

	var newMsg = helpers.addGameMessage( gamesInfo[gameid], 
										 cons.MSG_SERVER,
										 username + " left the game");

	socket.emit('self left game staging', gameInfo);
	socket.broadcast.to(gameInfo.room).emit(
										'room user left staging',
										gamesInfo[gameid].players, 
										newMsg,
										gamesInfo[gameid].ready);
	io.in('lobby').emit('user left game', gameInfo);
};

(function() {

	module.exports = {
		addUserToGame: addUserToGame,
		addPlayerToReady: addPlayerToReady,
		removeUserFromStaging: removeUserFromStaging,
		removePlayerFromReady: removePlayerFromReady,
		allPlayersReady: allPlayersReady,
		userCreateGame: userCreateGame,
		userJoinGame: userJoinGame,
		setUserReady: setUserReady,
		userLeaveStaging: userLeaveStaging
	};

}());