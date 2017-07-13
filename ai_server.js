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
        if (mission.resolution.resolved || mission.resolution.nochoice || mission.resolution.agentmia) {
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
                    return createAiResolveMissionAction(game, playerIndex, mission);
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
    var choice = false;
    if (mission.player != playerIndex) {
        // decide what action to take if spyeye here
        var planet = game.board.planets[mission.planetTo];
        if (planet.spyeyes[playerIndex] > 0) {
            switch (mission.agenttype){
                case cons.AGT_SABATEUR:
                case cons.AGT_SMUGGLER:
                    // block if settled by player
                    if (planet.settledBy[playerIndex]) {
                        choice = true;
                    }
                    break;
                case cons.AGT_AMBASSADOR:
                case cons.AGT_SPY:
                case cons.AGT_SURVEYOR:
                    // Block 1/2 of the time, otherwise allow
                    choice = Math.random() * 2 < 1 ? true : false;
                    break;
                case cons.AGT_MINER:
                case cons.AGT_ENVOY:
                    // Collect 1/2 of the time, otherwise Block
                    choice = Math.random() * 2 < 1 ? true : null;
                    break;
                case cons.AGT_EXPLORER:
                    choice = false;
                    break;
                default:
                    break;
            }
        }
    }
    return {
        player: playerIndex,
        actiontype: cons.ACT_BLOCK_MISSION,
        choice: choice
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
            if (hasContent(planets)) {
                var planet = getRandomItem(planets);
                return {
                    player: playerIndex,
                    actiontype: cons.ACT_BUILD,
                    objecttype: cons.OBJ_BASE,
                    planetid: planet.planetid
                };
            }
        } else if (objType == cons.OBJ_FLEET) {
            var planets = game.board.planets.filter(function (planet) {
                return planet.base && planet.base.player == playerIndex;
            });
            if (hasContent(planets)) {
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
    var agentTypes = [cons.AGT_EXPLORER, cons.AGT_SABATEUR, cons.AGT_ENVOY];
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
    // listing priority helps prevent players blocking a border
    // before their own agent gets through, or destroying a target embassy
    // before their envoy reaches it
    var agentPriority = [cons.AGT_EXPLORER, cons.AGT_ENVOY, cons.AGT_SPY, cons.AGT_SABATEUR];
    var agents = gamedata.getActiveAgents(game, playerIndex);
    if (agents && agents.length > 0) {
        var unusedAgents = agents.filter(function(agent) {
            return agent.used == false;
        });
        if (unusedAgents && unusedAgents.length > 0) {
            for (var a = 0; a < agentPriority.length; a++) {
                for (var u = 0; u < unusedAgents.length; u++) {
                    if (unusedAgents[u].agenttype == agentPriority[a]) {
                        switch (unusedAgents[u].agenttype) {
                            case cons.AGT_EXPLORER:
                                return createBestExplorerAction(game, playerIndex, unusedAgents[u]);
                            case cons.AGT_SPY:
                                return createBestSpyAction(game, playerIndex, unusedAgents[u]);
                            case cons.AGT_ENVOY:
                                return createBestEnvoyAction(game, playerIndex, unusedAgents[u]);
                            case cons.AGT_SABATEUR:
                                return createBestSabateurAction(game, playerIndex, unusedAgents[u]);
                            default:
                                break;
                        }
                    }
                }
            }
        }
    }
    return null;
};

var createBestExplorerAction = function(game, playerIndex, agentInfo) {
    var unexploredAdjacent = gamedata.getAdjacentUnexploredPlanets(game, agentInfo.planetid);
    if (unexploredAdjacent && unexploredAdjacent.length > 0) {
        var chosenPlanet;
        var unexploredLarge = unexploredAdjacent.filter(function(planet) {
            return planet.w == 2;
        });
        if (hasContent(unexploredLarge)) {
            chosenPlanet = getRandomItem(unexploredLarge);
        } else {
            chosenPlanet = getRandomItem(unexploredAdjacent);
        }
        return {
            player: playerIndex,
            actiontype: cons.ACT_LAUNCH_MISSION,
            agenttype: cons.AGT_EXPLORER,
            planetid: chosenPlanet.planetid
        };
    }
    // try moving to an adjancent planet if no adjacent unexplored planets
    var unblockedAdjacent = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid);
    if (hasContent(unblockedAdjacent)) {
        var chosenPlanet = getRandomItem(unblockedAdjacent);
        return {
            player: playerIndex,
            actiontype: cons.ACT_MOVE_AGENT,
            agenttype: cons.AGT_EXPLORER,
            planetid: chosenPlanet.planetid
        };
    }
    // if no other options, just explore current planet
    // TODO FEATURE: Check if Smuggler is here and unused. If so, create mission to blocked planet
    return {
        player: playerIndex,
        actiontype: cons.ACT_LAUNCH_MISSION,
        agenttype: cons.AGT_EXPLORER,
        planetid: agentInfo.planetid
    };
};

var createBestSpyAction = function(game, playerIndex, agentInfo) {
    var chosenPlanet = game.board.planets[agentInfo.planetid];
    var unblockedAdjacent = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid);
    if (hasContent(unblockedAdjacent)) {
        chosenPlanet = getRandomItem(unblockedAdjacent);
    }
    return {
        player: playerIndex,
        actiontype: cons.ACT_LAUNCH_MISSION,
        agenttype: cons.AGT_SPY,
        planetid: chosenPlanet.planetid
    };
};

// TODO FEATURE: Check through planets for best place to send envoy
var createBestEnvoyAction = function(game, playerIndex, agentInfo) {
    var chosenPlanet = game.board.planets[agentInfo.planetid];
    var unblockedAdjacent = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid);
    if (hasContent(unblockedAdjacent)) {
        chosenPlanet = getRandomItem(unblockedAdjacent);
    }
    return {
        player: playerIndex,
        actiontype: cons.ACT_LAUNCH_MISSION,
        agenttype: cons.AGT_ENVOY,
        planetid: chosenPlanet.planetid
    };
};

// TODO FEATURE: Check through planets and players for best place to attack
var createBestSabateurAction = function(game, playerIndex, agentInfo) {
    var unblockedPlanets = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid);
    // default to current planet if all adjacent planets are blocked
    var chosenPlanet = game.board.planets[agentInfo.planetid];
    if (hasContent(unblockedPlanets)) {
        chosenPlanet = getRandomItem(unblockedPlanets);
    }
    return {
        player: playerIndex,
        actiontype: cons.ACT_LAUNCH_MISSION,
        agenttype: cons.AGT_SABATEUR,
        planetid: chosenPlanet.planetid
    };
};

var createBestFleetAction = function(game, playerIndex) {
    var fleets = gamedata.getActiveFleets(game, playerIndex);
    if (hasContent(fleets)) {
        var unusedFleets = fleets.filter(function (fleet) {
            return fleet.used == false;
        });
        if (hasContent(unusedFleets)) {
            var fleet = unusedFleets[0];
            var planet = game.board.planets[fleet.planetid];
            // filter out all mines from attack targets
            var attackTargets = gamedata.getEnemyStructuresOnPlanet(game, playerIndex, planet);
            if (hasContent(attackTargets)) {
                var nonMineTargets = attackTargets.filter(function (target) {
                    return cons.STRUCT_REQS[target.objecttype].defense < 6;
                });
                if (hasContent(nonMineTargets)) {
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
                if (hasContent(adjacentPlanets)) {
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
        if (hasContent(attackTargets)) {
            var fleetTargets = attackTargets.filter(function (target) {
                return target.objecttype == cons.OBJ_FLEET;
            });
            if (hasContent(fleetTargets)) {
                var attackItem = getRandomItem(fleetTargets);
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

var createAiResolveMissionAction = function(game, playerIndex, mission) {
    var agenttype = mission.agenttype;
    var planetid = mission.planetTo;
    var planet = game.board.planets[planetid];
    switch (agenttype) {
        case cons.AGT_EXPLORER:
            var action = null;
            var futures = gamedata.getResourceFutures(game, playerIndex);
            var resources = planet.resources;
            var greatestNeedFound = 1000; // (greater needs are lower numbers)
            for (var r = 0; r < resources.length; r++) {
                var resource = resources[r];
                if (!resource.structure && resource.reserved == undefined) {
                    var kind = resource.kind;
                    if (futures[kind] < greatestNeedFound) {
                        greatestNeedFound = futures[kind];
                        action = {
                            player: playerIndex,
                            agenttype: agenttype,
                            actiontype: cons.ACT_MISSION_RESOLVE,
                            resourceid: r,
                            planetid: planetid
                        };
                    }
                }
            }
            if (action) {
                return action;
            }
            // if no resources can be reserved, resolve with undefined
            return {
                player: playerIndex,
                agenttype: agenttype,
                actiontype: cons.ACT_MISSION_RESOLVE,
                resourceid: undefined,
                planetid: planetid
            };
        case cons.AGT_SPY:
        case cons.AGT_ENVOY:
            return {
                player: playerIndex,
                agenttype: agenttype,
                actiontype: cons.ACT_MISSION_RESOLVE,
                planetid: planetid
            };
        case cons.AGT_SABATEUR:
            var attackTargets = gamedata.getEnemyStructuresOnPlanet(game, playerIndex, planet);
            if (hasContent(attackTargets)) {
                var attackItem = getRandomItem(attackTargets);
                return {
                    player: playerIndex,
                    agenttype: agenttype,
                    actiontype: cons.ACT_MISSION_RESOLVE,
                    targetPlayer: attackItem.targetPlayer,
                    choice: attackItem.choice,
                    resourceid: attackItem.choice,
                    objecttype: attackItem.objecttype,
                    planetid: planetid
                };
            }
            return {
                player: playerIndex,
                agenttype: agenttype,
                actiontype: cons.ACT_MISSION_RESOLVE,
                planetid: planetid
            };
        default:
            break;
    }
    return null;
};

// Returns random item from array
function getRandomItem(a) {
    var index = Math.floor(Math.random() * a.length);
    return a[index];
}

// Returns true if an array is not null and has > 0 item
function hasContent(a) {
    return a && a.length > 0;
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