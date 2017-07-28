// javascript functions called from UX

var submitLogin = function() {
    playSound("click1", 0.05);
    var name = $('#input-username')[0].value;
    socket_login(name);
};

var submitLogout = function() {
    playSound("click1", 0.05);
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

var submitStagingAddComputer = function() {
    playSound("click1", 0.05);
    socket_addComputerStaging();
}

var submitStagingReady = function(){
    playSound("click1", 0.05);
    socket_readyStaging();
};

var submitStagingLeave = function(){
    playSound("click1", 0.05);
    socket_leaveStaging();
};

var submitStagingNumPlayers = function( num ){
    playSound("click1", 0.05);
    socket_requestNumPlayersStaging( num );
};

var submitStagingPoints = function( num ){
    playSound("click1", 0.05);
    socket_requestPointsStaging( num );
};

var submitGameToLobby = function() {
    playSound("click1", 0.05);
    socket_returnGameToLobby();
};

// deletes local info so it isn't repopulated on login as a different user
var clearClientData = function() {
    all_users = [];
    all_messages = [];
    all_games = [];
};