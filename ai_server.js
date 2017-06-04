var cons = require('./server_constants');

var doAiCycle = function(gamesInfo, users) {
    var count = 0;
    for (var i = 0; i < gamesInfo.length; i++) {
        if (gamesInfo[i].status == cons.GAME_PROGRESS) {
            count += 1;
        }
    }
    console.log(count + ' games in progress');
};

(function() {
    module.exports = {
        doAiCycle: doAiCycle
    };
}());