//update lobby stage, make it visible, and hide login stage

var moveToLogin = function() {
    $('#login-div').show();
    $('#input-username').focus();
    $('#login-div').transition({opacity: 1.0}, 2000);
    $('#login-center-div').transition({top: '40%'}, 2000);
};

var leaveLogin = function() {
    $('#login-div').transition({opacity: 0.0}, 500, function() {
        $('#login-div').hide();
    });
    $('#login-center-div').transition({top: '38%'}, 500);
};

var moveToLobby = function() {

    $('#lobby-div').show();
    $('#logout-button').show();
    $('#main-div').show();
    $("#lobby-div").transition({top: '0px', opacity: 1.0}, 1000);
    $("#logout-button").transition({top: '-30px'}, 500);
    $("#main-div").transition({opacity: 1.00}, 1000);
    $('#copyright').show();
    initSettingsButtons();

    playLobbySound('flutter2', 0.2);
};

var leaveLobby = function() {
    $('#logout-button').hide();
    $('#lobby-div').transition({opacity: 0.00}, 1000, function() {
        $('#lobby-div').hide();
    });
    playLobbySound('flutter1', 0.2);
};

/**
 * Hide the lobby and perform some function after the last animation is complete.
 */
var moveToGame = function( fn ) {
    $('#screen-div').hide();
    $("#logout-button").transition({top: '-60px'}, 500);
    $("#staging-div").transition({top: '45%'}, 1000);
    $("#main-div").transition({opacity: 0.00 }, 1000, function(){
        $('#main-div').hide();
        $("#staging-div").hide();
        $("#lobby-div").hide();
        $("#logout-button").hide();
        fn();
    });
    $("#lobby-div").transition({top: '-20px'}, 1000);

    playLobbySound('flutter1', 0.2);
};

var moveToGameStage = function() {
    $('#screen-div').show();
    $("#screen-div").transition({opacity: 1.0}, 500);
    $('#staging-div').show();
    $("#staging-div").transition({top: '50%', opacity: 1.0}, 1000);
    playLobbySound('flutter2', 0.2);
};

var hideGameStage = function() {
    $("#screen-div").transition({opacity: 0.0}, 500, function() {
        $('#screen-div').hide();
    });
    $("#staging-div").transition({top: '45%', opacity: 0.00}, 1000, function() {
        $('#staging-div').hide();
    });
    playLobbySound('flutter1', 0.2);
};

// Revisit these two functions when you actually create the nice game interface
var moveToGameInterface = function() {
    $('#game-interface-div').show();
    $('#game-interface-div').transition({opacity: 1.0}, 2000 );
    $('#game-end-div').hide();
    $('#rules-div').hide();
    $('#copyright').hide();
};

var leaveGameInterface = function() {
    $('.phase-div').hide();
    $('#rules-div').hide();
    $('#game-interface-div').transition({opacity: 0.0}, 1000, function() {
        $('#game-interface-div').hide();
    });
};

var transGameToLobby = function() {
    fadeOut(board, 1000, false);
    clientGame = {};
    setGlobals();
    leaveGameInterface();
    moveToLobby();
};