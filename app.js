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

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/node_modules'));
var server = require('http').createServer(app);
var io = require('./node_modules/socket.io').listen(server);

var users = new Object();
var num_users = 0;

io.on('connection', function(client) {
    client.emit('messages');

    client.on('login', function(name) {
        console.log(name, " has logged in");
    	num_users += 1;
    	users[num_users] = name;
    	client.id_num = num_users;
    	client.broadcast.emit('user login', users);
    	client.emit('user login', users);
    });

    client.on('logoff', function() {
    	delete users[ client.id_num ];
    	client.broadcast.emit('user logoff', users);
    	client.emit('user logoff', users);
    });
});

/* Send index.html to client*/
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

/* Start the server */
server.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
// [END server]
