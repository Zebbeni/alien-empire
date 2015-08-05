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
    stageLogin.update();

    stageLobby = new createjs.Stage("lobbyCanvas");
    stageLobby.update();

    document.getElementById('lobbyCanvas').style.visibility = "hidden";
    document.getElementById('lobby-div').style.visibility = "hidden";
};

var displayUsers = function(users) {
    var usersScrollItems = '';
    document.getElementById('users-scroll').innerHTML = '';

    var y = 50;
    for (var u in users){
        var text = new createjs.Text(users[u], "20px Arial", "#ff7700");
        text.y = y;
        text.x = 50;
        y += 30;
        stageLobby.addChild(text);

        usersScrollItems += '<div class="username-class">' + users[u] + '</div>';
    }
    stageLobby.update();
    console.log("Displaying Users", users);

    document.getElementById('users-scroll').innerHTML = usersScrollItems;
};

//update lobby stage, make it visible, and hide login stage
var moveToLobby = function(users) {
    document.getElementById('login-div').style.visibility = "hidden";
    document.getElementById('loginCanvas').style.visibility = "hidden";
    // document.getElementById('lobbyCanvas').style.visibility = "visible";
    document.getElementById('lobby-div').style.visibility = "visible";
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