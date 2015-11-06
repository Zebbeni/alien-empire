var submitAction = function() {
	socket_submitAction();
};

var submitTurnDone = function(name) {
    socket_submitTurnDone();
};

var submitLoadingDone = function() {
	socket_loadingDone();
};

var submitGameMessage = function(divid) {
    var msg = $(divid)[0].value;
    $(divid)[0].value = '';
    socket_sendGameMessage(msg);
};

var submitCollectResources = function() {
	socket_submitCollectResources();
};

var submitPayUpkeep = function() {
	socket_submitPayUpkeep();
};