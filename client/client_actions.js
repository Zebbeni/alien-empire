// javascript functions called from UX

var submitLogin = function() {
    var name = $('#input-username')[0].value;
    socket_login(name);
};

var submitLogout = function() {
    console.log("Attempting to logout");
    clearClientData();
    socket_logout();
};

var submitMessage = function() {
    var msg = $('#chat-input')[0].value;
    $('#chat-input')[0].value = '';
    socket_sendMessage( msg );
};

var submitNewGame = function() {
    socket_createGame();
};

var submitJoinGame = function(gameId) {
    socket_joinGame(gameId);
};

var submitStagingReady = function(){
    socket_readyStaging();
};

var submitStagingLeave = function(){
    socket_leaveStaging();
};

var submitStagingNumPlayers = function( num ){
    socket_requestNumPlayersStaging( num );
};

// deletes local info so it isn't repopulated on login as a different user
var clearClientData = function() {
    all_users = [];
    all_messages = [];
    all_games = [];
};