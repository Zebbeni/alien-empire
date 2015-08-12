var socket = io.connect();
var stageLogin = null;
var stageLobby = null;

socket.on('enter lobby', function(users, messages, fn) {
    fn('client entered lobby');
    moveToLobby(users, messages);
});

socket.on('leave lobby', function(fn) {
    fn('client has left lobby');
    leaveLobby();
});

socket.on('user login', function(users, messages) {
    displayUsers(users);
    displayMessages(messages);
});

socket.on('user logout', function(users, messages) {
    displayUsers(users);
    displayMessages(messages);
});

socket.on('new chat message', function(messages) {
    displayMessages(messages);
});

//ADDED FOR EASEL STUFF

var stage = null;

//TODO: Create game stages, set their visibilities to hidden
var init = function() {
    document.getElementById('lobby-div').style.visibility = "hidden";
};

var displayUsers = function(users) {
    var usersScrollItems = '';

    for (var u in users){
        usersScrollItems += '<div class="username-class">' + users[u] + '</div>';
    }

    document.getElementById('users-scroll').innerHTML = usersScrollItems;
};

var displayMessages = function(messages) {
    var messagesHtml = '';
    for (var m in messages){
        if (messages[m].name == "Server") {
            messagesHtml += '<div style="color:gray; text-align:center">' + messages[m].message + '</div>';
        }
        else {
            messagesHtml += '<div>' + messages[m].name + ': ' + messages[m].message + '</div>';
        }
    }
    document.getElementById('messages-div').innerHTML = messagesHtml;
};

//update lobby stage, make it visible, and hide login stage
var moveToLobby = function(users, messages) {
    document.getElementById('login-div').style.visibility = "hidden";
    document.getElementById('lobby-div').style.visibility = "visible";
    document.getElementById('logout-button').style.visibility = "visible";
    displayUsers(users);
    displayMessages(messages);
};

var leaveLobby = function() {
    document.getElementById('login-div').style.visibility = "visible";
    document.getElementById('lobby-div').style.visibility = "hidden";
    document.getElementById('logout-button').style.visibility = "hidden";
};

var submitLogin = function() {
    var name = document.getElementById('input-username').value;
    login(name);
};

var submitLogout = function() {
    console.log("Attempting to logout");
    logout();
};

var submitMessage = function() {
    var msg = document.getElementById('chat-input').value;
    document.getElementById('chat-input').value = '';
    sendChatMessage(msg);
};

var login = function(name) {
    socket.emit('login', name, function(data){
        console.log('received login: ', data);
    });
};

var logout = function() {
    socket.emit('logout', function(data){
        console.log('received logout: ', data);
    })
}

var sendChatMessage = function(msg) {
    socket.emit('send chat message', msg, function(data){
        console.log('received chat message: ', data);
    });
};