var socket_submitTurnDone = function() {

	var action = { 
					userid: clientId,
					actiontype: ACT_TURN_DONE,
					gameid: clientGame.gameid
				 };

    socket.emit('do game action', action, function(data){
        console.log('finished turn: ', data);
    });
};