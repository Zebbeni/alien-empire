var cons = require('./server_constants');
var helpers = require('./game_helpers');
var staging = require('./server_staging');

/**
 * This is a module to contain all login, logout, disconnect and other 
 * functions related to user connections and related messages
 */

var login = function(socket, io, users, messages, gamesInfo, name, fn) {
	socket.join('lobby');

	fn('received login');

	var is_existing_user = false;
	var is_logged_in = false; // set to true if user is already logged in
	var newUser = null;

	// If a user name already exists update that users' status to ONLINE
	for (var u = 0; u < users.length; u++) {
		if (users[u].name == name) {

			// check if user already logged in
			if(users[u].status != cons.USR_OFFLINE) {
				is_logged_in = true;
			}
			else {
				// set socket's userid only if not already logged in
				socket.userid = u;
			}

			users[u].status = cons.USR_ONLINE;

			newUser = users[u];

			is_existing_user = true;
			existing_user_id = u;

			break;
		}
	}

	if (is_logged_in) {
		socket.emit('login failed already logged in', socket.name);
	}
	else {

		socket.name = name;

		// Otherwise create a new one and increment num_users
		if (!is_existing_user) {

			socket.userid = users.length;

			newUser = {
						userid: socket.userid,
						name: name,
						status: 1, // 0: OFFLINE, 1: LOBBY, 2: STAGING
						gameid: null // the game id the user is in
					};

			users.push(newUser);
		}

		var newMsg = helpers.addLobbyMessage( messages, 
											  cons.MSG_SERVER, 
											  name + " joined the room");

		socket.emit('login success', users, socket.userid, socket.name, 
						newMsg, gamesInfo, function(data) { 
												// debug(data); 
											}
		);

		socket.broadcast.to('lobby').emit('user login', users, newMsg);

		if (is_existing_user) {
			gameid = helpers.findGameToReconnect(existing_user_id, gamesInfo);
			if ( gameid != -1 ) {
				gameInfo = gamesInfo[gameid];
				console.log(gameInfo);
				socket.join( gameInfo.room );
				socket.emit('reconnect', gameInfo);
				var newMsg = helpers.addGameMessage( gamesInfo[gameid],
													 cons.MSG_SERVER,
													 name + " reconnected");
				io.in(gameInfo.room).emit(
									'room user reconnected', 
									newMsg );
			}
		}
	}
};

var logout = function(socket, users, messages, fn){
	var username = socket.name;

	fn('true');

	users[socket.userid].status = cons.USR_OFFLINE; // 0: OFFLINE

	socket.leave('lobby');

	var newMsg = helpers.addLobbyMessage( messages, 
										  cons.MSG_SERVER, 
										  username + " left the room" );

	socket.emit('leave lobby', function(data){ });
	socket.broadcast.to('lobby').emit('user logout', users, newMsg);
};

var disconnect = function(socket, io, users, messages, gamesInfo) {
	// if user hasn't already logged out
	if (socket.userid != undefined && users[socket.userid].status != cons.USR_OFFLINE){

		var username = socket.name;
		users[socket.userid].status = cons.USR_OFFLINE; // 0: OFFLINE

		var newMsg = helpers.addLobbyMessage( messages, 
											  cons.MSG_SERVER, 
											  username + " left the room" );

		io.in('lobby').emit('user logout', users, newMsg);

		// extra loose ends to tie up if user was in a game
		var gameid = users[socket.userid].gameid
		
		if ( gameid != null ) {
			var gameInfo = gamesInfo[gameid];

			// if game is still in staging, remove user from game and alert
			if (gameInfo.status == cons.GAME_STAGING) {

				staging.removeUserFromStaging( gamesInfo[gameid], 
											   users[socket.userid] );
				staging.removePlayerFromReady( gamesInfo[gameid], 
											   socket.userid);

				var newMsg = helpers.addGameMessage( gamesInfo[gameid], 
													 cons.MSG_SERVER,
													 username + " left the game");

				gameInfo = gamesInfo[gameid];

				socket.emit('self left game staging', gameInfo);
				io.in('lobby').emit('user left game', gameInfo);
				io.in(gameInfo.room).emit(
									'room user left staging', 
									gameInfo.players, 
									newMsg, 
									gameInfo.ready);
			}

			// otherwise, if game running, allow user to reconnect
			else if (gameInfo.status == cons.GAME_PROGRESS) {
				// in the meantime, alert users that one player is gone

				var newMsg = helpers.addGameMessage( gamesInfo[gameid],
													 cons.MSG_SERVER,
													 username + " disconnected");
				io.in(gameInfo.room).emit(
									'room user left game', 
									newMsg );
			}
		}
	}
};

(function() { 

	module.exports = {
		login: login,
		logout: logout,
		disconnect: disconnect
	}

}());