var socket = io.connect();
var all_users = [];
var all_messages = [];
var all_games = [];
var stageLogin = null;
var stageLobby = null;
var clientId = null;
var clientName = null;
var clientGame = null;
//ADDED FOR EASEL STUFF
var stage = null;

//TODO: Create game stages, set their visibilities to hidden
var init = function() {
    document.getElementById('lobby-div').style.visibility = "hidden";
};

var displayUsers = function() {
    var usersScrollItems = '';

    for (var u = 0; u < all_users.length; u++){
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

var displayMessages = function() {
    var messagesHtml = '<table style="height:10px"><tr><td class="msg-self-td"></td><td class="msg-content-td"></td></tr>';
    var lastUserId = null;
    var msg = null;
    for (var m = 0; m < all_messages.length; m++){

        msg = all_messages[m];
        messagesHtml += '<tr>'

        if (msg.id == -1) {
            messagesHtml += '<td class="msg-server-td" colspan="2" >' + msg.message + '</td>';
        }
        else {
            messagesHtml += ( msg.id == clientId ? '<td class="msg-self-td">' : '<td class="msg-user-td">' );

            if (msg.id != lastUserId) { // Only display user name if it's a different user talking
               messagesHtml += all_users[msg.id].name;
            }

            messagesHtml += '</td><td class="msg-content-td';
            messagesHtml += ( msg.id == clientId ? ' msg-self-content-td">' : '">') + msg.message + '</td>';
        }
        messagesHtml += '</tr>'

        lastUserId = msg.id;
    }
    messagesHtml += '</table>'

    var msgDiv = document.getElementById("messages-div");

    msgDiv.innerHTML = messagesHtml;
    msgDiv.scrollTop = msgDiv.scrollHeight; // scroll to bottom
};

var displayGames = function() {
    gamesHtml = '';
    var players = null;
    for (var g = 0; g < all_games.length; g++) {

        gamesHtml += '<input type="button" class="game-button" value="';
        players = all_games[g].players;

        for (var p in players) {
            gamesHtml += all_users[players[p]].name + '  ';
        }

        gamesHtml += '" onclick="javascript:submitJoinGame(' + g + ')"></input>';
    }
    document.getElementById('games-list-div').innerHTML = gamesHtml;
};

//update lobby stage, make it visible, and hide login stage
var moveToLobby = function() {
    document.getElementById('login-div').style.visibility = "hidden";
    document.getElementById('lobby-div').style.visibility = "visible";
    document.getElementById('logout-button').style.visibility = "visible";
    $("#lobby-div").animate({top: '450px'}, 500);
};

//updates any of the main content areas of the lobby (pass in false for non-updated elements)
var updateLobby = function(users, messages, games) {
    if (users){
        all_users = users;
        displayUsers();
    }
    if (messages) {
        all_messages = messages;
        displayMessages();
    }
    if (games) {
        all_games = games;
        displayGames();
    }
};

var updateGameStage = function() {
    document.getElementById('screen-div').style.visibility = "visible";
    document.getElementById('staging-div').style.visibility = "visible";
    $("#staging-div").animate({top: '400px'}, 500);
};