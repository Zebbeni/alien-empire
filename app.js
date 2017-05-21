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

		console.log(name + " logged in");
		users_server.login(socket, io, users, messages, gamesInfo, name, fn);

	});

	socket.on('logout', function(fn){

		console.log(socket.name + " logged out");
		users_server.logout(socket, users, messages, fn);

	});

	socket.on('disconnect', function(){

		console.log(socket.name + " disconnected");
		users_server.disconnect(socket, io, users, messages, gamesInfo);

	});

	socket.on('send chat message', function(msg, fn) {
		fn('true');

		console.log(socket.name + " sent a lobby message: " + msg);
		var newMsg = helpers.addLobbyMessage( messages, 
											  socket.userid, 
											  msg);

		io.in('lobby').emit('new chat message', newMsg);
	});

	socket.on('create game', function() {

		console.log(socket.name + " created a game");
		staging.userCreateGame(socket, io, users, gamesInfo);

	});

	socket.on('join game', function(gameid, fn) {

		console.log(socket.name + " joined a game");
		staging.userJoinGame(socket, users, gamesInfo, gameid, fn);

	});

	socket.on('ready game staging', function(fn) {

		console.log(socket.name + " clicked staging ready");
		staging.setUserReady(socket, io, users, gamesInfo, fn);

	});

	socket.on('leave game staging', function(gameid) {

		console.log(socket.name + " left staging");
		staging.userLeaveStaging(socket, io, users, gamesInfo, gameid);

	});

	socket.on('request num players staging', function( gameid, num ){

		console.log(socket.name + " changed num players to " + num);
		staging.userRequestNumPlayersStaging( socket, io, users, gamesInfo, gameid, num );
	
	});

	socket.on('request num points staging', function( gameid, num ){

		console.log(socket.name + " changed num points to " + num);
		staging.userRequestNumPointsStaging( socket, io, users, gamesInfo, gameid, num );
	
	});

	socket.on('return game to lobby', function( gameid ) {

		console.log(socket.name + " returned from game to lobby");
		staging.userReturnGameToLobby( socket, io, users, gamesInfo, gameid );

	});

	/**
	 * This function serves as the channel through which all user actions
	 * and gameInfo references are passed to the game_server module and 
	 * applied to the game objects
	 */
	socket.on('do game action', function(gameid, action) {
		var response = game_server.resolveAction( action, gamesInfo[gameid] );

		console.log(socket.name + " did a game action");
		if ( response.to == cons.EVENT_ONE ) {
			socket.emit(response.evnt, response.content);
		}
		else if ( response.to == cons.EVENT_ALL ) {
			var newMsg = helpers.addGameActionMessage( gamesInfo[gameid],
													   socket.userid,
													   action );
			io.in(gamesInfo[gameid].room).emit(response.evnt, response.content, newMsg);
		}
	});

	socket.on('send game message', function(msg, fn) {
		fn('true');

		console.log(socket.name + " sent a game message: " + msg);
		var gameid = users[socket.userid].gameid;
		var gameInfo = gamesInfo[gameid];

		var newMsg = helpers.addGameMessage( gamesInfo[gameid], 
											 socket.userid, 
											 msg);

		io.in(gameInfo.room).emit('new game message', newMsg);
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
