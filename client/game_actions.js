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

var submitPayUpkeep = function(pkg_index) {
	socket_submitPayUpkeep(pkg_index);
};

var submitMissionsViewed = function() {
	socket_submitMissionsViewed();
};

var submitTradeFourToOne = function(pay, get){
	socket_submitTradeFourToOne(pay, get);
};