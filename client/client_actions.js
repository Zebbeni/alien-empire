// javascript functions called from UX

var leaveLobby = function() {
    document.getElementById('login-div').style.visibility = "visible";
    document.getElementById('lobby-div').style.visibility = "hidden";
    document.getElementById('logout-button').style.visibility = "hidden";
};

var submitLogin = function() {
    var name = document.getElementById('input-username').value;
    socket_login(name);
};

var submitLogout = function() {
    console.log("Attempting to logout");
    clearClientData();
    socket_logout();
};

var submitMessage = function() {
    var msg = document.getElementById('chat-input').value;
    document.getElementById('chat-input').value = '';
    socket_sendMessage( msg );
};

var submitStagingMessage = function() {
    var msg = document.getElementById('staging-chat-input').value;
    document.getElementById('staging-chat-input').value = '';
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
    var msg = document.getElementById('staging-chat-input').value;
    document.getElementById('staging-chat-input').value = '';
    socket_sendStagingMessage(msg);
};

// deletes local info so it isn't repopulated on login as a different user
var clearClientData = function() {
    all_users = [];
    all_messages = [];
    all_games = [];
};