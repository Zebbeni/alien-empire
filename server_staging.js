var cons = require('./server_constants');
var game_server = require('./game_server');
var helpers = require('./game_helpers');

var addUserToGame = function(gameInfo, user) {

	// set this user's gameid to the game they just joined
	user.gameid = gameInfo.gameid;

	// update gameInfo with new player id
	// Note: This will be negative if user is a computer player
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

var removeUserFromStaging = function(gameInfo, user, users) {
	var index = gameInfo.players.indexOf(user.userid);

	if (index != -1) {
		var numHumanPlayers = 0;
		gameInfo.players.splice(index, 1);
		for (var p = 0; p < gameInfo.players.length; p++) {
			var userId = gameInfo.players[p];
			if (!users[userId].isComputer) {
				numHumanPlayers += 1;
			}
		}
		if (numHumanPlayers == 0) {
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

var allRequestedHere = function(gameInfo){
	return gameInfo.players.length == gameInfo.requestedPlayers;
};

var userCreateGame = function(socket, io, users, gamesInfo) {
	var roomId = 'game' + gamesInfo.length;
	var gameid = gamesInfo.length;
	var gameInfo = {
					gameid: gameid,
					status: cons.GAME_STAGING, // 0: CLOSED, 1: STAGING: 2: PROGRESS
					players: [],
					ready: [],
					room: roomId,
					messages: [],
					requestedPlayers: 4, // 4 is default
					requestedPoints: 10 // 10 is default
				};



	gamesInfo.push(gameInfo);

	users[socket.userid].status = cons.USR_STAGING;

	addUserToGame( gamesInfo[gameid], users[socket.userid] );

	helpers.addGameMessage( gamesInfo[gameid],
							cons.MSG_SERVER,
							"Select the number of players who may join this game. Game begins when all players click Ready.");
	helpers.addGameMessage( gamesInfo[gameid],
							cons.MSG_SERVER,
							"------------------------------------");

	socket.join( roomId );

	// emit a different function to the socket who created the game
	// as they are also joining it
	socket.emit('self joined game', users, gameInfo);
	io.in('lobby').emit('new game added', users, gameInfo);
};

var userJoinGame = function(socket, users, gamesInfo, gameid, fn) {
	var gameInfo = gamesInfo[gameid];

	if ( gameInfo.players.indexOf(socket.userid) === -1 
		 && gameInfo.players.length < gameInfo.requestedPlayers )
	{
		addUserToGame( gamesInfo[gameid], users[socket.userid] );

		socket.join( gameInfo.room );

		users[socket.userid].status = cons.USR_STAGING;
		
		var username = users[socket.userid].name;

		var newMsg = helpers.addGameMessage( gamesInfo[gameid], 
											 cons.MSG_SERVER, 
											 username + " joined the game");

		socket.emit('self joined game', users, gameInfo);
		socket.broadcast.to(gameInfo.room).emit(
										'room user joined staging', 
										gameInfo.players, 
										newMsg );

		socket.in('lobby').emit('user joined game', users, gameInfo);

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

	users[socket.userid].status = cons.USR_INGAME;

	io.in(gamesInfo[gameid].room).emit(
						'room user ready staging', 
						gamesInfo[gameid].ready);

	// START game if all players in staging are now ready
	if ( allPlayersReady( gamesInfo[gameid] ) && allRequestedHere( gamesInfo[gameid]) ) {

		gamesInfo[gameid].status = cons.GAME_PROGRESS;
		gamesInfo[gameid].game = game_server.initializeGame( gamesInfo[gameid].players, gameid, gamesInfo[gameid].requestedPoints );

		io.in('lobby').emit('game starting', users, gamesInfo[gameid]);
		io.in(gamesInfo[gameid].room).emit('room game starting', 
											gamesInfo[gameid]);
	}
};

var userLeaveStaging = function(socket, io, users, gamesInfo, gameid) {
	var gameInfo = gamesInfo[gameid];

	removeUserFromStaging(gamesInfo[gameid], users[socket.userid], users);
	removePlayerFromReady(gamesInfo[gameid], socket.userid);

	socket.leave(gameInfo.room);

	users[socket.userid].status = cons.USR_ONLINE;

	var username = users[socket.userid].name;

	var newMsg = helpers.addGameMessage( gamesInfo[gameid], 
										 cons.MSG_SERVER,
										 username + " left the game");

	socket.emit('self left game staging', users, gameInfo);
	socket.broadcast.to(gameInfo.room).emit(
										'room user left staging',
										gamesInfo[gameid].players, 
										newMsg,
										gamesInfo[gameid].ready);
	io.in('lobby').emit('user left game', users, gameInfo);
};

var userAddNewComputerPlayer = function( socket, io, users, gamesInfo, gameid, users_server, messages ) {
    var gameInfo = gamesInfo[gameid];

    if (isHostUser(gameInfo, socket.userid, users)
		&& gameInfo.players.length < gameInfo.requestedPlayers
	) {

        var computerId = users_server.createNewComputerUser(users, cons.USR_STAGING, io, messages);
        addUserToGame( gamesInfo[gameid], users[computerId] );
        resetReady(gameInfo, users); // this will also set the new computer player to ready

        // create message
        var userName = users[socket.userid].name;
        var computerName = users[computerId].name;
        var newMsg = helpers.addGameMessage( gamesInfo[gameid],
            cons.MSG_SERVER,
            userName + " added a computer player, " + computerName);

        socket.emit('self joined game', users, gameInfo);
        socket.broadcast.to(gameInfo.room).emit(
            'room user joined staging',
            gameInfo.players,
            newMsg );
    }
};

var userRequestNumPlayersStaging = function( socket, io, users, gamesInfo, gameid, num ) {
	var gameInfo = gamesInfo[gameid];

	if (isHostUser(gameInfo, socket.userid, users)
		&& gameInfo.players.length <= num
		&& gameInfo.requestedPlayers != num ) {

		gameInfo.requestedPlayers = num;
		resetReady(gameInfo, users);

		var username = users[socket.userid].name;
		var newMsg = helpers.addGameMessage( gamesInfo[gameid],
											 cons.MSG_SERVER,
											 username 
											 + " changed player count to " 
											 + num);
		io.in(gamesInfo[gameid].room).emit('room requested players changed', 
											newMsg, 
											gamesInfo[gameid].requestedPlayers,
											gamesInfo[gameid].ready);
		io.in('lobby').emit('requested players changed', gameInfo);
	}
};

var resetReady = function(gameInfo, users) {
	gameInfo.ready = [];
	// automatically set computer users to ready.
	// just reset non-computer players
	for (var p = 0; p < gameInfo.players.length; p++) {
		var userId = gameInfo.players[p];
		if (users[userId].isComputer) {
			gameInfo.ready.push(userId);
		}
	}
};

// return true if userid is the host of this game
// ie. if player is the first indexed non-computer player
var isHostUser = function(gameInfo, userid, users) {
	for (var p = 0; p < gameInfo.players.length; p++) {
		var playerUserId = gameInfo.players[p];
		if (!users[playerUserId].isComputer) {
			return playerUserId == userid;
		}
	}
	// shouldn't ever hit this. If we do, somehow the user isn't listed as a player
	return false;
};

var userRequestNumPointsStaging = function( socket, io, users, gamesInfo, gameid, num ){
	var gameInfo = gamesInfo[gameid];

	if (isHostUser(gameInfo, socket.userid, users)
		&& gameInfo.requestedPoints != num ) {

		gameInfo.requestedPoints = num;
		resetReady(gamesInfo[gameid], users);

		var username = users[socket.userid].name;
		var newMsg = helpers.addGameMessage( gamesInfo[gameid],
											 cons.MSG_SERVER,
											 username 
											 + " changed points to win to " 
											 + num);
		io.in(gamesInfo[gameid].room).emit('room requested points changed', 
												newMsg, 
												gamesInfo[gameid].requestedPoints,
												gamesInfo[gameid].ready);
	}
};

var userReturnGameToLobby = function( socket, io, users, gamesInfo, gameid ){
	var gameInfo = gamesInfo[gameid];
	// we should keep track of users returning to the lobby 
	// and close the game when all gone

	users[socket.userid].status = cons.USR_ONLINE;

	io.in('lobby').emit('user left game', users, gameInfo);
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
		userLeaveStaging: userLeaveStaging,
        userAddNewComputerPlayer: userAddNewComputerPlayer,
		userRequestNumPlayersStaging: userRequestNumPlayersStaging,
		userRequestNumPointsStaging: userRequestNumPointsStaging,
		userReturnGameToLobby: userReturnGameToLobby
	};

}());