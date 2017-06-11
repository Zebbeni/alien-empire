// This is a module to contain getters / agreggators to return
// useful or interesting data from given game objects

var cons = require('./server_constants');

var getActiveAgents = function(game, playerIndex) {
    return [];
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
                                planetId: settled[p].planetid,
                                resourceId: r,
                                objectType: structure.kind
                            });
                        }
                    }
                }
            }
            return units;
        case cons.RES_FUEL:
            var fleets = [];
            for (var f = 0; f < cons.NUM_FLEETS; f++){
                var fleetid = String(playerIndex) + String(f);
                var fleet = game.board.fleets[fleetid];
                if (fleet.planetid != undefined) {
                    fleets.push({
                        fleetid: fleetid,
                        planetid: fleet.planetid,
                        objecttype: cons.OBJ_FLEET
                    });
                }
            }
            if (fleets.length > 0) {
                return fleets;
            }
            for (var p = 0; p > game.board.planets.length; p++) {
                var base = game.board.planets[p].base;
                if (base && base.player == playerIndex) {
                    return [{
                        planetid: planetid,
                        objecttype: cons.OBJ_BASE
                    }];
                }
            }
        case cons.RES_FOOD:
            return getActiveAgents(game, playerIndex);
        default:
            return [];
    }
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


(function() {
    module.exports = {
        getActiveAgents: getActiveAgents,
        getCurrentMission: getCurrentMission,
        getCurrentMissionIndex: getCurrentMissionIndex,
        getResourceFutures: getResourceFutures,
        getResourceFuturesWithNewStructure: getResourceFuturesWithNewStructure,
        getUnitsRequiringUpkeep: getUnitsRequiringUpkeep,
        isPlayerTurn: isPlayerIndexTurn,
        playerCanBuild: playerCanBuild,
        playerCanCollect: playerCanCollect,
        playerCanPay: playerCanPay,
        playerHasStructureInInventory: playerHasStructureInInventory
    }
}());