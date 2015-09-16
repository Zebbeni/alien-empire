var socket_loadingDone = function() {

	var action = {
					userid: clientId,
					actiontype: ACT_LOADED_ASSETS
				};

	socket.emit('do game action', clientGame.gameid, action, function(data){
		console.log('finished loading assets: ', data);
	});
};

var socket_submitTurnDone = function() {

	var action = { 
					userid: clientId,
					actiontype: ACT_TURN_DONE
				 };

    socket.emit('do game action', clientGame.gameid, action, function(data){
        console.log('finished turn: ', data);
    });
};