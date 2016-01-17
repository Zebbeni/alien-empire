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

var submitCollectResources = function(pkg_index) {
	socket_submitCollectResources(pkg_index);
};

var submitPayUpkeep = function() {
	socket_submitPayUpkeep();
};

var submitMissionsViewed = function() {
	socket_submitMissionsViewed();
};