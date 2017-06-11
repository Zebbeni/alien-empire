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
        console.log("Computer " + users[userid].name + " requesting action:");
        console.log(action)
        var response = game_server.resolveAction(action, gamesInfo[gameid]);

        if (response.to == cons.EVENT_ONE) {
            console.log('computer action response:');
            console.log(response);
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
    var action = createAiCollectResourcesAction(game, playerIndex);
    if (action) {
        return action;
    }
    // TODO FEATURE: Also have computer look for trades before
    // moving on to normal activities
    switch(game.phase) {
        case cons.PHS_PLACING:
            action = createAiPlaceAction(game, playerIndex);
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
    if (gamedata.isPlayerTurn(game, playerIndex)) {
        return createBestMineBuildAction(game, playerIndex, cons.ACT_PLACE);
    }
    return null;
};

var createAiCollectResourcesAction = function(game, playerIndex) {
    console.log('creating ai collect action');
    var resource_pkgs = game.resourcePackages[playerIndex];
    for (var i = 0; i < resource_pkgs.length; i++) {
        var pkg = resource_pkgs[i];
        if (!pkg.collected && pkg.pkgtype != cons.PKG_UPKEEP) {
            if (!gamedata.playerCanCollect(game, playerIndex, pkg.resources)){
                console.log('doing a 4 to 1 action');
                return createAi4To1Action(game, playerIndex);
            }
            console.log('collecting resources action');
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
    // TODO FEATURE:
    //          This should consider retiring agents even if
    //          it *can* pay upkeep for them
    var resource_pkgs = game.resourcePackages[playerIndex];
    for (var i = 0; i < resource_pkgs.length; i++) {
        var pkg = resource_pkgs[i];
        if (pkg.pkgtype == cons.PKG_UPKEEP) {
            if (!pkg.collected && !pkg.cancelled) {
                if (gamedata.playerCanPay(game, playerIndex, pkg.resources)) {
                    return {
                        player: playerIndex,
                        actiontype: cons.ACT_PAY_UPKEEP,
                        pkgindex: i
                    };
                } else {
                    var action = createAi4To1Action(game, playerIndex);
                    if (action != null) {
                        return action;
                    } else {
                        action = createAiRemoveToPayAction(game, playerIndex, pkg.resources);
                        return action;
                    }
                }
            }
        }
    }
    return null;
};

var createAiBuildPhaseAction = function(game, playerIndex) {
    if (gamedata.isPlayerTurn(game, playerIndex)) {
        var action = createBestBuildAction(game, playerIndex);
        if (action) {
            return action;
        }
        action = createBestRecruitAction(game, playerIndex);
        if (action) {
            return action;
        }
        action = createAi4To1Action(game, playerIndex);
        if (action) {
            return action;
        }
        return {
            player: playerIndex,
            actiontype: cons.ACT_TURN_DONE
        };
    }
    return null;
};

var createAiActionPhaseAction = function(game, playerIndex) {
    if (gamedata.isPlayerTurn(game, playerIndex)) {
        var action = createBestBaseAction(game, playerIndex);
        if (action) {
            return action;
        }
        action = createBestFleetAction(game, playerIndex);
        if (action) {
            return action;
        }
        action = createBestAgentAction(game, playerIndex);
        if (action) {
            return action;
        }
        return {
            player: playerIndex,
            actiontype: cons.ACT_TURN_DONE
        };
    }
    return null;
};

// Creates an AI action for the mission resolve phase
// If there is a current mission pending:
//   If it is resolved but not viewed:
//     ACT_MISSION_VIEWED
//   If it is not resolved:
//     If AI has not responded with spy action:
//       ACT_BLOCK_MISSION (true or false)
//     Else IF it is AI's mission:
//        Create Mission Resolve Action
var createAiMissionsPhaseAction = function(game, playerIndex) {
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
                    // TODO FEATURE: create resolve mission action
                }
            } else {
                if (game.missionSpied[playerIndex] == null) {
                    return createAiBlockMissionAction(game, playerIndex, mission);
                }
            }
        }
    }
    return null;
};

// Creates an AI action to either allow, block, or collect from a mission
// TODO FEATURE: add logic to block or collect if AI player has spy eyes
var createAiBlockMissionAction = function(game, playerIndex, mission) {
    return {
        player: playerIndex,
        actiontype: cons.ACT_BLOCK_MISSION,
        choice: false
    };
};

// create an action of the given action type to build a mine on the best available resource
var createBestMineBuildAction = function(game, playerIndex, actionType) {
    var action = null;
    // check if can afford first
    if (actionType != cons.ACT_PLACE) {
        if (!gamedata.playerCanBuild(game, playerIndex, cons.OBJ_MINE)) {
            return null;
        }
    }
    var planets = game.board.planets.filter(function(planet) {
        return planet.explored && (actionType == cons.ACT_PLACE || planet.buildableBy[playerIndex]);
    });
    shuffle(planets);  // shuffle to eliminate being biased to first spots
    var futures = gamedata.getResourceFuturesWithNewStructure(game, playerIndex, cons.OBJ_MINE);
    var greatestNeedFound = 1000; // (greater needs are lower numbers)
    for (var p = 0; p < planets.length; p++) {
        var resources = planets[p].resources;
        for (var r = 0; r < resources.length; r++) {
            if (!resources[r].structure && (resources[r].reserved == undefined || resources[r].reserved == playerIndex)) {
                var kind = resources[r].kind;
                if (futures[kind] < greatestNeedFound) {
                    greatestNeedFound = futures[kind];
                    action = {
                        player: playerIndex,
                        actiontype: actionType,
                        objecttype: cons.OBJ_MINE,
                        resourceid: r,
                        planetid: planets[p].planetid
                    };
                }
            }
        }
    }
    return action;
};

// randomly chooses to try building either an embassy or factory. returns build action if possible
var createBestBuildActionOfType = function(game, playerIndex, objType) {
    var action = null;
    // if object in inventory and if player has required resources
    if (gamedata.playerCanBuild(game, playerIndex, objType)) {
        var futures = gamedata.getResourceFuturesWithNewStructure(game, playerIndex, objType);
        if (objType == cons.OBJ_FACTORY || objType == cons.OBJ_EMBASSY) {
            var planets = game.board.planets.filter(function (planet) {
                return planet.settledBy[playerIndex];
            });
            shuffle(planets);  // shuffle to eliminate being biased to first spots
            var greatestNeedFound = 1000; // (greater needs are lower numbers)
            for (var p = 0; p < planets.length; p++) {
                var resources = planets[p].resources;
                for (var r = 0; r < resources.length; r++) {
                    var structure = resources[r].structure;
                    if (structure && structure.player == playerIndex && structure.kind == cons.OBJ_MINE) {
                        var kind = resources[r].kind;
                        if (futures[kind] < greatestNeedFound) {
                            greatestNeedFound = futures[kind];
                            action = {
                                player: playerIndex,
                                actiontype: cons.ACT_BUILD,
                                objecttype: objType,
                                resourceid: r,
                                planetid: planets[p].planetid
                            };
                        }
                    }
                }
            }
            return action;
        } else if (objType == cons.OBJ_BASE) {
            var planets = game.board.planets.filter(function (planet) {
                return planet.settledBy[playerIndex] && !planet.base;
            });
            var planet = getRandomItem(planets);
            return {
                player: playerIndex,
                actiontype: cons.ACT_BUILD,
                objecttype: cons.OBJ_BASE,
                planetid: planet.planetid
            }
        } else if (objType == cons.OBJ_FLEET) {
            var planets = game.board.planets.filter(function (planet) {
                return planet.base && planet.base.player == playerIndex;
            });
            if (planets.length > 0) {
                return {
                    player: playerIndex,
                    actiontype: cons.ACT_BUILD,
                    objecttype: cons.OBJ_FLEET,
                    planetid: planets[0].planetid
                };
            }
        }
    }
    return null;
};

var createBestBuildAction = function(game, playerIndex) {
    // try to build a mine first.
    var action = createBestMineBuildAction(game, playerIndex, cons.ACT_BUILD);
    if (action) {
        return action;
    }
    // otherwise, attempt to build one of these, prioritized randomly
    var buildTypes = [cons.OBJ_FACTORY, cons.OBJ_EMBASSY, cons.OBJ_BASE, cons.OBJ_FLEET];
    shuffle(buildTypes);
    for (var i = 0; i < buildTypes.length; i++){
        action = createBestBuildActionOfType(game, playerIndex, buildTypes[i]);
        if (action) {
            return action;
        }
    }
    return null;
};

var createBestRecruitAction = function(game, playerIndex) {
    // don't consider recruiting if food resources are already negative
    var futures = gamedata.getResourceFutures(game, playerIndex);
    if (futures[cons.RES_FOOD] < 0) {
        return null;
    }
    // otherwise, attempt to build one of these, prioritized randomly
    var agentTypes = [cons.AGT_AMBASSADOR, cons.AGT_SPY, cons.AGT_ENVOY,
                      cons.AGT_EXPLORER, cons.AGT_MINER, cons.AGT_SURVEYOR,
                      cons.AGT_SABATEUR, cons.AGT_SMUGGLER];
    shuffle(agentTypes);
    for (var i = 0; i < agentTypes.length; i++){
        var agenttype = agentTypes[i];
        if (gamedata.playerCanRecruit(game, playerIndex, agentTypes[i])) {
            var objecttype = cons.AGT_OBJTYPE[agenttype];
            if (objecttype == cons.OBJ_BASE) {
                var planet = gamedata.getBasePlanet(game, playerIndex);
                if (planet) {
                    return {
                        player: playerIndex,
                        actiontype: cons.ACT_RECRUIT,
                        agenttype: agenttype,
                        planetid: planet.planetid
                    }
                }
            } else if (objecttype == cons.OBJ_FACTORY) {
                var planets = gamedata.getFactoryPlanets(game, playerIndex, objecttype);
                var planet = getRandomItem(planets);
                return {
                        player: playerIndex,
                        actiontype: cons.ACT_RECRUIT,
                        agenttype: agenttype,
                        planetid: planet.planetid
                };
            } else if (objecttype == cons.OBJ_EMBASSY) {
                var planets = gamedata.getEmbassyPlanets(game, playerIndex, objecttype);
                var planet = getRandomItem(planets);
                return {
                    player: playerIndex,
                    actiontype: cons.ACT_RECRUIT,
                    agenttype: agenttype,
                    planetid: planet.planetid
                };
            }
        }
    }
    return null;
};

var createBestAgentAction = function(game, playerIndex) {
    var agents = gamedata.getActiveAgents(game, playerIndex);
    if (agents && agents.length > 0) {
        unusedAgents = agents.filter(function() {

        });
    }
    return null;
};

var createBestFleetAction = function(game, playerIndex) {
    var fleets = gamedata.getActiveFleets(game, playerIndex);
    if (fleets && fleets.length > 0) {
        var unusedFleets = fleets.filter(function (fleet) {
            return fleet.used == false;
        });
        if (unusedFleets && unusedFleets.length > 0) {
            var fleet = unusedFleets[0];
            var planet = game.board.planets[fleet.planetid];
            // filter out all mines from attack targets
            var attackTargets = gamedata.getEnemyStructuresOnPlanet(game, playerIndex, planet);
            if (attackTargets.length > 0) {
                var nonMineTargets = attackTargets.filter(function (target) {
                    return cons.STRUCT_REQS[target.objecttype].defense < 6;
                });
                if (nonMineTargets.length > 0) {
                    var attackItem = getRandomItem(nonMineTargets);
                    return {
                        player: playerIndex,
                        actiontype: cons.ACT_FLEET_ATTACK,
                        targetid: fleet.fleetid,
                        targetPlayer: attackItem.targetPlayer,
                        choice: attackItem.choice,
                        objecttype: attackItem.objecttype,
                        planetid: fleet.planetid
                    };
                }
                // if no targets, try moving to an adjacent planet
                var adjacentPlanets = gamedata.getAdjacentUnblockedPlanets(game, fleet.planetid);
                if (adjacentPlanets.length > 0) {
                    choicePlanet = getRandomItem(adjacentPlanets);
                    return {
                        player: playerIndex,
                        actiontype: cons.ACT_FLEET_MOVE,
                        targetid: fleet.fleetid,
                        planetid: choicePlanet.planetid
                    };
                }
            }
        }
    }
    return null;
};

var createBestBaseAction = function(game, playerIndex) {
    var basePlanet = gamedata.getBasePlanet(game, playerIndex);
    if (basePlanet && basePlanet.base.used == false) {
        var attackTargets = gamedata.getEnemyStructuresOnPlanet(game, playerIndex, basePlanet);
        if (attackTargets && attackTargets.length > 0) {
            var nonFleetTargets = attackTargets.filter(function (target) {
                return target.objecttype == cons.OBJ_FLEET;
            });
            if (nonFleetTargets && nonFleetTargets.length > 0) {
                var attackItem = getRandomItem(attackTargets);
                return {
                    player: playerIndex,
                    actiontype: cons.ACT_BASE_ATTACK,
                    targetPlayer: attackItem.targetPlayer,
                    objecttype: attackItem.objecttype,
                    choice: attackItem.choice,
                    planetid: basePlanet.planetid
                };
            }
        }
    }
    return null;
};

// creates a 4 to 1 action to convert the highest future resource type
// into the lowest future type (if possible). Otherwise, returns null.
var createAi4To1Action = function(game, playerIndex) {
    var futures = gamedata.getResourceFutures(game, playerIndex);
    // get resource type of highest future
    var highestFutureResource = -999;
    var surplusResourceType = 0;
    var lowestFutureResource = 999;
    var deficitResourceType = 0;
    for (var r = 0; r < 4; r++) {
        if (futures[r] > highestFutureResource) {
            highestFutureResource = futures[r];
            surplusResourceType = r;
        }
        if (futures[r] < lowestFutureResource) {
            lowestFutureResource = futures[r];
            deficitResourceType = r;
        }
    }
    if (game.resources[playerIndex][surplusResourceType] >= 4) {
        return {
            player: playerIndex,
            actiontype: cons.ACT_TRADE_FOUR_TO_ONE,
            paytype: surplusResourceType,
            gettype: deficitResourceType
        }
    }
    return null;
};

// creates a remove or retire action to bring down costs to pay a
// given list of resources
var createAiRemoveToPayAction = function(game, playerIndex, resources) {
    var typeToEliminate = cons.RES_METAL;
    for (var r = 0; r < resources.length; r++) {
        if (game.resources[playerIndex][r] - resources[r] < 0) {
            typeToEliminate = r;
            break;
        }
    }
    var unitsToRemove = gamedata.getUnitsRequiringUpkeep(game, playerIndex, typeToEliminate);
    var unitToRemove = getRandomItem(unitsToRemove);
    if (unitToRemove.agenttype) {
        return {
            player: playerIndex,
            actiontype: cons.ACT_RETIRE,
            agenttype: unitToRemove.agenttype
        };
    }
    else if (unitToRemove.objecttype == cons.OBJ_FLEET) {
        return {
            player: playerIndex,
            actiontype: cons.ACT_REMOVE_FLEET,
            planetid: unitToRemove.planetid,
            objecttype: cons.OBJ_FLEET,
            targetid: unitToRemove.fleetid
        }
    } else if (unitToRemove.objecttype == cons.OBJ_BASE) {
        return {
            player: playerIndex,
            actiontype: cons.ACT_REMOVE,
            planetid: unitToRemove.planetid,
            objecttype: cons.OBJ_BASE,
            resourceid: cons.RES_NONE
        }
    }
    return {
        player: playerIndex,
        actiontype: cons.ACT_REMOVE,
        planetid: unitToRemove.planetid,
        objecttype: unitToRemove.objectType,
        resourceid: unitToRemove.resourceId
    }
};

// Returns random item from array
function getRandomItem(a) {
    var index = Math.floor(Math.random() * a.length);
    return a[index];
}

// Shuffles array in place
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

(function() {
    module.exports = {
        doAiCycle: doAiCycle
    };
}());