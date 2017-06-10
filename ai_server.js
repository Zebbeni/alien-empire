var cons = require('./server_constants');
var helpers = require('./game_helpers');

var doAiCycle = function(io, game_server, gamesInfo, users) {
    for (var gameid = 0; gameid < gamesInfo.length; gameid++) {
        if (gamesInfo[gameid].status == cons.GAME_PROGRESS) {
            var game = gamesInfo[gameid].game;
            for (var p = 0; p < game.players.length; p++){
                var userid = game.players[p];
                if (users[userid].isComputer) {
                    doAIGameAction(io, game_server, gamesInfo, gameid, users, userid);
                }
            }
        }
    }
};

var doAIGameAction = function(io, game_server, gamesInfo, gameid, users, userid) {
    var game = gamesInfo[gameid].game;
    var playerIndex = game.players.indexOf(userid);
    var action = createAiGameAction(game, playerIndex);

    if (action) {
        console.log("Computer player " + users[userid].name + " requesting a game action");
        var response = game_server.resolveAction(action, gamesInfo[gameid]);

        if (response.to == cons.EVENT_ONE) {
            console.log('computer action response: ' + response.response);
        }
        else if (response.to == cons.EVENT_ALL) {
            var newMsg = helpers.addGameActionMessage(gamesInfo[gameid],
                userid,
                action);
            io.in(gamesInfo[gameid].room).emit(response.evnt, response.content, newMsg);
        }
    }
};

// return an action for the computer player to request
// or return null if no action appropriate.
var createAiGameAction = function(game, playerIndex) {
    var action = null;
    switch(game.phase) {
        case cons.PHS_PLACING:
            action = createAiPlaceAction(game, playerIndex);
            break;
        case cons.PHS_RESOURCE:
            action = createAiCollectResourcesAction(game, playerIndex);
            break;
        default:
            break;
    }
    return action;
};

var createAiPlaceAction = function(game, playerIndex) {
    console.log('creating ai place action');
    if (game.playerTurn == playerIndex) {
        var planets = game.board.planets;
        var explored = planets.filter(function(planet) {
            return planet.explored;
        });
        // places a mine on the first free resource square it finds
        // TODO:
        // Improvements...
        //                 randomly sort explored planets first
        //                 randomly sort resources first
        // Better Improvements...
        //                 check current collection / upkeep numbers,
        //                 look for resource types most lacking
        for (var p = 0; p < explored.length; p++) {
            var resources = explored[p].resources;
            for (var r = 0; r < resources.length; r++) {
                if (!resources[r].structure) {
                    return {
                        player: playerIndex,
                        actiontype: cons.ACT_PLACE,
                        objecttype: cons.OBJ_MINE,
                        resourceid: r,
                        planetid: explored[p].planetid
                    };
                }
            }
        }
    }
    return null;
};

var createAiCollectResourcesAction = function(game, playerIndex) {
    console.log('creating ai collect action');
    // TODO:
    // Fix...
    //                      This should instead return a createAi4to1Action
    //                      if too many resources to collect the package
    var resource_pkgs = game.resourcePackages[playerIndex];
    for (var i = 0; i < resource_pkgs.length; i++) {
        if (!resource_pkgs[i].collected) {
            return {
                player: playerIndex,
                actiontype: cons.ACT_COLLECT_RESOURCES,
                pkgindex: i
            };
        }
    }
    return null;
};

(function() {
    module.exports = {
        doAiCycle: doAiCycle
    };
}());