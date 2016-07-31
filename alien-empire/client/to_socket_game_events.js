var socket_loadingDone = function() {

	var action = {
					player: clientTurn,
					actiontype: ACT_LOADED_ASSETS
				};

	socket.emit('do game action', clientGame.gameid, action, function(data){
		console.log('loaded assets: ', data);
	});
};

var socket_submitAction = function() {

	var action = pendingAction;

	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('server received game action:', data);
	});

};

var socket_submitTurnDone = function() {

	var action = { 
					player: clientTurn,
					actiontype: ACT_TURN_DONE
				 };

    socket.emit('do game action', clientGame.gameid, action, function(data){
        console.log('finished turn: ', data);
    });
};

var socket_submitCollectResources = function(pkgindex) {
	var action = {	
					pkgindex: pkgindex,
					player: clientTurn,
					actiontype: ACT_COLLECT_RESOURCES
				 };

	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('collecting resources: ', data);
	});
}

var socket_submitPayUpkeep = function(pkgindex) {
	var action = {	
					pkgindex: pkgindex,
					player: clientTurn,
					actiontype: ACT_PAY_UPKEEP
				};
	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('paying upkeep: ', data);
	});
};

var socket_submitTradeFourToOne = function(pay, get){
	var action = {
		player: clientTurn,
		actiontype: ACT_TRADE_FOUR_TO_ONE,
		paytype: pay,
		gettype: get
	};

	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('four to one trading: ', data);
	});
};

var socket_submitTradeRequest = function(requester_resources, opponent_resources, offered_to){
	var action = {
		player: clientTurn,
		actiontype: ACT_TRADE_REQUEST,
		requester_resources: requester_resources,
		opponent_resources: opponent_resources,
		offered_to: offered_to
	};

	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('requesting a trade');
	});
};

var socket_submitTradeCancel = function() {
	var action = {
		player: clientTurn,
		actiontype: ACT_TRADE_CANCEL
	};

	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('cancelling a trade');
	});
};

var socket_submitTradeAccept = function(requester) {
	var action = {
		actiontype: ACT_TRADE_ACCEPT,
		player: clientTurn,
		requester: requester,
	};

	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('accepting a trade');
	});
};

var socket_submitTradeDecline = function(requester) {
	var action = {
		actiontype: ACT_TRADE_DECLINE,
		player: clientTurn,
		requester: requester
	};

	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('declining a trade');
	});
};

/**
 * This is a stand-in, to allow mission phase to be passed. Eventually
 * this should be more developed.
 */
var socket_submitMissionsViewed = function() {
	var action = {
					player: clientTurn,
					actiontype: ACT_VIEWED_MISSIONS
				};
	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('viewed missions: ', data);
	});
};