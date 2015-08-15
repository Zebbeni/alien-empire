"use strict";

var debug=require('debug')('app');
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/client'));
var server = require('http').createServer(app);
var io = require('./node_modules/socket.io').listen(server);

var games = [];
var users = [];
var messages = [];

io.sockets.on('connection', function(client) {

    client.on('login', function(name, fn) {

        client.join('lobby');

        fn('received login');
        client.name = name;

        var is_existing_user = false;

        for (var u = 0; u < users.length; u++) {
            // If user name already exists in users, update that users' status to ONLINE
            // (we should REALLY have a password for this)
            if (users[u].name == client.name) {

                client.id = u;
                users[u].status = 1;

                is_existing_user = true;

                // break;
            }
        }

        if (!is_existing_user) {
            // Otherwise, if no user found with that name, create a new one and increment num_users
            
            client.id = users.length;

            users.push(
                {
                    name: client.name,
                    status: 1 // 0: OFFLINE, 1: ONLINE, 2: INGAME (make these constants)
                });
        }

        messages.push(
            {
                id: -1, // -1 indicates a server message
                message: name + " joined the room"
            });

        client.emit('login success', users, client.id, client.name, messages, games, function(data){
            // debug(data);
        });

        client.broadcast.to('lobby').emit('user login', users, messages);
    });

    client.on('logout', function(fn){
        var username = client.name;

        // delete(users[client.id]); // old way
        users[client.id].status = 0; // 0: OFFLINE

        client.emit('leave lobby', function(data){
            // debug(data);
        });

        messages.push( 
            {
                id: -1, // -1 indicates a server message
                message: username + " left the room"
            });
        client.broadcast.to('lobby').emit('user logout', users, messages);
    });

    client.on('send chat message', function(msg, fn) {
        fn('true');
        messages.push(
            {
                id: client.id,
                message: msg
            });

        client.emit('new chat message', messages, function(data){
            // debug(data);
        });
        client.broadcast.to('lobby').emit('new chat message', messages);
    });

    client.on('create game', function(fn) {

        fn('true');

        var roomId = 'game' + games.length;

        games.push(
            {
                status: "staging",
                players: [client.id],
                room: roomId
            });

        client.leave('lobby');
        client.join( roomId );

        // emit a different function to the client who created the game
        // as they are also joining it
        client.emit('new game added', games);
        client.broadcast.to('lobby').emit('new game added', games);
    });

    client.on('join game', function(gameId, fn) {
        var game = games[gameId];

        client.leave('lobby');
        client.join( game.room );

        if ( game.players.indexOf(client.id) === -1 && game.players.length < 4)
        {
            game.players.push(client.id);

            client.emit('user joined game', games);
            client.broadcast.to('lobby').emit('user joined game', games);
            fn('true');
        }
        else {
            fn('false');
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
