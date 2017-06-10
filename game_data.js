// This is a module to contain getters / agreggators to return
// useful or interesting data from given game objects

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

// return true if is playerIndex's turn
var isPlayerIndexTurn = function(game, playerIndex) {
    return game.playerTurn == playerIndex;
};

(function() {
    module.exports = {
        getCurrentMission: getCurrentMission,
        getCurrentMissionIndex: getCurrentMissionIndex,
        isPlayerIndexTurn: isPlayerIndexTurn
    }
}());