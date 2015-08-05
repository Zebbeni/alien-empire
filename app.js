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

/* Include the app engine handlers to respond to start, stop, and health checks. */
app.use(require('./lib/appengine-handlers'));

io.on('connection', function(client) {
    client.on('login', function(name, fn) {
        
        client.name = name;

        fn('received login');
    	num_users += 1;
        users[num_users] = name;
        debug('users on server: %s', users);
        debug('name of new person: %s', name);
        client.emit('enter lobby', users, messages, function(data){
            debug(data);
        });
        client.broadcast.emit('user login', users);
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

// [START server]
/* Start the server */
server.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
// [END server]
