//update lobby stage, make it visible, and hide login stage

var moveToLogin = function() {
    $('#login-div')[0].style.visibility = "visible";
    $('#login-div').transition({opacity: 1.0}, 1500 );
};

var leaveLogin = function() {
    $('#login-div').transition({opacity: 0.0}, 500, function() {
        $('#login-div')[0].style.visibility = "hidden";
    });
};

var moveToLobby = function() {

    $('#lobby-div')[0].style.visibility = "visible";
    $('#logout-button')[0].style.visibility = "visible";
    $('#main-div')[0].style.visibility = "visible";

    $("#lobby-div").transition({top: '450px', opacity: 1.0}, 1000);
    $("#logout-button").transition({top: '-30px'}, 500);
    $("#main-div").transition({top: '450px', opacity: 1.00}, 1000);
};

var leaveLobby = function() {
    $('#logout-button')[0].style.visibility = "hidden";
    $('#lobby-div').transition({top: '425px', opacity: 0.00}, 1000, function() {
        $('#lobby-div')[0].style.visibility = "hidden";
    });
};

/**
 * Hide the lobby and perform some function after the last animation is complete.
 */
var moveToGame = function( fn ) {
    $('#screen-div')[0].style.visibility = "hidden";
    $("#logout-button").transition({top: '-60px'}, 500);
    $("#staging-div").transition({top: '350px'}, 1000);
    $("#main-div").transition({top: '350px', opacity: 0.00 }, 1000, function(){
        $('#main-div')[0].style.visibility = "hidden";
        $("#staging-div")[0].style.visibility = "hidden";
        $("#lobby-div")[0].style.visibility = "hidden";
        $("#logout-button")[0].style.visibility = "hidden";
    });
    $("#lobby-div").transition({top: '350px'}, 1000, fn );
};

var moveToGameStage = function() {
    $('#screen-div')[0].style.visibility = "visible";
    $("#screen-div").transition({opacity: 1.0}, 500);
    $('#staging-div')[0].style.visibility = "visible";
    $("#staging-div").transition({top: '400px', opacity: 1.0}, 1000);
};

var hideGameStage = function() {
    $("#screen-div").transition({opacity: 0.0}, 500, function() {
        $('#screen-div')[0].style.visibility = "hidden";
    });
    $("#staging-div").transition({top: '350px', opacity: 0.00}, 1000, function() {
        $('#staging-div')[0].style.visibility = "hidden";
    });
};

// Revisit these two functions when you actually create the nice game interface
var moveToGameInterface = function() {
    $('#game-messages-wrapper-div')[0].style.visibility = "visible";
    $('#game-interface-div').show();
    $('#game-interface-div').transition({opacity: 1.0}, 2000 );
    $('#game-end-div').hide();
};

var leaveGameInterface = function() {
    $('#your-turn-div')[0].style.visibility = "hidden";
    $('#pending-action-div')[0].style.visibility = "hidden";
    $('#done-button')[0].style.visibility = "hidden";
    $('#players-wrapper-div')[0].style.visibility = "hidden";
    $('#game-messages-wrapper-div')[0].style.visibility = "hidden";
    $('.phase-div').hide();
    $('#game-interface-div').transition({opacity: 0.0}, 1000, function() {
        $('#game-interface-div').hide();
    });
    // $('#bottom-bar-div').transition({ opacity: 0.0}, 1000, function() {
    //     $('#bottom-bar-div')[0].style.visibility = "hidden";
    // });
    // $('#points-remaining')[0].style.visibility = "hidden";
    // $('#round-menu-div').transition({opacity: 0.0}, 1000, function() {
    //     $('#round-menu-div')[0].style.visibility = "hidden";
    // });
};

var transGameToLobby = function() {
    fadeOut(board, 1000, false);
    clientGame = {};
    setGlobals();
    leaveGameInterface();
    moveToLobby();
};