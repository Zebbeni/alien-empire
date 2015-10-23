"use strict";

// var debug=require('debug')('app');
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/client'));
var server = require('http').createServer(app);
var io = require('./node_modules/socket.io').listen(server);

var game_server = require('./game_server');
var users_server = require('./users_server');
var staging = require('./server_staging');
var cons = require('./server_constants');
var helpers = require('./game_helpers');

var gamesInfo = [];
var users = [];
var messages = []; // very possible we don't need this

io.sockets.on('connection', function(socket) {

	socket.on('login', function(name, fn) {

		users_server.login(socket, users, messages, gamesInfo, name, fn);

	});

	socket.on('logout', function(fn){

		users_server.logout(socket, users, messages, fn);

	});

	socket.on('disconnect', function(){

		users_server.disconnect(socket, io, users, messages, gamesInfo);

	});

	socket.on('send chat message', function(msg, fn) {
		fn('true');

		var newMsg = helpers.addLobbyMessage( messages, 
											  socket.userid, 
											  msg);

		io.in('lobby').emit('new chat message', newMsg);
	});

	socket.on('send game message', function(msg, fn) {
		fn('true');
		var gameid = users[socket.userid].gameid;
		var gameInfo = gamesInfo[gameid];

		var newMsg = helpers.addGameMessage( gamesInfo[gameid], 
											 socket.userid, 
											 msg);

		io.in(gameInfo.room).emit('new game message', newMsg);
	});

	socket.on('create game', function() {

		var roomId = 'game' + gamesInfo.length;
		var gameid = gamesInfo.length;
		var gameInfo = {
						gameid: gameid,
						status: 1, // 0: CLOSED, 1: STAGING: 2: INGAME
						players: [],
						ready: [],
						room: roomId,
						messages: []
					};

		gamesInfo.push(gameInfo);

		staging.addUserToGame( gamesInfo[gameid], users[socket.userid] );

		socket.join( roomId );

		// emit a different function to the socket who created the game
		// as they are also joining it
		socket.emit('self joined game', gameInfo);
		io.in('lobby').emit('new game added', gameInfo);
	});

	socket.on('join game', function(gameid, fn) {

		var gameInfo = gamesInfo[gameid];

		if ( gameInfo.players.indexOf(socket.userid) === -1 && gameInfo.players.length < 4)
		{
			staging.addUserToGame( gamesInfo[gameid], users[socket.userid] );

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
	});

	socket.on('ready game staging', function(fn) {
		var gameid = users[socket.userid].gameid;
		var returnValue = staging.addPlayerToReady(gamesInfo[gameid], socket.userid);

		fn(returnValue);

		io.in(gamesInfo[gameid].room).emit(
							'room user ready staging', 
							gamesInfo[gameid].ready);

		// START game if all players in staging are now ready
		if ( staging.allPlayersReady( gamesInfo[gameid] )) {

			gamesInfo[gameid].status = 2;

			gamesInfo[gameid].game = game_server.initializeGame( gamesInfo[gameid].players, gameid );

			io.in('lobby').emit('game starting', gamesInfo[gameid]);
			io.in(gamesInfo[gameid].room).emit('room game starting', 
												gamesInfo[gameid]);
		}
	});

	socket.on('leave game staging', function(gameid) {
		var gameInfo = gamesInfo[gameid];

		staging.removeUserFromStaging(gamesInfo[gameid], users[socket.userid]);
		staging.removePlayerFromReady(gamesInfo[gameid], socket.userid);

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
	});

	/**
	 * This function serves as the channel through which all user actions
	 * and gameInfo references are passed to the game_server module and 
	 * applied to the game objects
	 */
	socket.on('do game action', function(gameid, action) {
		var gameInfo = gamesInfo[gameid];
		var response = game_server.resolveAction( action, gameInfo );

		if ( response.to == cons.EVENT_ONE ) {
			socket.emit(response.evnt, response.content);
		}
		else if ( response.to == cons.EVENT_ALL ) {
			io.in(gameInfo.room).emit(response.evnt, response.content);
		}
	});

});

// [START hello_world]
/* Say hello! */
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

// [START server]
/* Start the server */
server.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
// [END server]
