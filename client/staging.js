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

var displayGameOptions = function() {
    $('.staging-playernum-selected').each(function() {
        if ( $( this ).val() != clientGame.requestedPlayers ){
            $( this ).removeClass('staging-playernum-selected');
        }
    });
    $('.staging-playernum-button').each(function() {
        if ( $( this ).val() == clientGame.requestedPlayers ){
            $( this ).addClass('staging-playernum-selected');
        }
    });
};

var displayGameStage = function() {
    displayStagingPlayers();
    displayStagingMessages();
    displayGameOptions();
};