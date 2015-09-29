// javascript functions called from UX

var leaveLobby = function() {
    $('#login-div')[0].style.visibility = "visible";
    $('#lobby-div')[0].style.visibility = "hidden";
    $('#logout-button')[0].style.visibility = "hidden";
};

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

var submitStagingMessage = function() {
    var msg = $('#staging-chat-input')[0].value;
    $('#staging-chat-input')[0].value = '';
    socket_sendStagingMessage( msg );
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

var submitStagingMessage = function() {
    var msg = $('#staging-chat-input')[0].value;
    $('#staging-chat-input')[0].value = '';
    socket_sendStagingMessage(msg);
};

// deletes local info so it isn't repopulated on login as a different user
var clearClientData = function() {
    all_users = [];
    all_messages = [];
    all_games = [];
};