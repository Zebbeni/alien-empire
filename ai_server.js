var cons = require('./server_constants');
var helpers = require('./game_helpers');
var gamedata = require('./game_data');

var doAiCycle = function(io, game_server, gamesInfo, users, aiIndex) {
    for (var gameid = 0; gameid < gamesInfo.length; gameid++) {
        if (gamesInfo[gameid].status == cons.GAME_PROGRESS) {
            var game = gamesInfo[gameid].game;
            for (var p = 0; p < game.players.length; p++){
                if (p == aiIndex) {
                    var userid = game.players[p];
                    if (users[userid].isComputer) {
                        doAIGameAction(io, game_server, gamesInfo, gameid, users, userid);
                    }
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
        case cons.PHS_UPKEEP:
            action = createAiUpkeepPhaseAction(game, playerIndex);
            break;
        case cons.PHS_BUILD:
            action = createAiBuildPhaseAction(game, playerIndex);
            break;
        case cons.PHS_ACTIONS:
            action = createAiActionPhaseAction(game, playerIndex);
            break;
        case cons.PHS_MISSIONS:
            action = createAiMissionsPhaseAction(game, playerIndex);
            break;
        default:
            break;
    }
    return action;
};

var createAiPlaceAction = function(game, playerIndex) {
    console.log('creating ai place action');
    if (gamedata.isPlayerIndexTurn(game, playerIndex)) {
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
    //          This should instead return a createAi4to1Action
    //          if too many resources to collect the package
    var resource_pkgs = game.resourcePackages[playerIndex];
    for (var i = 0; i < resource_pkgs.length; i++) {
        var pkg = resource_pkgs[i];
        if (!pkg.collected && pkg.pkgtype != cons.PKG_UPKEEP) {
            return {
                player: playerIndex,
                actiontype: cons.ACT_COLLECT_RESOURCES,
                pkgindex: i
            };
        }
    }
    return null;
};

var createAiUpkeepPhaseAction = function(game, playerIndex) {
    console.log('creating ai pay upkeep action');
    // TODO:
    // Fix...
    //          This should check if upkeep can be paid and
    //          remove appropriate agents / structures if not
    // Improvement...
    //          This should consider retiring agents even if
    //          it *can* pay upkeep for them
    var resource_pkgs = game.resourcePackages[playerIndex];
    for (var i = 0; i < resource_pkgs.length; i++) {
        var pkg = resource_pkgs[i];
        if (pkg.pkgtype == cons.PKG_UPKEEP) {
            if (!pkg.collected && !pkg.cancelled) {
                return {
                    player: playerIndex,
                    actiontype: cons.ACT_PAY_UPKEEP,
                    pkgindex: i
                };
            }
        }
    }
    return null;
};

var createAiBuildPhaseAction = function(game, playerIndex) {
    if (gamedata.isPlayerIndexTurn(game, playerIndex)) {
        return {
            player: playerIndex,
            actiontype: cons.ACT_TURN_DONE
        };
    }
    return null;
};

var createAiActionPhaseAction = function(game, playerIndex) {
    if (gamedata.isPlayerIndexTurn(game, playerIndex)) {
        return {
            player: playerIndex,
            actiontype: cons.ACT_TURN_DONE
        };
    }
    return null;
};

var createAiMissionsPhaseAction = function(game, playerIndex) {
    // let's create a 'getCurrentMission' function to do these lines.
    // (We do the same thing in game_actions)
    var mission = gamedata.getCurrentMission(game);
    if (mission) {
        if (mission.resolution.resolved) {
            if (!game.missionViewed[playerIndex]) {
                return {
                    player: playerIndex,
                    actiontype: cons.ACT_MISSION_VIEWED,
                    choice: gamedata.getCurrentMissionIndex(game)
                };
            }
        } else {
            if (mission.waitingOnResolve) {
                if (mission.player == playerIndex) {
                    // TODO: create resolve mission action
                }
            } else {
                if (game.missionSpied[playerIndex] == null) {
                    // TODO: create resolve spy action if player has spy eyes
                    return {
                        player: playerIndex,
                        actiontype: cons.ACT_BLOCK_MISSION,
                        choice: false
                    };
                }
            }
        }
    }
    return null;
};

(function() {
    module.exports = {
        doAiCycle: doAiCycle
    };
}());