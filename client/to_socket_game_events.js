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

var socket_submitPayUpkeep = function() {
	var action = {
					player: clientTurn,
					actiontype: ACT_PAY_UPKEEP
				};
	socket.emit('do game action', clientGame.gameid, action, function(data) {
		console.log('payint upkeep: ', data);
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