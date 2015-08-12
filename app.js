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

var users = new Object();
var messages = new Object();
var num_users = 0;
var num_messages = 0;

io.on('connection', function(client) {
    client.on('login', function(name, fn) {
        fn('received login');
        num_users += 1;

        client.name = name;
        client.id = num_users;

        users[num_users] = name;

        debug('users on server: %s', users);
        debug('name of new person: %s', name);

        num_messages += 1;
        messages[num_messages] = {
            name: "Server",
            message: name + " has joined the room"
        };

        client.emit('enter lobby', users, messages, function(data){
            debug(data);
        });
        client.broadcast.emit('user login', users, messages);
    });

    client.on('logout', function(fn){
        var username = client.name;
        delete(users[client.id]);

        debug('users on server: %s', users);
        debug('name of person leaving: %s', client.name);

        client.emit('leave lobby', function(data){
            debug(data);
        });

        num_messages += 1;
        messages[num_messages] = {
            name: "Server",
            message: username + " has left the room"
        };
        client.broadcast.emit('user logout', users, messages);
    });

    client.on('send chat message', function(msg, fn) {
        fn('received chat message');
        num_messages += 1;
        messages[num_messages] = {
            name: client.name,
            message: msg
        };
        debug('# messages on server: %s', num_messages);
        client.emit('new chat message', messages, function(data){
            debug(data);
        });
        client.broadcast.emit('new chat message', messages);
    }); 
});

// [START hello_world]
/* Say hello! */
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
// [END hello_world]

// var port = 8080;
// app.listen(port);

// [START server]
/* Start the server */
server.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
// [END server]
