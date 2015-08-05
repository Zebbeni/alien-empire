var socket = io.connect();
var stageLogin = null;
var stageLobby = null;

socket.on('enter lobby', function(users, messages, fn) {
    fn('roger, client entered lobby acknowledged');
    console.log('received enter lobby event from server');
    moveToLobby(users, messages);
});

socket.on('user login', function(users) {
    console.log('received user login event from server');
    displayUsers(users);
});

socket.on('new chat message', function(messages) {
    console.log('received new user message');
    displayMessages(messages);
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

    for (var u in users){
        usersScrollItems += '<div class="username-class">' + users[u] + '</div>';
    }
    console.log("Displaying Users", users);

    document.getElementById('users-scroll').innerHTML = usersScrollItems;
};

var displayMessages = function(messages) {
    var messagesHtml = '';
    for (var m in messages){
        messagesHtml += '<div>' + messages[m].name + ': ' + messages[m].message + '</div>';
    }

    document.getElementById('messages-div').innerHTML = messagesHtml;
    console.log("Displaying Messages");
};

//update lobby stage, make it visible, and hide login stage
var moveToLobby = function(users, messages) {
    document.getElementById('login-div').style.visibility = "hidden";
    document.getElementById('loginCanvas').style.visibility = "hidden";
    // document.getElementById('lobbyCanvas').style.visibility = "visible";
    document.getElementById('lobby-div').style.visibility = "visible";
    displayUsers(users);
    displayMessages(messages);
};

var submitLogin = function() {
    var name = document.getElementById('input-username').value;
    console.log('logging in as ', name);
    console.log('password ', document.getElementById('input-password').value);
    login(name);
};

var submitMessage = function() {
    var msg = document.getElementById('chat-input').value;
    document.getElementById('chat-input').value = '';
    console.log('sending message ', msg);
    sendChatMessage(msg);
};

var login = function(name) {
    socket.emit('login', name, function(data){
        console.log('acknowledged: ', data);    
    });
};

var sendChatMessage = function(msg) {
    socket.emit('send chat message', msg, function(data){
        console.log('acknowledged message: ', data);
    });
};