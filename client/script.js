var socket = io.connect();
var all_users = [];
var all_messages = [];
var all_games = [];
var stageLogin = null;
var stageLobby = null;
var clientId = null;
var clientName = null;
var clientGame = null;
var status = USR_OFFLINE; // 0: USR_OFFLINE 1: USR_ONLINE 2: USR_STAGING 3: USR_INGAME

//ADDED FOR EASEL STUFF
var stage = null;

var displayUsers = function() {
    var usersScrollItems = '';

    for (var u = 0; u < all_users.length; u++){
        if ( all_users[u].status == USR_ONLINE 
             || all_users[u].status == USR_INGAME 
             || all_users[u].status == USR_STAGING ) {
         
            if (u == clientId){
                usersScrollItems += '<div class="self-list-div">' + all_users[u].name + '</div>';
            }
            else if (all_users[u].status == USR_INGAME){
                usersScrollItems += '<div class="user-list-div user-ingame-list-div">' + all_users[u].name + ' (In Game)</div>';
            }
            else if (all_users[u].status == USR_STAGING){
                usersScrollItems += '<div class="user-list-div user-staging-list-div">' + all_users[u].name + ' (Stage)</div>';
            }
            else {
                usersScrollItems += '<div class="user-list-div">' + all_users[u].name + '</div>';
            }
        }
    }
    $('#users-scroll').html(usersScrollItems);
};

var displayGames = function() {
    gamesHtml = '';
    var hostid = null;
    for (var g = 0; g < all_games.length; g++) {

        if (all_games[g].status == GAME_STAGING) { // if game is in staging

            gamesHtml += '<input type="button" class="game-button" ';

            hostid = all_games[g].players[0];
            var num_joined = all_games[g].players.length;
            var num_requested = all_games[g].requestedPlayers;
            gamesHtml += 'value="Join Game | Host: ' 
                        + all_users[hostid].name + ' | ' 
                        + num_joined + '/' + num_requested + '"';

            gamesHtml += ' onclick="javascript:submitJoinGame(' + g + ')"></input>';
        }
    }
    $('#games-list-div').html(gamesHtml);

    // update .game-button here, it won't get updated if we only do it onload
    setInterfaceImage('.game-button');
    setInterfaceImage('#staging-ready-button');
    setInterfaceImage('#staging-leave-button');
};

var displayMessages = function() {

    updateMessagesHtml( all_messages, "messages-div" );

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