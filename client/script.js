var socket = io.connect();
var stageLogin = null;
var stageLobby = null;

socket.on('enter lobby', function(users, fn) {
    fn('roger, client entered lobby acknowledged');
    console.log('received enter lobby event from server');
    moveToLobby(users);
});

socket.on('user login', function(users) {
    console.log('received user login event from server');
    displayUsers(users);
});

//ADDED FOR EASEL STUFF

var stage = null;

//create login and lobby stages, hide lobby stage
var init = function() {
    stageLogin = new createjs.Stage("loginCanvas");
    var circle = new createjs.Shape();
    circle.graphics.beginFill("Blue").drawCircle(50, 30, 50);
    circle.x = 300;
    circle.y = 250;
    stageLogin.addChild(circle);
    stageLogin.update();
    stageLogin.update();

    stageLobby = new createjs.Stage("lobbyCanvas");
    var circle = new createjs.Shape();
    circle.graphics.beginFill("Red").drawCircle(50, 30, 50);
    circle.x = 300;
    circle.y = 250;
    stageLobby.addChild(circle);
    stageLobby.update();

    document.getElementById('lobbyCanvas').style.visibility = "hidden";
};

var displayUsers = function(users) {
    console.log("Displaying Users", users);
};

//update lobby stage, make it visible, and hide login stage
var moveToLobby = function(users) {
    document.getElementById('d').style.visibility = "hidden";
    document.getElementById('loginCanvas').style.visibility = "hidden";
    document.getElementById('lobbyCanvas').style.visibility = "visible";
    displayUsers(users);
};

var submitLogin = function() {
    var name = document.getElementById('input-username').value;
    console.log('logging in as ', name);
    console.log('password ', document.getElementById('input-password').value);
    login(name);
};

var login = function(name) {
    console.log('emitting login event to server');
    // socket.emit('login', name);
    socket.emit('login', name, function(data){
        console.log('acknowledged: ', data);    
    });
};