(function() {

    module.exports.addUserToGame = function(gameInfo, user) {

        // set this user's gameid to the game they just joined
        user.gameid = gameInfo.gameid;

        // update gameInfo with new player id
        gameInfo.players.push(user.userid);

    };

    module.exports.addPlayerToReady = function(gameInfo, userid) {
        var index = gameInfo.ready.indexOf(userid);

        if ( index == -1 ){
            gameInfo.ready.push(userid);
            return true;
        }
        return false;
    };

    module.exports.removeUserFromStaging = function(gameInfo, user) {
        var index = gameInfo.players.indexOf(user.userid);

        if (index != -1) {

            gameInfo.players.splice(index, 1);

            if (gameInfo.players.length == 0) {
                gameInfo.status = cons.GAME_CLOSED;
            }

        }
        user.gameid = null;
    };

    module.exports.removePlayerFromReady = function(gameInfo, userid) {
        var index = gameInfo.ready.indexOf(userid);

        if ( index != -1 ) {
            gameInfo.ready.splice(index, 1);
        }
    };

    module.exports.allPlayersReady = function(gameInfo) {
        var players = gameInfo.players;
        var ready = gameInfo.ready;
        // TODO: add a num_players option that the host
        // of the game can set. Only return true if
        // all players ready and all slots are filled
        return (players.length == ready.length);
    };

}());