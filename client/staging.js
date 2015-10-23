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