"use strict";

// var debug=require('debug')('app');
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/client'));
var server = require('http').createServer(app);
var io = require('./node_modules/socket.io').listen(server);

var gamesInfo = [];
var users = [];
var messages = []; // very possible we don't need this

io.sockets.on('connection', function(socket) {

    socket.on('login', function(name, fn) {

        socket.join('lobby');

        fn('received login');
        socket.name = name;

        var is_existing_user = false;
        var newUser = null;

        // If a user name already exists update that users' status to ONLINE
        for (var u = 0; u < users.length; u++) {
            if (users[u].name == socket.name) {

                socket.userid = u;
                users[u].status = 1;

                newUser = users[u];

                is_existing_user = true;

                break;
            }
        }

        // Otherwise create a new one and increment num_users
        if (!is_existing_user) {

            socket.userid = users.length;

            newUser = {
                        userid: socket.userid,
                        name: socket.name,
                        status: 1, // 0: OFFLINE, 1: LOBBY, 2: STAGING
                        gameid: null // the game id the user is in
                    };
    
            users.push(newUser);

        }

        var newMsg = {
                        id: -1, // -1 indicates a server message
                        message: name + " joined the room"
                    };

        messages.push( newMsg );

        socket.emit('login success', users, socket.userid, socket.name, 
                        newMsg, gamesInfo, function(data) { 
                                                // debug(data); 
                                            }
        );

        socket.broadcast.emit('user login', users, newMsg);
    });

    socket.on('logout', function(fn){
        var username = socket.name;
        fn('true');

        users[socket.userid].status = 0; // 0: OFFLINE

        socket.emit('leave lobby', function(data){
            // debug(data);
        });

        var newMsg = {
                        id: -1, // -1 indicates a server message
                        message: username + " left the room"
                    };

        messages.push( newMsg );
        socket.broadcast.emit('user logout', users, newMsg);
    });

    socket.on('send chat message', function(msg, fn) {
        fn('true');

        var newMsg = {
                        id: socket.userid,
                        message: msg
                    };

        messages.push(newMsg);

        socket.emit('new chat message', newMsg, function(data){
            // debug(data);
        });
        socket.broadcast.emit('new chat message', newMsg);
    });

    socket.on('send staging message', function(msg, fn) {
        fn('true');
        var gameid = users[socket.userid].gameid;
        var gameInfo = gamesInfo[gameid];

        var newMsg = {
                        id: socket.userid,
                        message: msg
                    };

        gamesInfo[gameid].messages.push(newMsg);

        socket.emit('room new staging message', newMsg);
        socket.broadcast.to(gameInfo.room).emit('room new staging message', newMsg);
    });

    socket.on('create game', function() {

        var roomId = 'game' + gamesInfo.length;
        var gameInfo = {
                        gameid: gamesInfo.length,
                        status: 1, // 0: CLOSED, 1: STAGING: 2: INGAME
                        players: [],
                        ready: [],
                        room: roomId,
                        messages: []
                    };

        gamesInfo.push(gameInfo);

        addUserToGame( gameInfo, socket.userid );

        socket.leave('lobby');
        socket.join( roomId );

        // emit a different function to the socket who created the game
        // as they are also joining it
        socket.emit('self joined game', gameInfo);
        socket.broadcast.emit('new game added', gameInfo);
    });

    socket.on('join game', function(gameid, fn) {

        var current_room = 'lobby';
        var gameInfo = gamesInfo[gameid];

        if ( gameInfo.players.indexOf(socket.userid) === -1 && gameInfo.players.length < 4)
        {
            addUserToGame( gameInfo, socket.userid);

            socket.leave('lobby');
            socket.join( gameInfo.room );
            
            var username = users[socket.userid].name;

            var newMsg = {
                            id: -1, // -1 indicates a server message
                            message: username + " joined the game"
                        };

            gamesInfo[gameid].messages.push(newMsg);

            socket.emit('self joined game', gameInfo);
            socket.broadcast.to(gameInfo.room).emit('room user joined staging', gameInfo.players, newMsg );
            socket.broadcast.emit('user joined game', gameInfo);

            fn('true');
        }
        else {
            fn('false');
        }
    });

    socket.on('ready game staging', function(fn) {
        var gameid = users[socket.userid].gameid;
        var returnValue = addPlayerToReady(gameid, socket.userid);

        fn(returnValue);

        socket.emit('room user ready staging', gamesInfo[gameid].ready);
        socket.broadcast.to(gamesInfo[gameid].room).emit(
                                            'room user ready staging', 
                                            gamesInfo[gameid].ready );
    });

    socket.on('leave game staging', function(gameid) {
        var gameInfo = gamesInfo[gameid];

        removeUserFromGame(gameInfo, socket.userid);

        removePlayerFromReady(gameid, socket.userid);

        socket.leave(gameInfo.room);
        socket.join('lobby');

        var username = users[socket.userid].name;

        var newMsg = {
                        id: -1, // -1 indicates a server message
                        message: username + " left the game"
                    };

        gamesInfo[gameid].messages.push(newMsg);

        socket.emit('self left game staging', gameInfo);
        socket.broadcast.to(gameInfo.room).emit(
                                            'room user left staging',
                                            gamesInfo[gameid].players, 
                                            newMsg, 
                                            gamesInfo[gameid].ready);
        socket.broadcast.emit('user left game', gameInfo);
    });

    socket.on('disconnect', function(){

        // if user hasn't already logged out
        if (users[socket.userid].status != 0){

            var username = socket.name;
            users[socket.userid].status = 0; // 0: OFFLINE

            var newMsg = {
                            id: -1, // -1 indicates a server message
                            message: username + " left the room"
                        };

            messages.push( newMsg );
            socket.broadcast.emit('user logout', users, newMsg);

            // extra loose ends to tie up if user was in a game
            var gameid = users[socket.userid].gameid
            
            if ( gameid != null ) {
                var gameInfo = gamesInfo[gameid];

                // if game is still in staging, remove user from game and alert
                if (gameInfo.status == 1) {

                    removeUserFromGame(gameInfo, socket.userid);
                    removePlayerFromReady(gameid, socket.userid);

                    newMsg = {
                        id: -1, // -1 indicates a server message
                        message: username + " left the game"
                    };

                    gamesInfo[gameid].messages.push(newMsg);

                    gameInfo = gamesInfo[gameid];

                    socket.emit('self left game staging', gameInfo);
                    socket.broadcast.to(gameInfo.room).emit(
                                                'room user left staging', 
                                                gameInfo.players, 
                                                newMsg, 
                                                gameInfo.ready);
                    socket.broadcast.emit('user left game', gameInfo);
                }

                // otherwise, if game running, allow user to reconnect
                else if (gameInfo.status == 2) {
                    // in the meantime, alert users that one player is gone
                }
            }
        }
    });
});

var addUserToGame = function(gameInfo, userid) {
    var gameid = gameInfo.gameid;

    // set this user's gameid to the game they just joined
    users[userid].gameid = gameInfo.gameid;

    // update gameInfo with new player id
    gameInfo.players.push(userid);

    // update gamesInfo
    gamesInfo[gameid] = gameInfo;
};

var addPlayerToReady = function(gameid, userid) {

    var gameInfo = gamesInfo[gameid];
    var index = gameInfo.ready.indexOf(userid);

    if ( index == -1 ){
        gamesInfo[gameid].ready.push(userid);
        return true;
    }
    return false;
};

var removeUserFromGame = function(gameInfo, userid) {
    var gameid = gameInfo.gameid;
    var index = gameInfo.players.indexOf(userid);

    if (index != -1) {

        gameInfo.players.splice(index, 1);

        if (gameInfo.players.length == 0) {
            gameInfo.status = 0; // 0: CLOSED, 1: STAGING: 2: INGAME
        }

        gamesInfo[gameid] = gameInfo;
    }
    users[userid].gameid = null;
};

var removePlayerFromReady = function(gameid, userid) {
    var gameInfo = gamesInfo[gameid];
    var index = gameInfo.ready.indexOf(userid);

    if ( index != -1 ) {
        gamesInfo[gameid].ready.splice(index, 1);
    }
};

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
