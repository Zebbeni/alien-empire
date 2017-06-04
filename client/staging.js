var displayStagingPlayers = function() {
    var stagingPlayersHtml = '';
    var players = clientGame.players;
    var ready = clientGame.ready;

    for (var u = 0; u < clientGame.requestedPlayers; u++){

        if (u < players.length) {
            var playerid = players[u];
            var divClass = '<div class="staging-user-list-div">  ';

            // if user is ready, draw white
            var index = ready.indexOf(playerid);

            if (index != -1) {
                divClass = '<div class="staging-user-ready-list-div">✓ ';
            }

            stagingPlayersHtml += divClass + all_users[playerid].name + '</div>';
        } else {
            var divClass = '<div class="staging-user-list-add-ai-div">';

            stagingPlayersHtml += divClass + "+ Add Computer</div>";
        }
    }
    $('#staging-users-div').html(stagingPlayersHtml);
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

// There is a smarter way to do this. Think about it for 1 minute
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
    $('.staging-pointnum-selected').each(function() {
        if ( $( this ).val() != clientGame.requestedPoints ){
            $( this ).removeClass('staging-pointnum-selected');
        }
    });
    $('.staging-pointnum-button').each(function() {
        if ( $( this ).val() == clientGame.requestedPoints ){
            $( this ).addClass('staging-pointnum-selected');
        }
    });
};

var displayGameStage = function() {
    displayStagingPlayers();
    displayStagingMessages();
    displayGameOptions();
};