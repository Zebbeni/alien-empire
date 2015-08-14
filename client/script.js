var socket = io.connect();
var all_users = null;
var all_games = null;
var stageLogin = null;
var stageLobby = null;
var clientId = null;
var clientName = null;

socket.on('login success', function(users, userid, username, messages, games, fn) {
    fn('client entered lobby');
    clientId = userid;
    clientName = username;
    moveToLobby(users, messages, games);
});

socket.on('leave lobby', function(fn) {
    fn('client has left lobby');
    leaveLobby();
});

socket.on('user login', function(users, messages) {
    updateUsers(users);
    displayUsers();
    displayMessages(messages);
});

socket.on('user logout', function(users, messages) {
    updateUsers(users);
    displayUsers();
    displayMessages(messages);
});

socket.on('new chat message', function(messages) {
    displayMessages(messages);
});

socket.on('new game added', function(games) {
    updateGames(games);
    displayGames();
});

//ADDED FOR EASEL STUFF

var stage = null;

//TODO: Create game stages, set their visibilities to hidden
var init = function() {
    document.getElementById('lobby-div').style.visibility = "hidden";
};

var updateUsers = function(users) {
    all_users = users;
};

var displayUsers = function() {
    var usersScrollItems = '';

    for (var u in all_users){
        if (all_users[u].status == 1) {
         
            if (u == clientId){
                usersScrollItems += '<div class="self-list-div">' + all_users[u].name + '</div>';
            }
            else {
                usersScrollItems += '<div class="user-list-div">' + all_users[u].name + '</div>';
            }
        }
    }

    document.getElementById('users-scroll').innerHTML = usersScrollItems;
};

var displayMessages = function(messages) {
    var messagesHtml = '<table style="height:10px"><tr><td class="msg-self-td"></td><td class="msg-content-td"></td></tr>';

    for (var m in messages){
        messagesHtml += '<tr msg-tr>'
        if (messages[m].id == 0) {
            messagesHtml += '<td class="msg-server-td" colspan="2" >' + messages[m].message + '</td>';
        }
        else if (messages[m].id == clientId) {
            messagesHtml += '<td class="msg-self-td">' + all_users[messages[m].id].name + '</td><td class="msg-content-td msg-self-content-td">' + messages[m].message + '</strong></td>';
        }
        else {
            messagesHtml += '<td class="msg-user-td">' + all_users[messages[m].id].name + '</td><td class="msg-content-td">' + messages[m].message + '</td>';
        }
        messagesHtml += '</tr>'
    }
    messagesHtml += '</table>'

    var msgDiv = document.getElementById("messages-div");

    msgDiv.innerHTML = messagesHtml;
    msgDiv.scrollTop = msgDiv.scrollHeight; // scroll to bottom
};

var updateGames = function(games) {
    all_games = games;
};

var displayGames = function() {
    gamesHtml = '';
    var players = null;
    for (var g in all_games) {

        gamesHtml += '<input type="button" class="game-button" value="';
        players = all_games[g].players;

        for (var p in players) {
            gamesHtml += all_users[players[p]].name + '  ';
        }

        gamesHtml += '"></input>';
    }
    document.getElementById('games-list-div').innerHTML = gamesHtml;
};

//update lobby stage, make it visible, and hide login stage
var moveToLobby = function(users, messages, games) {
    document.getElementById('login-div').style.visibility = "hidden";
    document.getElementById('lobby-div').style.visibility = "visible";
    document.getElementById('logout-button').style.visibility = "visible";
    $("#lobby-div").animate({top: '450px'}, 500);
    updateUsers(users);
    displayUsers();
    displayMessages(messages);
    updateGames(games);
    displayGames();
};

//javascript functions called from HTML elements
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

var submitNewGame = function() {
    createGame();
};

//socket event emitting handlers
var login = function(name) {
    socket.emit('login', name, function(data){
        console.log('received login: ', data);
    });
};

var logout = function() {
    socket.emit('logout', function(data){
        console.log('received logout: ', data);
    });
};

var sendChatMessage = function(msg) {
    socket.emit('send chat message', msg, function(data){
        console.log('received chat message: ', data);
    });
};

var createGame = function() {
    socket.emit('create game', function(data) {
        console.log('received new game request: ', data);
    });
};