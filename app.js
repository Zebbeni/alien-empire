"use strict";

// var debug=require('debug')('app');
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/client'));
var server = require('http').createServer(app);
var io = require('./node_modules/socket.io').listen(server);

var games = [];
var users = [];
var messages = [];

io.sockets.on('connection', function(socket) {

    socket.on('login', function(name, fn) {

        socket.join('lobby');

        fn('received login');
        socket.name = name;

        var is_existing_user = false;

        for (var u = 0; u < users.length; u++) {
            // If user name already exists in users, update that users' status to ONLINE
            // (we should REALLY have a password for this)
            if (users[u].name == socket.name) {

                socket.userid = u;
                users[u].status = 1;

                is_existing_user = true;

                break;
            }
        }

        if (!is_existing_user) {
            // Otherwise, if no user found with that name, create a new one and increment num_users
            
            socket.userid = users.length;

            users.push(
                {
                    name: socket.name,
                    status: 1 // 0: OFFLINE, 1: ONLINE, 2: INGAME (make these constants)
                });
        }

        messages.push(
            {
                id: -1, // -1 indicates a server message
                message: name + " joined the room"
            });

        socket.emit('login success', users, socket.userid, socket.name, messages, games, function(data){
            // debug(data);
        });

        socket.broadcast.to('lobby').emit('user login', users, messages);
    });

    socket.on('logout', function(fn){
        var username = socket.name;
        fn('true');

        users[socket.userid].status = 0; // 0: OFFLINE

        socket.emit('leave lobby', function(data){
            // debug(data);
        });

        messages.push( 
            {
                id: -1, // -1 indicates a server message
                message: username + " left the room"
            });
        socket.broadcast.to('lobby').emit('user logout', users, messages);
    });

    socket.on('send chat message', function(msg, fn) {
        fn('true');
        messages.push(
            {
                id: socket.userid,
                message: msg
            });

        socket.emit('new chat message', messages, function(data){
            // debug(data);
        });
        socket.broadcast.to('lobby').emit('new chat message', messages);
    });

    socket.on('create game', function(current_room) {

        var roomId = 'game' + games.length;
        var game = {
                        gameid: games.length,
                        status: "staging",
                        players: [socket.userid],
                        room: roomId
                    }

        games.push(game);

        socket.leave('lobby');
        socket.join( roomId );

        // emit a different function to the socket who created the game
        // as they are also joining it
        socket.emit('self joined game', games);
        socket.broadcast.to('lobby').emit('new game added', games);
    });

    socket.on('join game', function(gameId, fn) {

        var current_room = 'lobby';
        var game = games[gameId];

        if ( game.players.indexOf(socket.userid) === -1 && game.players.length < 4)
        {

            socket.leave('lobby');
            socket.join( game.room );

            game.players.push(socket.userid);

            socket.emit('self joined game', game);
            // TODO: [EFFICIENCY] don't send all game objects every time
            socket.broadcast.to('lobby').emit('user joined game', games);
            fn('true');
        }
        else {
            fn('false');
        }
    });

    // socket.on('leave game staging', function(gameid) {
    //     var game = games[gameid];
    //     var index = game.players.indexOf(socket.userid);
    //     if (index != -1) {
    //         game.players.splice(index, 1);
    //     }

    //     socket.leave(game.room);
    //     socket.join('lobby');

    //     socket.emit('self left game staging', game, users);
    //     socket.broadcast.to('lobby').emit('user to lobby from staging', game.gameid, game.players);
    //     socket.broadcast.to(game.room).emit('user left game staging', game.gameid, game.players);
    // });

    socket.on('disconnect', function(){

        // broadcast and update status if user hasn't already logged out

        if (users[socket.userid].status != 0){

            var username = socket.name;
            users[socket.userid].status = 0; // 0: OFFLINE

            messages.push( 
                {
                    id: -1, // -1 indicates a server message
                    message: username + " left the room"
                });

            socket.broadcast.to('lobby').emit('user logout', users, messages);
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
