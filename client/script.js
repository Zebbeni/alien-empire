var socket = io.connect();
var all_users = [];
var all_messages = [];
var all_games = [];
var stageLogin = null;
var stageLobby = null;
var clientId = null;
var clientName = null;
var clientGame = null;
var status = 0; // 0: OFFLINE 1: LOBBY 2: STAGING 3: INGAME

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

var displayGames = function() {
    gamesHtml = '';
    var players = null;
    for (var g = 0; g < all_games.length; g++) {

        if (all_games[g].status == 1) { // if game is in staging

            gamesHtml += '<input type="button" class="game-button" value="';
            players = all_games[g].players;

            for (var p in players) {
                gamesHtml += all_users[players[p]].name + '  ';
            }

            gamesHtml += '" onclick="javascript:submitJoinGame(' + g + ')"></input>';
        }
    }
    document.getElementById('games-list-div').innerHTML = gamesHtml;
};

var displayStagingPlayers = function() {
    var stagingPlayersHtml = '';
    var players = clientGame.players;
    var ready = clientGame.ready;

    for (var u = 0; u < players.length; u++){

        var playerid = players[u];
        var divClass = '<div class="staging-user-list-div">';

        // if user is ready, draw white
        var index = ready.indexOf(playerid);

        if (index != -1) {
            divClass = '<div class="staging-user-ready-list-div">';
        }

        stagingPlayersHtml += divClass + all_users[playerid].name + '</div>';

    }
    document.getElementById('staging-users-div').innerHTML = stagingPlayersHtml;
};

var displayMessages = function() {

    updateMessagesHtml( all_messages, "messages-div" );

};

var displayStagingMessages = function() {

    updateMessagesHtml( clientGame.messages, "staging-messages-div");

};

var updateMessagesHtml = function( messages, div_id ) {

    var messagesHtml = '<table style="height:10px"><tr><td class="msg-self-td"></td><td class="msg-content-td"></td></tr>';
    var lastUserId = null;
    var msg = null;

    for (var m = 0; m < messages.length; m++){ //different

        msg = messages[m]; //different
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

    var msgDiv = document.getElementById( div_id ); //different
    msgDiv.innerHTML = messagesHtml;
    msgDiv.scrollTop = msgDiv.scrollHeight; // scroll to bottom
};

//update lobby stage, make it visible, and hide login stage
var moveToLobby = function() {
    document.getElementById('login-div').style.visibility = "hidden";
    document.getElementById('lobby-div').style.visibility = "visible";
    document.getElementById('logout-button').style.visibility = "visible";
    $("#lobby-div").animate({top: '450px'}, 500);
};

var initializeLobby = function(users, newMsg, games) {
    all_users = users;
    all_games = games;
    all_messages.push(newMsg);
};

//updates any of the main content areas of the lobby 
//   (pass in false for non-updated elements)
var updateLobby = function(users, newMsg, newGame) {
    if (users){
        all_users = users;
    }
    if (newMsg) {
        all_messages.push(newMsg);
    }
    if (newGame) { 
        // check if update to an existing game
        if (newGame.gameid < all_games.length) {
            all_games[newGame.gameid] = newGame;
        } // otherwise, add it
        else {
            all_games.push(newGame);
        }
    }
    displayLobby();
};

var displayLobby = function() {
    displayUsers();
    displayMessages();
    displayGames();
};

var initializeGameStage = function(game) {
    clientGame = game;
};

var updateGameStage = function(users, newMsg, ready) {
    if (users) {
        clientGame.players = users;
    }
    if (newMsg) {
        clientGame.messages.push(newMsg);
    }
    if (ready) {
        clientGame.ready = ready;
    }
    displayGameStage();
};

var displayGameStage = function() {
    displayStagingPlayers();
    displayStagingMessages();
};

var moveToGameStage = function() {
    document.getElementById('screen-div').style.visibility = "visible";
    document.getElementById('staging-div').style.visibility = "visible";
    $("#staging-div").animate({top: '400px'}, 500);
};

var hideGameStage = function() {
    document.getElementById('screen-div').style.visibility = "hidden";
    document.getElementById('staging-div').style.visibility = "hidden";
}