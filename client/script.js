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
    $('#users-scroll')[0].innerHTML = usersScrollItems;
};

var displayGames = function() {
    gamesHtml = '';
    var hostid = null;
    for (var g = 0; g < all_games.length; g++) {

        if (all_games[g].status == 1) { // if game is in staging

            gamesHtml += '<input type="button" class="game-button" ';

            hostid = all_games[g].players[0];
            gamesHtml += 'value="Join Game | Host: ' + all_users[hostid].name + '"';

            gamesHtml += ' onclick="javascript:submitJoinGame(' + g + ')"></input>';
        }
    }
    $('#games-list-div')[0].innerHTML = gamesHtml;
};

var displayStagingPlayers = function() {
    var stagingPlayersHtml = '';
    var players = clientGame.players;
    var ready = clientGame.ready;

    for (var u = 0; u < players.length; u++){

        var playerid = players[u];
        var divClass = '<div class="staging-user-list-div">  ';

        // if user is ready, draw white
        var index = ready.indexOf(playerid);

        if (index != -1) {
            divClass = '<div class="staging-user-ready-list-div">✓ ';
        }

        stagingPlayersHtml += divClass + all_users[playerid].name + '</div>';

    }
    $('#staging-users-div')[0].innerHTML = stagingPlayersHtml;
};

var displayMessages = function() {

    updateMessagesHtml( all_messages, "messages-div" );

};

//update lobby stage, make it visible, and hide login stage
var moveToLobby = function() {
    $('#login-div')[0].style.visibility = "hidden";
    $('#your-turn-div')[0].style.visibility = "hidden";
    $('#pending-action-div')[0].style.visibility = "hidden";
    $('#turn-done-button')[0].style.visibility = "hidden";
    $('#button-bar-div')[0].style.visibility = "hidden";
    $('#build-recruit-buttons-div')[0].style.visibility = "hidden";
    $('#recruit-buttons-div')[0].style.visibility = "hidden";
    $('#game-messages-wrapper-div')[0].style.visibility = "hidden";
    $('#players-wrapper-div')[0].style.visibility = "hidden";
    
    $('#lobby-div')[0].style.visibility = "visible";
    $('#logout-button')[0].style.visibility = "visible";
    $('#main-div')[0].style.visibility = "visible";

    $("#lobby-div").transition({top: '450px'}, 1000);
    $("#logout-button").transition({top: '-30px'}, 1000);
    $("#main-div").transition({top: '450px', opacity: 1.00}, 1000);
};

/**
 * Hide the lobby and perform some function after the last animation is complete.
 */
var moveToGame = function( fn ) {
    $('#screen-div')[0].style.visibility = "hidden";
    $("#logout-button").transition({top: '-60px'}, 1000);
    $("#staging-div").transition({top: '350px'}, 1000);
    $("#main-div").transition({top: '350px', opacity: 0.00 }, 1000, function(){
        $('#main-div')[0].style.visibility = "hidden";
        $("#staging-div")[0].style.visibility = "hidden";
        $("#lobby-div")[0].style.visibility = "hidden";
        $("#logout-button")[0].style.visibility = "hidden";
    });
    $("#lobby-div").transition({top: '350px'}, 1000, fn );
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
    $('#screen-div')[0].style.visibility = "visible";
    $('#staging-div')[0].style.visibility = "visible";
    $("#staging-div").transition({top: '400px'}, 500);
};

var hideGameStage = function() {
    $('#screen-div')[0].style.visibility = "hidden";
    $('#staging-div')[0].style.visibility = "hidden";
}