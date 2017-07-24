// This is a module to contain getters / agreggators to return
// useful or interesting data from given game objects

var cons = require('./server_constants');

var getActiveAgents = function(game, playerIndex) {
    agents = [];
    for (var a = cons.AGT_EXPLORER; a <= cons.AGT_SABATEUR; a++){
        var agentid = String(playerIndex) + String(a);
        var agent = game.board.agents[agentid];
        agents.push({
            agentid: agentid,
            agenttype: a,
            status: agent.status,
            used: agent.used,
            planetid: agent.planetid
        });
    }
    return agents.filter(function(agent) {
       return agent.status == cons.AGT_STATUS_ON;
    });
};

// Returns all explored adjacent planets to the given planetid
var getAdjacentExploredPlanets = function(game, planetid, includeSelf) {
    var planetsToReturn = game.board.planets.filter(function (planet) {
        return (planet.explored && planetid in planet.borders);
    });
    if (includeSelf) {
        planetsToReturn.push(game.board.planets[planetid]);
    }
    return planetsToReturn;
};

// Returns all explored adjacent planets to the given planetid
var getAdjacentUnblockedPlanets = function(game, planetid, includeSelf) {
    var adjacentExplored = getAdjacentExploredPlanets(game, planetid, includeSelf);
    if (adjacentExplored && adjacentExplored.length > 0) {
        return adjacentExplored.filter(function (adjacent) {
            return adjacent.borders[planetid] != cons.BRD_BLOCKED;
        });
    }
    return null;
};

var getAdjacentUnexploredPlanets = function(game, planetid, includeSelf) {
    var planetsToReturn = game.board.planets.filter(function(planet) {
        return planet.explored == false && planetid in planet.borders;
    });
    if (includeSelf) {
        planetsToReturn.push(game.board.planets[planetid]);
    }
    return planetsToReturn;
};

var getAdjacentSettledPlanets = function(game, planetid, playerIndex, includeSelf) {
    var planetsToReturn = getAdjacentExploredPlanets(game, planetid, includeSelf);
    planetsToReturn = planetsToReturn.filter(function(planet){
       return planet.settledBy[playerIndex] == true;
    });
    return planetsToReturn;
};

// return list of objects containing information about all units
// requiring the given resource for upkeep
var getUnitsRequiringUpkeep = function(game, playerIndex, resType) {
    var units = [];
    switch (resType) {
        case cons.RES_METAL:
        case cons.RES_WATER:
            var settled = game.board.planets.filter(function(planet) {
                return planet.settledBy[playerIndex];
            });
            for (var p = 0; p < settled.length; p++) {
                var resources = settled[p].resources;
                for (var r = 0; r < resources.length; r++) {
                    var structure = resources[r].structure;
                    if (structure && structure.player == playerIndex) {
                        if (cons.STRUCT_REQS[structure.kind].upkeep[resType] > 0) {
                            units.push({
                                planetid: settled[p].planetid,
                                resourceId: r,
                                objectType: structure.kind
                            });
                        }
                    }
                }
            }
            return units;
        case cons.RES_FUEL:
            var fleets = getActiveFleets(game, playerIndex);
            if (fleets && fleets.length > 0) {
                return fleets;
            }
            var basePlanet = getBasePlanet(game, playerIndex);
            return [{
                planetid: basePlanet.planetid,
                objecttype: cons.OBJ_BASE
            }];
        case cons.RES_FOOD:
            return getActiveAgents(game, playerIndex);
        default:
            return [];
    }
};

var getBasePlanet = function(game, playerIndex) {
    for (var p = 0; p < game.board.planets.length; p++) {
        var base = game.board.planets[p].base;
        if (base && base.player == playerIndex) {
            return game.board.planets[p];
        }
    }
    return null;
};

var getEmbassyPlanets = function(game, playerIndex) {
    return getPlanetsWithResourceStructure(game, playerIndex, cons.OBJ_EMBASSY);
};

var getFactoryPlanets = function(game, playerIndex) {
    return getPlanetsWithResourceStructure(game, playerIndex, cons.OBJ_FACTORY);
};

var getPlanetsWithResourceStructure = function(game, playerIndex, objecttype) {
    var planets = game.board.planets.filter(function(planet) {
        return planet.settledBy[playerIndex];
    });
    var returnList = [];
    for (var p = 0; p < planets.length; p++) {
        var resources = planets[p].resources;
        for (var r = 0; r < resources.length; r++) {
            var structure = resources[r].structure;
            if (structure && structure.player == playerIndex && structure.kind == objecttype) {
                returnList.push(planets[p]);
                break;
            }
        }
    }
    return returnList;
};

// return list of active fleets on board of given player
getActiveFleets = function(game, playerIndex) {
    var fleets = [];
    for (var f = 0; f < cons.NUM_FLEETS; f++){
        var fleetid = String(playerIndex) + String(f);
        var fleet = game.board.fleets[fleetid];
        if (fleet.planetid != undefined) {
            fleets.push({
                fleetid: fleetid,
                planetid: fleet.planetid,
                objecttype: cons.OBJ_FLEET,
                used: fleet.used
            });
        }
    }
    return fleets;
};

// return current mission pending resolution
var getCurrentMission = function(game) {
    var missionIndex = game.missionindex;
    var missionRound = game.round - 2;
    if (game.missions[missionRound] && game.missions[missionRound][missionIndex]) {
        return game.missions[missionRound][missionIndex];
    }
    return null;
};

// return index of current mission pending resolution
var getCurrentMissionIndex = function(game) {
    return game.missionindex;
};

// return list of information on enemy structures on given planet
// looks for structures that do NOT belong to the given player
var getEnemyStructuresOnPlanet = function(game, playerIndex, planet) {
    var enemies = [];
    var resources = planet.resources;
    for (var r = 0; r < resources.length; r++) {
        var structure = resources[r].structure;
        if (structure && structure.player != playerIndex) {
            enemies.push({
                targetPlayer: structure.player,
                choice: r,
                objecttype: structure.kind
            });
        }
    }
    var fleets = planet.fleets
    for (var f = 0; f < fleets.length; f++) {
        var fleetid = fleets[f];
        var fleet = game.board.fleets[fleetid];
        if (fleet.player != playerIndex) {
            enemies.push({
                targetPlayer: fleet.player,
                choice: fleetid,
                objecttype: cons.OBJ_FLEET
            });
        }
    }
    if (planet.base && planet.base.player != playerIndex) {
        enemies.push({
            targetPlayer: planet.base.player,
            choice: null,
            objecttype: cons.OBJ_BASE
        });
    }
    return enemies;
};

// return list of information on the occupied resources on a given
// planet for a given playerIndex
var getPlayerResourcesOnPlanet = function(game, playerIndex, planet) {
    var resources = planet.resources;
    var playerResources = [];
    for (var r = 0; r < resources.length; r++) {
        var structure = resources[r].structure;
        if (structure && structure.player == playerIndex) {
            playerResources.push({
                resourceIndex: r,
                resourceNum: resources[r].num,
                resourceKind: resources[r].kind,
                structureKind: structure.kind,
                choice: r
            });
        }
    }
    return playerResources;
};

// creates a list of resources the given player will have in 2 rounds given
// current collection & upkeep rates.
// Returns (current + 2 * (collect - upkeep)) for each resource type
var getResourceFutures = function(game, playerIndex) {
    var current = game.resources[playerIndex];
    var collect = game.resourceCollect[playerIndex];
    var upkeep = game.resourceUpkeep[playerIndex];
    var futures = [0, 0, 0, 0];
    for (var r = 0; r < futures.length; r++) {
        futures[r] = current[r] + 2 * (collect[r] - upkeep[r]);
    }
    return futures;
};

// returns resource futures in 2 rounds considering the impact of purchasing
// the given structure type
var getResourceFuturesWithNewStructure = function(game, playerIndex, objecttype) {
    var futures = getResourceFutures(game, playerIndex);
    var build = cons.STRUCT_REQS[objecttype].build;
    var upkeep = cons.STRUCT_REQS[objecttype].upkeep;
    return futures.map(function (num, idx) {
        return num - (build[idx] + 2 * upkeep[idx]);
    });
};

// return true if is playerIndex's turn
var isPlayerIndexTurn = function(game, playerIndex) {
    return game.playerTurn == playerIndex;
};

var playerHasStructureInInventory = function(game, playerIndex, objectype) {
    return game.structures[playerIndex][objectype] > 0;
};

var playerHasStructureOnBoard = function(game, playerIndex, objecttype) {
    return game.structures[playerIndex][objecttype] < cons.STRUCT_REQS[objecttype].max;
};

// return true if player has an object of the given type in
// inventory AND has resources required to build it.
var playerCanBuild = function(game, playerIndex, objecttype) {
    if (playerHasStructureInInventory(game, playerIndex, objecttype)) {
        var requirements = cons.STRUCT_REQS[objecttype].build;
        if (!playerCanPay(game, playerIndex, requirements)){
            return false;
        }
        return true;
    }
    return false;
};

// return true if player can pay the given list of resources
var playerCanPay = function(game, playerIndex, resources) {
    for (var r = 0; r < resources.length; r++){
        if ( game.resources[playerIndex][r] < resources[r]){
            return false;
        }
    }
    return true;
};

// return true if player can collect the given list of resources
var playerCanCollect = function(game, playerIndex, resources) {
    for (var r = 0; r < resources.length; r++){
        if ( game.resources[playerIndex][r] + resources[r] > 10){
            return false;
        }
    }
    return true;
};

var playerCanRecruit = function(game, playerIndex, agenttype) {
    var agent = game.board.agents[String(playerIndex) + String(agenttype)];
    if (agent.status == cons.AGT_STATUS_OFF) {
        var objecttype = cons.AGT_OBJTYPE[agenttype];
        return playerHasStructureOnBoard(game, playerIndex, objecttype);
    }
    return false;
};


(function() {
    module.exports = {
        getActiveAgents: getActiveAgents,
        getActiveFleets: getActiveFleets,
        getAdjacentExploredPlanets: getAdjacentExploredPlanets,
        getAdjacentUnblockedPlanets: getAdjacentUnblockedPlanets,
        getAdjacentUnexploredPlanets: getAdjacentUnexploredPlanets,
        getAdjacentSettledPlanets: getAdjacentSettledPlanets,
        getBasePlanet: getBasePlanet,
        getEnemyStructuresOnPlanet: getEnemyStructuresOnPlanet,
        getPlayerResourcesOnPlanet: getPlayerResourcesOnPlanet,
        getCurrentMission: getCurrentMission,
        getCurrentMissionIndex: getCurrentMissionIndex,
        getEmbassyPlanets: getEmbassyPlanets,
        getFactoryPlanets: getFactoryPlanets,
        getResourceFutures: getResourceFutures,
        getResourceFuturesWithNewStructure: getResourceFuturesWithNewStructure,
        getUnitsRequiringUpkeep: getUnitsRequiringUpkeep,
        isPlayerTurn: isPlayerIndexTurn,
        playerCanBuild: playerCanBuild,
        playerCanCollect: playerCanCollect,
        playerCanPay: playerCanPay,
        playerCanRecruit: playerCanRecruit,
        playerHasStructureInInventory: playerHasStructureInInventory
    }
}());