/*
	Copyright 2015, Google, Inc. 
 Licensed under the Apache License, Version 2.0 (the "License"); 
 you may not use this file except in compliance with the License. 
 You may obtain a copy of the License at 
  
    http://www.apache.org/licenses/LICENSE-2.0 
  
 Unless required by applicable law or agreed to in writing, software 
 distributed under the License is distributed on an "AS IS" BASIS, 
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 See the License for the specific language governing permissions and 
 limitations under the License.
*/
"use strict";

var debug=require('debug')('app');
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/client'));
var server = require('http').createServer(app);
var io = require('./node_modules/socket.io').listen(server);

var games = new Object();
var users = new Object();
var messages = new Object();

var num_users = 0;
var num_messages = 0;
var num_games = 0;

io.on('connection', function(client) {

    client.on('login', function(name, fn) {
        fn('received login');
        num_users += 1;

        client.name = name;

        var is_existing_user = false;

        for (var u in users) {
            // If user name already exists in users, update that users' status to ONLINE 
            // (we should REALLY have a password for this)
            if (users[u].name == client.name) {

                client.id = u;

                users[u].status = 1;
                is_existing_user = true;

                break;
            }
        }

        if (!is_existing_user) {
            // Otherwise, if no user found with that name, create a new one and increment num_users
            num_users += 1;
            client.id = num_users;

            users[num_users] = {
                name: client.name,
                status: 1 // 0: OFFLINE, 1: ONLINE, 2: INGAME (make these constants)
            }
        }

        debug('users on server: %s', users);
        debug('name of new person: %s', name);

        num_messages += 1;
        messages[num_messages] = {
            id: 0,
            message: name + " joined the room"
        };

        client.emit('login success', users, client.id, client.name, messages, games, function(data){
            debug(data);
        });
        client.broadcast.emit('user login', users, messages);
    });

    client.on('logout', function(fn){
        var username = client.name;

        // delete(users[client.id]); // old way
        users[client.id].status = 0; // 0: OFFLINE

        debug('users on server: %s', users);
        debug('name of person leaving: %s', client.name);

        client.emit('leave lobby', function(data){
            debug(data);
        });

        num_messages += 1;
        messages[num_messages] = {
            id: 0,
            message: username + " left the room"
        };
        client.broadcast.emit('user logout', users, messages);
    });

    client.on('send chat message', function(msg, fn) {
        fn('true');
        num_messages += 1;
        messages[num_messages] = {
            id: client.id,
            message: msg
        };
        debug('# messages on server: %s', num_messages);
        client.emit('new chat message', messages, function(data){
            debug(data);
        });
        client.broadcast.emit('new chat message', messages);
    }); 

    client.on('create game', function(fn) {

        fn('true');

        var game = new Object();
        num_games += 1;

        games[num_games] = {
            status: "staging",
            players: [client.id]
        };

        //TODO emit a different function to the client who created the game
        // as they are also joining it
        client.emit('new game added', games);
        client.broadcast.emit('new game added', games);
    });

    client.on('join game', function(gameId, fn) {
        var game = games[gameId];

        debug("attempting to join game ", gameId);
        if ( game.players.indexOf(client.id) == -1 && game.players.length < 4)
        {
            game.players.push(client.id);

            client.emit('user joined game', games);
            client.broadcast.emit('user joined game', games);
            fn('true');
        }

        fn('false');
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
