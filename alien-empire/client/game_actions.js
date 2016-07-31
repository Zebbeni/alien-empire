var submitAction = function() {
	socket_submitAction();
};

var submitTurnDone = function() {
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

var submitTradeRequest = function(requester_resources, opponent_resources, offered_to){
	socket_submitTradeRequest(requester_resources, opponent_resources, offered_to);
};

var submitTradeCancel = function(){
	socket_submitTradeCancel();
};

var submitTradeAccept = function(requester){
	socket_submitTradeAccept(requester);
};

var submitTradeDecline = function(requester){
	socket_submitTradeDecline(requester);
};