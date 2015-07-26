"use strict";

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/client'));
var server = require('http').createServer(app);
var io = require('./node_modules/socket.io').listen(server);

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/alien-empire-db';
// var url = 'mongodb://Zebbeni:wakkawakka1984$@apollo.modulusmongo.net:27017/heHuqy5b';

var users = {};
var num_users = 0;

//when server is created, populate users variable with users from database
MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        var collection = db.collection('users-db');
        collection.find().toArray( function(err, result ) {
            updateUsersFromDb(err, result);
            db.close();
        });
    }
});

io.on('connection', function(client) {
    client.emit('messages');

    client.on('login', function(name) {
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

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

function updateUsersFromDb( err, result ) {
    if (err) {
        console.log(err);
    } else if ( result ){
        users = result;
        num_users = users.count();
        console.log(users);
    } else {
        console.log('No document(s) found with with name "users"');
    }
};

function updateDbFromUsers( err, result ) {
    if (err) {
        console.log(err);
    } else if ( result ){
        users = result;
        console.log(users);
    } else {
        console.log('No document(s) found with with name "users"');
    }
};

/* Start the server */
server.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
// [END server]
