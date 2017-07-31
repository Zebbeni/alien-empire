var cons = require('./server_constants');
var helpers = require('./game_helpers');
var gamedata = require('./game_data');
var utils = require('./utils');

var doAiCycle = function(io, game_server, gamesInfo, users, aiIndex) {
    for (var gameid = 0; gameid < gamesInfo.length; gameid++) {
        if (gamesInfo[gameid].status == cons.GAME_PROGRESS) {
            var game = gamesInfo[gameid].game;
            for (var p = 0; p < game.players.length; p++){
                if (p == aiIndex) {
                    var userid = game.players[p];
                    if (users[userid].isComputer) {
                        if (doAIGameAction(io, game_server, gamesInfo, gameid, users, userid)){
                            return; // only do one user action per ai cycle per game
                        }
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
    action = createAiTradeCancelAction(game, playerIndex);
    if (action) {
        return action;
    }
    action = createAiTradeResponseAction(game, playerIndex); // consider other players' trades
    if (action) {
        return action;
    }
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
    if (action) {
        return action;
    }
    return action;
};

var createAiPlaceAction = function(game, playerIndex) {
    if (gamedata.isPlayerTurn(game, playerIndex)) {
        return createBestMineBuildAction(game, playerIndex, cons.ACT_PLACE);
    }
    return null;
};

var createAiCollectResourcesAction = function(game, playerIndex) {
    var resource_pkgs = game.resourcePackages[playerIndex];
    for (var i = 0; i < resource_pkgs.length; i++) {
        var pkg = resource_pkgs[i];
        if (!pkg.collected && pkg.pkgtype != cons.PKG_UPKEEP) {
            if (!gamedata.playerCanCollect(game, playerIndex, pkg.resources)){
                return createAi4To1Action(game, playerIndex, true);
            }
            return {
                player: playerIndex,
                actiontype: cons.ACT_COLLECT_RESOURCES,
                pkgindex: i
            };
        }
    }
    return null;
};

// If currently waiting for responses on an offered trade,
// check if trade should be cancelled and cancel if so.
// Reasons for cancelling:
// - Game not in a phase where ai should offer trades
// - All players declined trade offer
// - Time for all players to respond has expired
// - AI player no longer has resources required for trade offer
var createAiTradeCancelAction = function(game, playerIndex) {
    if (game.trades[playerIndex]) {
        var cancelAction = {
            actiontype: cons.ACT_TRADE_CANCEL,
            player: playerIndex
        };
        if (game.phase != cons.PHS_UPKEEP && game.phase != cons.PHS_BUILD) {
            // not a good phase for making offers
            return cancelAction;
        }
        var trade = game.trades[playerIndex];
        if (trade.declined.length == trade.offered_to.length) {
            // all declined
            return cancelAction;
        }
        if ((Date.now() / 1000) - trade.time_offered > 20) {
            // time has expired
            return cancelAction;
        }
        for (var r = 0; r < trade.requester_resources.length; r++) {
            if (game.resources[playerIndex][r] < trade.requester_resources[r]) {
                // can no longer afford trade
                return cancelAction;
            }
        }
    }
    return null;
};

// look for other players' pending trade requests and accept or decline them
var createAiTradeResponseAction = function(game, playerIndex) {
    var playerResources = game.resources[playerIndex];
    var futures = gamedata.getResourceFutures(game, playerIndex);
    var futureScore = utils.getResourcesScore(futures);
    // consider other players' trade offers before offering a new one (if they exist)
    for (var t = 0; t < game.trades.length; t++) {
        if (game.trades[t]){
            var trade = game.trades[t];
            var offeredToPlayer = trade.offered_to.indexOf(playerIndex) != -1;
            var declinedByPlayer = trade.declined.indexOf(playerIndex) != -1;
            var time_since_offer = (Date.now() / 1000) - trade.time_offered;
            // wait 10 seconds to consider trade to give human players a chance
            if (offeredToPlayer && !declinedByPlayer && time_since_offer > 10) {
                var requested = trade.opponent_resources;
                var offered = trade.requester_resources;
                var futuresWithTrade = [0,0,0,0];
                for (var r = 0; r < requested.length; r++) {
                    // decline if not enough resources to make trade
                    if (requested[r] > playerResources[r]) {
                        return {
                            actiontype: cons.ACT_TRADE_DECLINE,
                            player: playerIndex,
                            requester: t
                        };
                    }
                    futuresWithTrade[r] = futures[r] + offered[r] - requested[r];
                }
                var futureScoreWithTrade = utils.getResourcesScore(futuresWithTrade);
                if (futureScoreWithTrade > futureScore) {
                    return {
                        actiontype: cons.ACT_TRADE_ACCEPT,
                        player: playerIndex,
                        requester: t
                    };
                } else {
                    return {
                        actiontype: cons.ACT_TRADE_DECLINE,
                        player: playerIndex,
                        requester: t
                    };
                }
            }
        }
    }
    return null;
};

var createAiTradeOfferAction = function(game, playerIndex) {
    // if player has no pending trade offer and past time allowed for next trade offer
    // try crafting a new (reasonable) trade offer
    var noCurrentTradePending = !game.trades[playerIndex];
    var timeElapsed = game.time_next_trade_allowed[playerIndex] < (Date.now() / 1000);
    if (noCurrentTradePending && timeElapsed) {
        var playerResources = game.resources[playerIndex];
        var futures = gamedata.getResourceFutures(game, playerIndex);
        var futureScore = utils.getResourcesScore(futures);
        var minFutureKind = -1;
        var minFutureNum = 999;
        for (var r = 0; r < futures.length; r++) {
            if (futures[r] < minFutureNum) {
                minFutureKind = r;
                minFutureNum = futures[r];
            }
        }

        var offerContainsResource = false; // flag to indicate offer has at least one resource
        var bestOffer = [0,0,0,0];
        var resourceKinds = [cons.RES_METAL, cons.RES_WATER, cons.RES_FUEL, cons.RES_FOOD];
        utils.shuffle(resourceKinds);

        var futuresWithTrade = futures.slice(); // copy by value
        futuresWithTrade[minFutureKind] += 1; // assume only trading for 1 of this resource type

        // for each resource kind, (if not the kind the ai player wants)
        // calculate new potential future score if added to the offered resources.
        // add to the bestOffer if the package still meets requirements to trade.
        for (var k = 0; k < resourceKinds.length; k++) {
            var kind = resourceKinds[k];
            if (kind != minFutureKind) {
                for (var r = Math.min(playerResources[kind], 3); r > 0; r--) {
                    var testFuturesWithTrade = futuresWithTrade.slice(); // copyFuturesWithTrade again
                    testFuturesWithTrade[kind] -= 1;
                    var futureScoreWithTrade = utils.getResourcesScore(testFuturesWithTrade);
                    if (futureScoreWithTrade > futureScore) {
                        offerContainsResource = true;
                        bestOffer[kind] += 1;
                        futuresWithTrade[kind] -= 1;
                    }
                }
            }
        }

        if (offerContainsResource) {
            var opponent_resources = [0, 0, 0, 0];
            opponent_resources[minFutureKind] += 1;
            var offered_to = [];
            for (var p = 0; p < game.players.length; p++) {
                if (p != playerIndex) {
                    offered_to.push(p);
                }
            }
            return {
                actiontype: cons.ACT_TRADE_REQUEST,
                player: playerIndex,
                requester_resources: bestOffer,
                opponent_resources: opponent_resources,
                offered_to: offered_to
            }
        }

    }
    return null;
};

var createAiUpkeepPhaseAction = function(game, playerIndex) {
    var resource_pkgs = game.resourcePackages[playerIndex];
    for (var i = 0; i < resource_pkgs.length; i++) {
        var pkg = resource_pkgs[i];
        if (pkg.pkgtype == cons.PKG_UPKEEP) {
            if (!pkg.collected && !pkg.cancelled) {
                var action = createBestRetireBeforeUpkeepAction(game, playerIndex);
                if (action) {
                    return action;
                }
                if (gamedata.playerCanPay(game, playerIndex, pkg.resources)) {
                    return {
                        player: playerIndex,
                        actiontype: cons.ACT_PAY_UPKEEP,
                        pkgindex: i
                    };
                } else {
                    // fall through to null if waiting on a pending trade offer
                    if (!game.trades[playerIndex]) {
                        var action = createAiTradeOfferAction(game, playerIndex);
                        if (action) {
                            return action;
                        }
                        action = createAi4To1Action(game, playerIndex, false);
                        if (action) {
                            return action;
                        }
                        action = createAiRemoveToPayAction(game, playerIndex, pkg.resources);
                        if (action) {
                            return action;
                        }
                    }
                }
            }
        }
    }
    return null;
};

var createBestRetireBeforeUpkeepAction = function(game, playerIndex) {
    // remove explorer if all exploration points taken
    if (game.points[cons.PNT_EXPLORE] <= 0) {
        var explorer = game.board.agents[String(playerIndex) + String(cons.AGT_EXPLORER)];
        if (explorer.status == cons.AGT_STATUS_ON) {
            return {
                player: playerIndex,
                actiontype: cons.ACT_RETIRE,
                agenttype: cons.AGT_EXPLORER
            };
        }
    }
    // remove envoy if all envoy points taken
    if (game.points[cons.PNT_ENVOY] <= 0) {
        var envoy = game.board.agents[String(playerIndex) + String(cons.AGT_ENVOY)];
        if (envoy.status == cons.AGT_STATUS_ON) {
            return {
                player: playerIndex,
                actiontype: cons.ACT_RETIRE,
                agenttype: cons.AGT_ENVOY
            };
        }
    }
    // remove surveyor after 3 successful surveyor missions completed
    if (game.num_surveyor_missions[playerIndex] >= 3) {
        var surveyor = game.board.agents[String(playerIndex) + String(cons.AGT_SURVEYOR)];
        if (surveyor.status == cons.AGT_STATUS_ON) {
            return {
                player: playerIndex,
                actiontype: cons.ACT_RETIRE,
                agenttype: cons.AGT_SURVEYOR
            };
        }
    }
    // remove ambassador if no other possible borders to block
    var ambassador = game.board.agents[String(playerIndex) + String(cons.AGT_SURVEYOR)];
    if (ambassador.status == cons.AGT_STATUS_ON) {
        var adjacentUnblocked = gamedata.getAdjacentUnblockedPlanets(game, ambassador.planetid, false);
        var adjacentUnexplored = gamedata.getAdjacentUnexploredPlanets(game, ambassador.planetid, false);
        if (!utils.hasContent(adjacentUnblocked) && !utils.hasContent(adjacentUnexplored)) {
            return {
                player: playerIndex,
                actiontype: cons.ACT_RETIRE,
                agenttype: cons.AGT_AMBASSADOR
            };
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
        // fall through to null if waiting on a pending trade offer
        if (!game.trades[playerIndex]) {
            var action = createAiTradeOfferAction(game, playerIndex);
            if (action) {
                return action;
            }
            action = createAi4To1Action(game, playerIndex, false);
            if (action) {
                return action;
            }
            return {
                player: playerIndex,
                actiontype: cons.ACT_TURN_DONE
            };
        }
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
    var missionIndex = gamedata.getCurrentMissionIndex(game);
    if (mission) {
        if (mission.spyActions[playerIndex] == cons.SPY_ACT_NULL) {
            console.log('-- player ' + playerIndex + ' spying (t/f) on mission ' + missionIndex + ' --');
            return createAiBlockMissionAction(game, playerIndex, mission);
        }
        if (mission.status != cons.MISSION_UNRESOLVED && mission.status != cons.MISSION_PENDING_CHOICE) {
            if (mission.viewers[playerIndex] == false) {
                console.log('-- player ' + playerIndex + ' viewing mission ' + missionIndex + ' --');
                return {
                    player: playerIndex,
                    actiontype: cons.ACT_MISSION_VIEWED,
                    choice: missionIndex
                };
            }
        }
        if (mission.status == cons.MISSION_PENDING_CHOICE && mission.player == playerIndex) {
            console.log('-- player ' + playerIndex + ' resolving mission ' + missionIndex + ' --');
            return createAiResolveMissionAction(game, playerIndex, mission);
        }
    }
    return null;
};

// Creates an AI action to either allow, block, or collect from a mission
// TODO FEATURE: add logic to block or collect if AI player has spy eyes
var createAiBlockMissionAction = function(game, playerIndex, mission) {
    var choice = cons.SPY_ACT_ALLOW;
    if (mission.status == cons.MISSION_BLOCKED_NO_FLY
        || mission.status == cons.MISSION_CANCELLED_NO_AGENT
        || mission.status == cons.MISSION_RESOLVED_NO_CHOICE) {
        choice = cons.SPY_ACT_ALLOW;
    } else if (mission.player != playerIndex) {
        // decide what action to take if spyeye here
        var planet = game.board.planets[mission.planetTo];
        if (planet.spyeyes[playerIndex] > 0) {
            switch (mission.agenttype) {
                case cons.AGT_SABATEUR:
                case cons.AGT_SMUGGLER:
                    // block if settled by player
                    if (planet.settledBy[playerIndex]) {
                        choice = cons.SPY_ACT_BLOCK;
                    }
                    break;
                case cons.AGT_AMBASSADOR:
                case cons.AGT_SPY:
                case cons.AGT_SURVEYOR:
                    // Block 1/2 of the time, otherwise allow
                    if (Math.random() * 2 < 1) {
                        choice = cons.SPY_ACT_BLOCK;
                    }
                    break;
                case cons.AGT_MINER:
                case cons.AGT_ENVOY:
                    // Collect 1/2 of the time, otherwise Block
                    choice = Math.random() < 0.8 ? cons.SPY_ACT_COLLECT : cons.SPY_ACT_BLOCK;
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
    utils.shuffle(planets);  // shuffle to eliminate being biased to first spots
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
    var futuresWithStructure = gamedata.getResourceFuturesWithNewStructure(game, playerIndex, objType);
    var avoidsDeficit = true;
    for (var f = 0; f < futuresWithStructure.length; f++) {
        if (futuresWithStructure[f] < 0) {
            avoidsDeficit = false;
        }
    }
    // if object in inventory and if player has required resources
    if (gamedata.playerCanBuild(game, playerIndex, objType)) {
        if (objType == cons.OBJ_FACTORY || objType == cons.OBJ_EMBASSY) {
            var planets = game.board.planets.filter(function (planet) {
                return planet.settledBy[playerIndex];
            });
            utils.shuffle(planets);  // shuffle to eliminate being biased to first spots
            var greatestNeedFound = 1000; // (greater needs are lower numbers)
            var onSurveyedResource = true; // initialize to false. prioritize first choice on non-bumped resource.
            for (var p = 0; p < planets.length; p++) {
                var resources = planets[p].resources;
                for (var r = 0; r < resources.length; r++) {
                    var structure = resources[r].structure;
                    if (structure && structure.player == playerIndex && structure.kind == cons.OBJ_MINE) {
                        var kind = resources[r].kind;
                        avoidsDeficit = true;
                        // futures compensating for whatever extra resource we pick up here
                        var futuresWithStructureHere = futuresWithStructure.slice();
                        if (resources[r].num == 1) {
                            futuresWithStructureHere[kind] += 2;
                        }
                        for (var f = 0; f < futuresWithStructureHere.length; f++) {
                            if (futuresWithStructureHere[f] < 0) {
                                avoidsDeficit = false;
                            }
                        }
                        if (avoidsDeficit) {
                            if ((futuresWithStructure[kind] < greatestNeedFound && resources[r].num == 1)
                                || ( onSurveyedResource && resources[r].num == 1)
                                || ( onSurveyedResource && futuresWithStructure[kind] < greatestNeedFound)) {
                                if (resources[r].num == 1) {
                                    // set flag so surveyed resources are not chosen over this one.
                                    onSurveyedResource = false;
                                }
                                greatestNeedFound = futuresWithStructure[kind];
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
            }
            return action;
        } else if (objType == cons.OBJ_BASE) {
            if (avoidsDeficit) {
                var planets = game.board.planets.filter(function (planet) {
                    return planet.settledBy[playerIndex] && !planet.base;
                });
                if (utils.hasContent(planets)) {
                    utils.shuffle(planets);
                    var maxStructuresOnPlanet = 0;
                    var planet;
                    for (var p = 0; p < planets.length; p++) {
                        var numStructures = gamedata.getNumStructuresOnPlanet(game, planets[p], playerIndex);
                        if (numStructures > maxStructuresOnPlanet) {
                            planet = planets[p];
                            maxStructuresOnPlanet = numStructures;
                        }
                    }
                    if (planet) {
                        return {
                            player: playerIndex,
                            actiontype: cons.ACT_BUILD,
                            objecttype: cons.OBJ_BASE,
                            planetid: planet.planetid
                        };
                    }
                }
            }
        } else if (objType == cons.OBJ_FLEET) {
            if (avoidsDeficit) {
                var planets = game.board.planets.filter(function (planet) {
                    return planet.base && planet.base.player == playerIndex;
                });
                if (utils.hasContent(planets)) {
                    return {
                        player: playerIndex,
                        actiontype: cons.ACT_BUILD,
                        objecttype: cons.OBJ_FLEET,
                        planetid: planets[0].planetid
                    };
                }
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
    action = createBestBuildActionOfType(game, playerIndex, cons.OBJ_BASE);
    if (action) {
        return action;
    }
    // otherwise, attempt to build one of these
    // TODO: Order these in priority according to ai strategy
    var buildTypes = [cons.OBJ_FACTORY, cons.OBJ_EMBASSY, cons.OBJ_FLEET];
    utils.shuffle(buildTypes);
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
    if (futures[cons.RES_FOOD] <= 0) {
        return null;
    }
    // otherwise, attempt to build one of these, prioritized randomly
    var agentTypes = [cons.AGT_EXPLORER, cons.AGT_MINER, cons.AGT_SURVEYOR, cons.AGT_SPY, cons.AGT_ENVOY, cons.AGT_AMBASSADOR, cons.AGT_SABATEUR, cons.AGT_SMUGGLER];
    // TODO: prioritize according to a specific ai strategy, not randomly.
    utils.shuffle(agentTypes);
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
                var planet = utils.getRandomItem(planets);
                return {
                        player: playerIndex,
                        actiontype: cons.ACT_RECRUIT,
                        agenttype: agenttype,
                        planetid: planet.planetid
                };
            } else if (objecttype == cons.OBJ_EMBASSY) {
                if (agenttype == cons.AGT_AMBASSADOR) {
                    var atLeastTwoStructures = false;
                    for (var p = 0; p < game.board.planets.length; p++) {
                        if (gamedata.getNumStructuresOnPlanet(game, game.board.planets[p], playerIndex) >= 2) {
                            atLeastTwoStructures = true;
                        }
                    }
                    if (atLeastTwoStructures == false) {
                        // don't recruit yet if not worth it
                        break;
                    }
                }
                var planets = gamedata.getEmbassyPlanets(game, playerIndex, objecttype);
                var planet = utils.getRandomItem(planets);
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
    var agentPriority = [cons.AGT_EXPLORER, cons.AGT_MINER, cons.AGT_ENVOY, cons.AGT_SMUGGLER, cons.AGT_SPY, cons.AGT_SABATEUR, cons.AGT_SURVEYOR, cons.AGT_AMBASSADOR];
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
                            case cons.AGT_MINER:
                                return createBestMinerAction(game, playerIndex, unusedAgents[u]);
                            case cons.AGT_SPY:
                                return createBestSpyAction(game, playerIndex, unusedAgents[u]);
                            case cons.AGT_ENVOY:
                                return createBestEnvoyAction(game, playerIndex, unusedAgents[u]);
                            case cons.AGT_SABATEUR:
                                return createBestSabateurAction(game, playerIndex, unusedAgents[u]);
                            case cons.AGT_SMUGGLER:
                                return createBestSmugglerAction(game, playerIndex, unusedAgents[u]);
                            case cons.AGT_SURVEYOR:
                                return createBestSurveyorAction(game, playerIndex, unusedAgents[u]);
                            case cons.AGT_AMBASSADOR:
                                return createBestAmbassadorAction(game, playerIndex, unusedAgents[u]);
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
    var unexploredAdjacent = gamedata.getAdjacentUnexploredPlanets(game, agentInfo.planetid, false);
    if (unexploredAdjacent && unexploredAdjacent.length > 0) {
        var chosenPlanet;
        var unexploredLarge = unexploredAdjacent.filter(function(planet) {
            return planet.w == 2;
        });
        if (utils.hasContent(unexploredLarge)) {
            chosenPlanet = utils.getRandomItem(unexploredLarge);
        } else {
            chosenPlanet = utils.getRandomItem(unexploredAdjacent);
        }
        return {
            player: playerIndex,
            actiontype: cons.ACT_LAUNCH_MISSION,
            agenttype: cons.AGT_EXPLORER,
            planetid: chosenPlanet.planetid
        };
    }
    // try moving to an adjancent planet if no adjacent unexplored planets
    var unblockedAdjacent = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid, false);
    if (utils.hasContent(unblockedAdjacent)) {
        var chosenPlanet = utils.getRandomItem(unblockedAdjacent);
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

var createBestMinerAction = function(game, playerIndex, agentInfo) {
    var chosenPlanet = game.board.planets[agentInfo.planetid];
    var settledPlanets = gamedata.getAdjacentSettledPlanets(game, agentInfo.planetid, playerIndex, true);
    var futures = gamedata.getResourceFutures(game, playerIndex);
    // get resource type of highest future
    var highestDeficit = 1000; // less means a higher deficit
    for (var p = 0; p < settledPlanets.length; p++) {
        var resources = settledPlanets[p].resources;
        for (var r = 0; r < resources.length; r++) {
            var structure = resources[r].structure;
            if (structure && structure.player == playerIndex) {
                var kind = resources[r].kind;
                var thisDeficit = futures[kind];
                if (thisDeficit < highestDeficit) {
                    highestDeficit = thisDeficit;
                    chosenPlanet = settledPlanets[p];
                }
            }
        }
    }
    return {
        player: playerIndex,
        actiontype: cons.ACT_LAUNCH_MISSION,
        agenttype: cons.AGT_MINER,
        planetid: chosenPlanet.planetid
    };
};

var createBestSpyAction = function(game, playerIndex, agentInfo) {
    var chosenPlanet = game.board.planets[agentInfo.planetid];
    var unblockedAdjacent = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid, true);
    if (utils.hasContent(unblockedAdjacent)) {
        chosenPlanet = utils.getRandomItem(unblockedAdjacent);
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
    var unblockedAdjacent = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid, true);
    var planetsWithEmbassies = unblockedAdjacent.filter(function(planet) {
        var resources = planet.resources;
        for (var r = 0; r < resources.length; r++){
            var structure = resources[r].structure;
            if (structure && structure.kind == cons.OBJ_EMBASSY) {
                return true;
            }
        }
    });
    if (utils.hasContent(planetsWithEmbassies)) {
        var chosenPlanet = utils.getRandomItem(planetsWithEmbassies);
        return {
            player: playerIndex,
            actiontype: cons.ACT_LAUNCH_MISSION,
            agenttype: cons.AGT_ENVOY,
            planetid: chosenPlanet.planetid
        };
    } else if (unblockedAdjacent.length == 1) {
        // send on a mission anyway if the envoy is trapped on a planet without an embassy
        return {
            player: playerIndex,
            actiontype: cons.ACT_LAUNCH_MISSION,
            agenttype: cons.AGT_ENVOY,
            planetid: agentInfo.planetid
        };
    } else {
        var chosenPlanet = utils.getRandomItem(unblockedAdjacent);
        return {
            player: playerIndex,
            actionttype: cons.ACT_MOVE_AGENT,
            agenttype: cons.AGT_ENVOY,
            planetid: chosenPlanet.planetid
        }
    }
};

var createBestAmbassadorAction = function(game, playerIndex, agentInfo) {
    var chosenPlanet = null;
    var settledPlanets = gamedata.getAdjacentSettledPlanets(game, agentInfo.planetid, playerIndex, true);
    var numMostStructures = 0;
    for (var p = 0; p < settledPlanets.length; p++) {
        var numStructuresHere = gamedata.getNumStructuresOnPlanet(game, settledPlanets[p], playerIndex);
        if (numStructuresHere > numMostStructures) {
            numMostStructures = numStructuresHere;
            chosenPlanet = settledPlanets[p];
        }
    }
    // only send on mission to planets with at least 2 of own structure
    if (numMostStructures >= 2) {
        return {
            player: playerIndex,
            actiontype: cons.ACT_LAUNCH_MISSION,
            agenttype: cons.AGT_AMBASSADOR,
            planetid: chosenPlanet.planetid
        };
    }
    // move to random location if no good locations to launch ambassador mission
    var adjacentPlanets = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid, false);
    if (utils.hasContent(adjacentPlanets)) {
        return {
            player: playerIndex,
            actiontype: cons.ACT_MOVE_AGENT,
            agenttype: cons.AGT_AMBASSADOR,
            planetid: utils.getRandomItem(adjacentPlanets).planetid
        }
    } else {
        // if impossible to move agent, send on mission to own planet
        return {
            player: playerIndex,
            actiontype: cons.ACT_LAUNCH_MISSION,
            agenttype: cons.AGT_AMBASSADOR,
            planetid: agentInfo.planetid
        };
    }
};

// TODO FEATURE: Check through planets and players for best place to attack
var createBestSabateurAction = function(game, playerIndex, agentInfo) {
    var unblockedPlanets = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid, true);
    // default to current planet if all adjacent planets are blocked
    var chosenPlanet = game.board.planets[agentInfo.planetid];
    if (utils.hasContent(unblockedPlanets)) {
        var maxEnemyStructures = 0;
        utils.shuffle(unblockedPlanets);
        for (var p = 0; p < unblockedPlanets.length; p++) {
            var numEnemyStructures = gamedata.getEnemyStructuresOnPlanet(game, playerIndex, unblockedPlanets[p], false);
            if (numEnemyStructures > maxEnemyStructures) {
                chosenPlanet = unblockedPlanets[p];
                maxEnemyStructures = numEnemyStructures;
            }
        }
    }
    return {
        player: playerIndex,
        actiontype: cons.ACT_LAUNCH_MISSION,
        agenttype: cons.AGT_SABATEUR,
        planetid: chosenPlanet.planetid
    };
};

// TODO FEATURE: Check through planets for best place to send smuggler
var createBestSmugglerAction = function(game, playerIndex, agentInfo) {
    var chosenPlanet = game.board.planets[agentInfo.planetid];
    var unblockedAdjacent = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid, true);
    if (utils.hasContent(unblockedAdjacent)) {
        utils.shuffle(unblockedAdjacent);
        var maxEnemyStructures = 0;
        for (var p = 0; p < unblockedAdjacent.length; p++) {
            var planet = unblockedAdjacent[p];
            var enemyStructures = gamedata.getEnemyStructuresOnPlanet(game, playerIndex, planet, true);
            var numEnemyStructures = enemyStructures.length;
            if (numEnemyStructures > maxEnemyStructures) {
                maxEnemyStructures = numEnemyStructures;
                chosenPlanet = planet;
            }
        }
    }
    return {
        player: playerIndex,
        actiontype: cons.ACT_LAUNCH_MISSION,
        agenttype: cons.AGT_SMUGGLER,
        planetid: chosenPlanet.planetid
    };
};

var createBestSurveyorAction = function(game, playerIndex, agentInfo) {
    var unblockedSettledAdjacent = gamedata.getAdjacentSettledPlanets(game, agentInfo.planetid, playerIndex, true);
    var planetsWithResourcesToBump = unblockedSettledAdjacent.filter(function(planet) {
        var resources = planet.resources;
        for (var r = 0; r < resources.length; r++) {
            var structure = resources[r].structure;
            if (structure && structure.player == playerIndex && resources[r].num < 2) {
                return true;
            }
            if (resources[r].reserved != undefined && resources[r].reserved == playerIndex) {
                return true;
            }
        }
    });
    if (utils.hasContent(planetsWithResourcesToBump)) {
        var chosenPlanet = utils.getRandomItem(planetsWithResourcesToBump);
        return {
            player: playerIndex,
            actiontype: cons.ACT_LAUNCH_MISSION,
            agenttype: cons.AGT_SURVEYOR,
            planetid: chosenPlanet.planetid
        }
    } else {
        var unblockedAdjacent = gamedata.getAdjacentUnblockedPlanets(game, agentInfo.planetid, false);
        if (utils.hasContent(unblockedAdjacent)) {
            var chosenPlanet = utils.getRandomItem(unblockedAdjacent);
            return {
                player: playerIndex,
                actiontype: cons.ACT_MOVE_AGENT,
                agenttype: cons.AGT_SURVEYOR,
                planetid: chosenPlanet.planetid
            }
        } else { // for very rare cases, if no where possible to move, just launch mission here.
            return {
                player: playerIndex,
                actiontype: cons.ACT_LAUNCH_MISSION,
                agenttype: cons.AGT_SURVEYOR,
                planetid: agentInfo.planetid
            }
        }
    }
};

var createBestFleetAction = function(game, playerIndex) {
    var fleets = gamedata.getActiveFleets(game, playerIndex);
    if (utils.hasContent(fleets)) {
        var unusedFleets = fleets.filter(function (fleet) {
            return fleet.used == false;
        });
        if (utils.hasContent(unusedFleets)) {
            var fleet = unusedFleets[0];
            var planet = game.board.planets[fleet.planetid];
            // filter out all mines from attack targets
            var attackTargets = gamedata.getEnemyStructuresOnPlanet(game, playerIndex, planet, false);
            if (utils.hasContent(attackTargets)) {
                var nonMineTargets = attackTargets.filter(function (target) {
                    return cons.STRUCT_REQS[target.objecttype].defense < 6;
                });
                if (utils.hasContent(nonMineTargets)) {
                    var attackItem = utils.getRandomItem(nonMineTargets);
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
            }
            // if no targets, try moving to an adjacent planet
            var adjacentPlanets = gamedata.getAdjacentUnblockedPlanets(game, fleet.planetid);
            if (utils.hasContent(adjacentPlanets)) {
                choicePlanet = utils.getRandomItem(adjacentPlanets);
                return {
                    player: playerIndex,
                    actiontype: cons.ACT_FLEET_MOVE,
                    targetid: fleet.fleetid,
                    planetid: choicePlanet.planetid
                };
            }
        }
    }
    return null;
};

var createBestBaseAction = function(game, playerIndex) {
    var basePlanet = gamedata.getBasePlanet(game, playerIndex);
    if (basePlanet && basePlanet.base.used == false) {
        var attackTargets = gamedata.getEnemyStructuresOnPlanet(game, playerIndex, basePlanet, false);
        if (utils.hasContent(attackTargets)) {
            var fleetTargets = attackTargets.filter(function (target) {
                return target.objecttype == cons.OBJ_FLEET;
            });
            if (utils.hasContent(fleetTargets)) {
                var attackItem = utils.getRandomItem(fleetTargets);
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
var createAi4To1Action = function(game, playerIndex, mustDo) {
    var futures = gamedata.getResourceFutures(game, playerIndex);
    var futureScore = utils.getResourcesScore(futures);
    // get resource type of highest future
    var highestFutureResource = -999;
    var surplusResourceType = -1;
    var lowestFutureResource = 999;
    var deficitResourceType = 999;
    for (var r = 0; r < 4; r++) {
        // only consider surpluses if they have >=4 resources currently
        // and won't be negative in 2 rounds if they subtract 4 resources
        if (game.resources[playerIndex][r] >= 4 && (mustDo || futures[r] >= 4)) {
            if (futures[r] > highestFutureResource) {
                highestFutureResource = futures[r];
                surplusResourceType = r;
            }
        }
        if (futures[r] < lowestFutureResource) {
            lowestFutureResource = futures[r];
            deficitResourceType = r;
        }
    }
    if (surplusResourceType != -1 && (mustDo || surplusResourceType != deficitResourceType)) {
        var isBetterScore = false;
        if (!mustDo) {
            var futuresWithTrade = futures.slice();
            futuresWithTrade[deficitResourceType] += 1;
            futuresWithTrade[surplusResourceType] -= 4;
            var futureScoreWithTrade = utils.getResourcesScore(futuresWithTrade);
            isBetterScore = futureScoreWithTrade > futureScore;
        }
        if (mustDo || isBetterScore) {
            return {
                player: playerIndex,
                actiontype: cons.ACT_TRADE_FOUR_TO_ONE,
                paytype: surplusResourceType,
                gettype: deficitResourceType
            }
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
    var unitToRemove = utils.getRandomItem(unitsToRemove);
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
        case cons.AGT_MINER:
            var action = null;
            var futures = gamedata.getResourceFutures(game, playerIndex);
            var playerResources = gamedata.getPlayerResourcesOnPlanet(game, playerIndex, planet, false);
            var greatestNeedFound = 1000; // (greater needs are lower numbers)
            for (var r = 0; r < playerResources.length; r++) {
                var resourceInfo = playerResources[r];
                var resourceKind = resourceInfo.resourceKind;
                if (futures[resourceKind] < greatestNeedFound) {
                    greatestNeedFound = futures[resourceKind];
                    action = {
                        player: playerIndex,
                        agenttype: agenttype,
                        actiontype: cons.ACT_MISSION_RESOLVE,
                        resourceid: resourceInfo.resourceIndex,
                        planetid: planetid
                    };
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
        case cons.AGT_SURVEYOR:
            var firstChoices = [];
            var secondChoices = [];
            var playerResources = gamedata.getPlayerResourcesOnPlanet(game, playerIndex, planet, true);
            for (var r = 0; r < playerResources.length; r++) {
                var resourceNum = playerResources[r].resourceNum;
                var structure = playerResources[r].structure;
                if (resourceNum < 2) {
                    if (structure && structure.kind == cons.OBJ_MINE) {
                        firstChoices.push(playerResources[r].resourceIndex);
                    } else {
                        secondChoices.push(playerResources[r].resourceIndex);
                    }
                }
            }
            choice = firstChoices.concat(secondChoices);
            if (choice.length > 2) {
                choice = choice.slice(0,2);
            }

            // if no resources can be reserved, resolve with undefined
            return {
                player: playerIndex,
                agenttype: agenttype,
                actiontype: cons.ACT_MISSION_RESOLVE,
                choice: choice,
                planetid: planetid
            };
        case cons.AGT_AMBASSADOR:
            var choice = [];
            var adjacentPlanets = gamedata.getAdjacentUnblockedPlanets(game, planetid, false);
            utils.shuffle(adjacentPlanets); // pick random borders to block TODO: this could be smarter
            for (var p = 0; p < adjacentPlanets.length; p++) {
                if (choice.length < 2) {
                    choice.push(adjacentPlanets[p].planetid);
                }
            }
            return {
                player: playerIndex,
                agenttype: agenttype,
                actiontype: cons.ACT_MISSION_RESOLVE,
                choice: choice,
                planetid: planetid
            };
        case cons.AGT_SABATEUR:
            var attackTargets = gamedata.getEnemyStructuresOnPlanet(game, playerIndex, planet, false);
            if (utils.hasContent(attackTargets)) {
                var attackItem = utils.getRandomItem(attackTargets);
                return {
                    player: playerIndex,
                    agenttype: agenttype,
                    actiontype: cons.ACT_MISSION_RESOLVE,
                    targetPlayer: attackItem.targetPlayer,
                    targetid: attackItem.targetid,
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
        case cons.AGT_SPY:
        case cons.AGT_ENVOY:
        case cons.AGT_SMUGGLER:
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

(function() {
    module.exports = {
        doAiCycle: doAiCycle
    };
}());