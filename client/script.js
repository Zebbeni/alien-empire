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
        if (all_users[u].status == USR_ONLINE) {
         
            if (u == clientId){
                usersScrollItems += '<div class="self-list-div">' + all_users[u].name + '</div>';
            }
            else {
                usersScrollItems += '<div class="user-list-div">' + all_users[u].name + '</div>';
            }
        }
    }
    $('#users-scroll')[0].innerHTML = usersScrollItems;
};

var displayGames = function() {
    gamesHtml = '';
    var hostid = null;
    for (var g = 0; g < all_games.length; g++) {

        if (all_games[g].status == GAME_STAGING) { // if game is in staging

            gamesHtml += '<input type="button" class="game-button" ';

            hostid = all_games[g].players[0];
            gamesHtml += 'value="Join Game | Host: ' + all_users[hostid].name + '"';

            gamesHtml += ' onclick="javascript:submitJoinGame(' + g + ')"></input>';
        }
    }
    $('#games-list-div')[0].innerHTML = gamesHtml;

    // update .game-button here, it won't get updated if we only do it onload
    setInterfaceImages();
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