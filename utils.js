var cons = require('./server_constants');

// calculate a score from a given array of resources
// score is a sum of the score for each resource R,
// calculating the area under one of two lines:
// Score += -(R^2)/2 + 10(R) for positive values of R
// Score -= (R^2)/3 + 10(|R|) for negative values of R
var getResourcesScore = function(resources) {
    var score = 0;
    for (var r = 0; r < resources.length; r++) {
        var R = resources[r];
        if (R > 0) {
            // scor e += ((R * R / -2) + (10 * R));
            score += (10 * Math.log(Math.abs(R)) + 10);
        } else if (R < 0) {
            // score -= ((R * R / 3) + (10 * Math.abs(R)));
            score -= (10 * Math.log(-1 * R) + 11);
        }
    }
    return score;
};

// Returns random item from array
var getRandomItem = function(a) {
    var index = Math.floor(Math.random() * a.length);
    return a[index];
};

// Returns true if an array is not null and has > 0 item
var hasContent = function(a) {
    return a && a.length > 0;
};

// Shuffles array in place
var shuffle = function(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
};

var generatePlanetName = function() {
    // generate random planet name (pick # word tokens to concatenate)
    var length = 3 + Math.floor(Math.random() * 4);
    var doLastName = Math.random() < 0.1;
    var name = generateName(length, doLastName, cons.GENDER_PLANET);
    if (!doLastName && Math.random() < 0.1) { // occasionally put a roman numeral at the end
        name += ' ' + getRandomItem(['I','II','III','IV','V','VI','VII','VIII','IIX','IX','X','XI','XII','XIII']);
    }
    return name;
};

var generateComputerPlayerName = function() {
    var titlesOfRankMale = ['Admiral','Archbishop','Baron','Chancellor','Count','Emperor','General','Governor','Imperator','King','Lord','Prince','Tzar'];
    var titlesOfRankFemale = ['Admiral','Archbishop','Baroness','Chancellor','Countess','Empress','General','Governor','Imperatrix','Lady','Princess','Queen','Tzarina'];
    var gender = getRandomItem([cons.GENDER_FEMALE,cons.GENDER_MALE]);
    var title = gender == cons.GENDER_MALE ? getRandomItem(titlesOfRankMale) : getRandomItem(titlesOfRankFemale);
    var nameLength = 2 + Math.floor(Math.random() * 5);
    var doLastName = false;
    var name = title + " " + generateName(nameLength, doLastName, gender);
    return name;
};

// ........ for generating random computer player names ........... //

var vowelList = ['a','e','i','o','u','y'];

var consonants = [
    { token: 'j', startM: 254, startF: 193, startP: 3, middleM: 11, middleF: 15, middleP: 3, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'hn', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 0, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'w', startM: 91, startF: 22, startP: 1, middleM: 33, middleF: 7, middleP: 3, endM: 10, endF: 2, endP: 1, afterQ: 0 },
    { token: 'll', startM: 2, startF: 0, startP: 0, middleM: 103, middleF: 184, middleP: 1, endM: 80, endF: 24, endP: 1, afterQ: 0 },
    { token: 'm', startM: 213, startF: 336, startP: 20, middleM: 186, middleF: 150, middleP: 19, endM: 60, endF: 6, endP: 3, afterQ: 0 },
    { token: 's', startM: 79, startF: 116, startP: 16, middleM: 102, middleF: 154, middleP: 6, endM: 189, endF: 51, endP: 14, afterQ: 0 },
    { token: 'ch', startM: 35, startF: 58, startP: 3, middleM: 22, middleF: 15, middleP: 1, endM: 4, endF: 0, endP: 1, afterQ: 0 },
    { token: 'rl', startM: 0, startF: 0, startP: 0, middleM: 73, middleF: 95, middleP: 2, endM: 15, endF: 1, endP: 0, afterQ: 0 },
    { token: 'g', startM: 114, startF: 58, startP: 7, middleM: 51, middleF: 31, middleP: 14, endM: 5, endF: 2, endP: 0, afterQ: 0 },
    { token: 'rg', startM: 0, startF: 0, startP: 0, middleM: 17, middleF: 33, middleP: 3, endM: 0, endF: 1, endP: 1, afterQ: 0 },
    { token: 'fr', startM: 25, startF: 19, startP: 1, middleM: 4, middleF: 1, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nk', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 2, middleP: 1, endM: 6, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ph', startM: 5, startF: 10, startP: 1, middleM: 13, middleF: 11, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'th', startM: 20, startF: 16, startP: 1, middleM: 34, middleF: 65, middleP: 4, endM: 14, endF: 18, endP: 0, afterQ: 0 },
    { token: 'h', startM: 152, startF: 65, startP: 4, middleM: 22, middleF: 13, middleP: 1, endM: 34, endF: 86, endP: 0, afterQ: 0 },
    { token: 'nr', startM: 0, startF: 0, startP: 0, middleM: 6, middleF: 4, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'r', startM: 202, startF: 113, startP: 4, middleM: 314, middleF: 451, middleP: 32, endM: 198, endF: 36, endP: 7, afterQ: 0 },
    { token: 'b', startM: 131, startF: 76, startP: 16, middleM: 65, middleF: 73, middleP: 10, endM: 12, endF: 1, endP: 0, afterQ: 0 },
    { token: 'rt', startM: 0, startF: 0, startP: 0, middleM: 32, middleF: 30, middleP: 1, endM: 39, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dw', startM: 6, startF: 1, startP: 0, middleM: 5, middleF: 2, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rd', startM: 0, startF: 0, startP: 0, middleM: 32, middleF: 31, middleP: 2, endM: 67, endF: 1, endP: 0, afterQ: 0 },
    { token: 'rr', startM: 0, startF: 0, startP: 0, middleM: 91, middleF: 63, middleP: 2, endM: 2, endF: 1, endP: 0, afterQ: 0 },
    { token: 'lt', startM: 0, startF: 0, startP: 0, middleM: 25, middleF: 3, middleP: 1, endM: 4, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rth', startM: 0, startF: 0, startP: 0, middleM: 9, middleF: 11, middleP: 0, endM: 5, endF: 0, endP: 0, afterQ: 0 },
    { token: 'd', startM: 274, startF: 182, startP: 2, middleM: 161, middleF: 167, middleP: 14, endM: 76, endF: 8, endP: 3, afterQ: 0 },
    { token: 'lb', startM: 0, startF: 0, startP: 0, middleM: 30, middleF: 12, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'l', startM: 200, startF: 278, startP: 12, middleM: 236, middleF: 673, middleP: 26, endM: 175, endF: 55, endP: 6, afterQ: 0 },
    { token: 'v', startM: 49, startF: 88, startP: 5, middleM: 152, middleF: 98, middleP: 9, endM: 5, endF: 1, endP: 0, afterQ: 0 },
    { token: 'cl', startM: 44, startF: 31, startP: 0, middleM: 1, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nc', startM: 0, startF: 0, startP: 0, middleM: 49, middleF: 25, middleP: 1, endM: 0, endF: 1, endP: 0, afterQ: 0 },
    { token: 'ndr', startM: 0, startF: 0, startP: 0, middleM: 20, middleF: 23, middleP: 0, endM: 0, endF: 1, endP: 0, afterQ: 0 },
    { token: 'n', startM: 66, startF: 102, startP: 9, middleM: 223, middleF: 709, middleP: 44, endM: 748, endF: 213, endP: 27, afterQ: 0 },
    { token: 'rn', startM: 0, startF: 0, startP: 0, middleM: 59, middleF: 29, middleP: 0, endM: 11, endF: 3, endP: 0, afterQ: 0 },
    { token: 'st', startM: 27, startF: 16, startP: 1, middleM: 91, middleF: 75, middleP: 6, endM: 9, endF: 0, endP: 1, afterQ: 0 },
    { token: 'ss', startM: 0, startF: 0, startP: 0, middleM: 24, middleF: 81, middleP: 2, endM: 15, endF: 6, endP: 0, afterQ: 0 },
    { token: 'sc', startM: 4, startF: 2, startP: 2, middleM: 8, middleF: 4, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'p', startM: 45, startF: 52, startP: 8, middleM: 12, middleF: 4, middleP: 7, endM: 11, endF: 0, endP: 0, afterQ: 0 },
    { token: 't', startM: 109, startF: 124, startP: 12, middleM: 40, middleF: 140, middleP: 17, endM: 27, endF: 16, endP: 2, afterQ: 0 },
    { token: 'nj', startM: 0, startF: 0, startP: 0, middleM: 7, middleF: 9, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ck', startM: 0, startF: 0, startP: 0, middleM: 19, middleF: 13, middleP: 0, endM: 37, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lfr', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 3, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rb', startM: 0, startF: 0, startP: 0, middleM: 14, middleF: 1, middleP: 3, endM: 1, endF: 1, endP: 0, afterQ: 0 },
    { token: 'c', startM: 147, startF: 152, startP: 12, middleM: 78, middleF: 127, middleP: 14, endM: 20, endF: 1, endP: 1, afterQ: 0 },
    { token: 'lm', startM: 0, startF: 0, startP: 0, middleM: 30, middleF: 23, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rm', startM: 0, startF: 0, startP: 0, middleM: 31, middleF: 23, middleP: 3, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rv', startM: 0, startF: 0, startP: 0, middleM: 29, middleF: 8, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lph', startM: 0, startF: 0, startP: 0, middleM: 9, middleF: 6, middleP: 0, endM: 5, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dg', startM: 0, startF: 0, startP: 0, middleM: 10, middleF: 5, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tt', startM: 0, startF: 0, startP: 0, middleM: 19, middleF: 130, middleP: 1, endM: 33, endF: 5, endP: 0, afterQ: 0 },
    { token: 'wr', startM: 1, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tr', startM: 34, startF: 20, startP: 1, middleM: 13, middleF: 14, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'gh', startM: 0, startF: 0, startP: 1, middleM: 3, middleF: 3, middleP: 0, endM: 5, endF: 9, endP: 0, afterQ: 0 },
    { token: 'x', startM: 2, startF: 3, startP: 0, middleM: 16, middleF: 25, middleP: 2, endM: 13, endF: 2, endP: 0, afterQ: 0 },
    { token: 'nd', startM: 0, startF: 0, startP: 0, middleM: 62, middleF: 95, middleP: 7, endM: 36, endF: 3, endP: 10, afterQ: 0 },
    { token: 'fl', startM: 12, startF: 15, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rch', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'f', startM: 45, startF: 28, startP: 2, middleM: 19, middleF: 15, middleP: 0, endM: 8, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dn', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 5, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lv', startM: 0, startF: 0, startP: 0, middleM: 32, middleF: 23, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nth', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dd', startM: 0, startF: 0, startP: 0, middleM: 17, middleF: 8, middleP: 0, endM: 6, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nn', startM: 0, startF: 0, startP: 0, middleM: 69, middleF: 175, middleP: 0, endM: 10, endF: 50, endP: 0, afterQ: 0 },
    { token: 'ff', startM: 0, startF: 0, startP: 0, middleM: 15, middleF: 7, middleP: 0, endM: 4, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sl', startM: 1, startF: 1, startP: 2, middleM: 9, middleF: 9, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nz', startM: 0, startF: 0, startP: 0, middleM: 18, middleF: 5, middleP: 1, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rf', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ld', startM: 0, startF: 0, startP: 0, middleM: 26, middleF: 35, middleP: 2, endM: 26, endF: 1, endP: 0, afterQ: 0 },
    { token: 'nkl', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tth', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nf', startM: 0, startF: 0, startP: 0, middleM: 7, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dr', startM: 4, startF: 3, startP: 0, middleM: 21, middleF: 19, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ct', startM: 0, startF: 0, startP: 0, middleM: 7, middleF: 7, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ls', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 11, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sp', startM: 3, startF: 0, startP: 1, middleM: 4, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'chr', startM: 9, startF: 15, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'k', startM: 139, startF: 193, startP: 9, middleM: 41, middleF: 57, middleP: 4, endM: 13, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rc', startM: 0, startF: 0, startP: 0, middleM: 18, middleF: 15, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rk', startM: 0, startF: 0, startP: 0, middleM: 7, middleF: 2, middleP: 2, endM: 8, endF: 0, endP: 1, afterQ: 0 },
    { token: 'br', startM: 67, startF: 52, startP: 4, middleM: 7, middleF: 11, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nt', startM: 0, startF: 0, startP: 0, middleM: 65, middleF: 27, middleP: 3, endM: 19, endF: 1, endP: 1, afterQ: 0 },
    { token: 'rsh', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 4, middleP: 1, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mm', startM: 0, startF: 0, startP: 0, middleM: 28, middleF: 16, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'wt', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dm', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nl', startM: 0, startF: 0, startP: 0, middleM: 6, middleF: 3, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mb', startM: 0, startF: 0, startP: 0, middleM: 6, middleF: 10, middleP: 7, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ng', startM: 0, startF: 0, startP: 0, middleM: 9, middleF: 19, middleP: 6, endM: 21, endF: 1, endP: 0, afterQ: 0 },
    { token: 'sh', startM: 36, startF: 108, startP: 0, middleM: 31, middleF: 62, middleP: 0, endM: 10, endF: 2, endP: 3, afterQ: 0 },
    { token: 'gr', startM: 23, startF: 12, startP: 4, middleM: 0, middleF: 2, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'pr', startM: 12, startF: 7, startP: 0, middleM: 0, middleF: 2, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'cks', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rs', startM: 0, startF: 0, startP: 0, middleM: 11, middleF: 5, middleP: 0, endM: 6, endF: 0, endP: 0, afterQ: 0 },
    { token: 'gl', startM: 9, startF: 10, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'zr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ft', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 1, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mbr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tch', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 1, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ds', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lk', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bn', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dl', startM: 0, startF: 0, startP: 0, middleM: 6, middleF: 3, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nv', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lz', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'hnn', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ngt', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lw', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 4, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rw', startM: 0, startF: 0, startP: 1, middleM: 14, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ns', startM: 0, startF: 0, startP: 0, middleM: 18, middleF: 10, middleP: 0, endM: 8, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ws', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'z', startM: 26, startF: 33, startP: 3, middleM: 20, middleF: 35, middleP: 7, endM: 8, endF: 4, endP: 0, afterQ: 0 },
    { token: 'rtr', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'phr', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tz', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 6, middleP: 1, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lc', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 5, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lf', startM: 0, startF: 0, startP: 0, middleM: 14, middleF: 2, middleP: 0, endM: 5, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sr', startM: 0, startF: 0, startP: 1, middleM: 2, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'pl', startM: 4, startF: 1, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'gb', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sm', startM: 1, startF: 0, startP: 0, middleM: 6, middleF: 7, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sq', startM: 1, startF: 0, startP: 0, middleM: 1, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'hl', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'wm', startM: 1, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rlt', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ldr', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'hns', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bst', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'wh', startM: 3, startF: 1, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ght', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rnt', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ts', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bb', startM: 0, startF: 0, startP: 0, middleM: 10, middleF: 12, middleP: 0, endM: 4, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nfr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'xt', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mps', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'llsw', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rsch', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nds', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 1, afterQ: 0 },
    { token: 'bl', startM: 12, startF: 4, startP: 0, middleM: 3, middleF: 3, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ln', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 2, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ms', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nkn', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mn', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 1, endP: 0, afterQ: 0 },
    { token: 'rnst', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dfr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mp', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 4, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'xw', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sw', startM: 0, startF: 0, startP: 3, middleM: 4, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'llm', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'shl', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 8, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rnh', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tl', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 12, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'cr', startM: 11, startF: 14, startP: 1, middleM: 0, middleF: 1, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'wf', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rq', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'q', startM: 7, startF: 4, startP: 1, middleM: 16, middleF: 13, middleP: 1, endM: 2, endF: 0, endP: 1, afterQ: 0 },
    { token: 'chm', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lg', startM: 0, startF: 0, startP: 0, middleM: 6, middleF: 2, middleP: 3, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'df', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sb', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mpt', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'shm', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lh', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'shb', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ldw', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ks', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rdn', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ttl', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mphr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'kn', startM: 2, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'wn', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 6, middleP: 0, endM: 11, endF: 2, endP: 0, afterQ: 0 },
    { token: 'rp', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lbr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rtw', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lsw', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sht', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rph', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mpb', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nw', startM: 0, startF: 0, startP: 0, middleM: 6, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mr', startM: 0, startF: 0, startP: 0, middleM: 7, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rtt', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'gg', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 4, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sph', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ntg', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ghn', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lls', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nh', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rmst', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bs', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'wl', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nch', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 2, middleP: 0, endM: 2, endF: 1, endP: 0, afterQ: 0 },
    { token: 'rh', startM: 3, startF: 6, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nsf', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ndl', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'llw', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'pth', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bt', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nst', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 1, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nks', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'pt', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 1, afterQ: 0 },
    { token: 'sk', startM: 3, startF: 3, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ngr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'kl', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 3, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tn', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 4, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rst', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 4, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'hj', startM: 2, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'gn', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 7, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rtl', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rtn', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tzh', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rgl', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rls', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rns', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'njm', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'cq', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 8, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dh', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mck', startM: 1, startF: 3, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ntl', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sth', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'xf', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rkl', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'cc', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 1, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'stl', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lst', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'zz', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 4, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ngs', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'thr', startM: 0, startF: 1, startP: 0, middleM: 3, middleF: 4, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lds', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'gm', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'schl', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dst', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sch', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rnc', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ckh', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nthr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'gd', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 4, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rdt', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rld', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ndb', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rgh', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ffr', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mc', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'kr', startM: 9, startF: 16, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'thl', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 3, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nnth', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sv', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'str', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 2, middleP: 2, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tzg', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'pp', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 4, middleP: 1, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ndt', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ntw', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'kw', startM: 1, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bd', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'hs', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'hm', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'kh', startM: 4, startF: 2, startP: 0, middleM: 4, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'hnp', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ckl', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bj', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ntr', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nq', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'kk', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 3, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'md', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mz', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'xs', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'xz', startM: 1, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rj', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 3, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mph', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ngst', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rgr', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 3, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'chl', startM: 0, startF: 2, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lth', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'pc', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'gw', startM: 0, startF: 5, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'lp', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ps', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'chs', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'zb', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 2, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rbr', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'vr', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'zl', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 4, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'phn', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tw', startM: 0, startF: 2, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'vl', startM: 0, startF: 1, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'mpl', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nnm', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rdr', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bbr', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nm', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 2, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'dj', startM: 0, startF: 2, startP: 1, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'wnd', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nsh', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'spr', startM: 0, startF: 1, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'wnt', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ttn', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 6, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'wnn', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bh', startM: 0, startF: 0, startP: 1, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'zm', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 5, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'zh', startM: 0, startF: 1, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nsl', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 3, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'fn', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'shr', startM: 0, startF: 1, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'nts', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'thz', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'khl', startM: 0, startF: 1, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'hr', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ngl', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 2, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'sn', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tsw', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'cz', startM: 0, startF: 0, startP: 1, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'rz', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'khst', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'zst', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tv', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'cht', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'tts', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 1, afterQ: 0 },
    { token: 'rkm', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ngd', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'bw', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 }
];

var vowels = [
    { token: 'o', startM: 87, startF: 47, startP: 1, middleM: 876, middleF: 487, middleP: 59, endM: 163, endF: 22, endP: 10, afterQ: 0 },
    { token: 'i', startM: 48, startF: 62, startP: 9, middleM: 733, middleF: 901, middleP: 64, endM: 39, endF: 149, endP: 9, afterQ: 0 },
    { token: 'ia', startM: 1, startF: 0, startP: 0, middleM: 72, middleF: 87, middleP: 0, endM: 10, endF: 191, endP: 39, afterQ: 1 },
    { token: 'a', startM: 255, startF: 307, startP: 11, middleM: 1280, middleF: 1216, middleP: 129, endM: 99, endF: 1228, endP: 28, afterQ: 1 },
    { token: 'e', startM: 185, startF: 163, startP: 7, middleM: 1209, middleF: 1134, middleP: 63, endM: 320, endF: 445, endP: 13, afterQ: 0 },
    { token: 'eo', startM: 0, startF: 1, startP: 0, middleM: 31, middleF: 38, middleP: 2, endM: 10, endF: 0, endP: 0, afterQ: 0 },
    { token: 'y', startM: 0, startF: 2, startP: 0, middleM: 120, middleF: 244, middleP: 5, endM: 189, endF: 135, endP: 4, afterQ: 0 },
    { token: 'u', startM: 8, startF: 5, startP: 5, middleM: 262, middleF: 119, middleP: 25, endM: 3, endF: 2, endP: 4, afterQ: 2 },
    { token: 'ue', startM: 0, startF: 0, startP: 0, middleM: 18, middleF: 20, middleP: 1, endM: 9, endF: 5, endP: 1, afterQ: 25 },
    { token: 'oui', startM: 0, startF: 1, startP: 0, middleM: 2, middleF: 4, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'oe', startM: 0, startF: 0, startP: 0, middleM: 9, middleF: 13, middleP: 0, endM: 7, endF: 4, endP: 0, afterQ: 0 },
    { token: 'ie', startM: 0, startF: 2, startP: 0, middleM: 42, middleF: 51, middleP: 3, endM: 168, endF: 317, endP: 0, afterQ: 0 },
    { token: 'oy', startM: 0, startF: 0, startP: 0, middleM: 13, middleF: 2, middleP: 0, endM: 14, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ee', startM: 0, startF: 0, startP: 0, middleM: 32, middleF: 46, middleP: 1, endM: 11, endF: 58, endP: 0, afterQ: 0 },
    { token: 'ae', startM: 1, startF: 0, startP: 0, middleM: 18, middleF: 19, middleP: 1, endM: 7, endF: 13, endP: 0, afterQ: 0 },
    { token: 'ey', startM: 0, startF: 0, startP: 0, middleM: 11, middleF: 4, middleP: 1, endM: 109, endF: 56, endP: 1, afterQ: 0 },
    { token: 'ea', startM: 8, startF: 7, startP: 0, middleM: 46, middleF: 71, middleP: 2, endM: 4, endF: 17, endP: 3, afterQ: 0 },
    { token: 'eu', startM: 6, startF: 9, startP: 0, middleM: 5, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'au', startM: 22, startF: 14, startP: 2, middleM: 42, middleF: 24, middleP: 4, endM: 1, endF: 0, endP: 2, afterQ: 0 },
    { token: 'aa', startM: 3, startF: 1, startP: 0, middleM: 7, middleF: 1, middleP: 0, endM: 0, endF: 1, endP: 0, afterQ: 0 },
    { token: 'uy', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'io', startM: 0, startF: 3, startP: 0, middleM: 38, middleF: 14, middleP: 1, endM: 36, endF: 1, endP: 0, afterQ: 0 },
    { token: 'ay', startM: 3, startF: 2, startP: 0, middleM: 63, middleF: 66, middleP: 1, endM: 12, endF: 5, endP: 1, afterQ: 0 },
    { token: 'iu', startM: 0, startF: 0, startP: 0, middleM: 15, middleF: 1, middleP: 2, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'oa', startM: 1, startF: 0, startP: 0, middleM: 3, middleF: 7, middleP: 2, endM: 0, endF: 1, endP: 1, afterQ: 0 },
    { token: 'ua', startM: 0, startF: 0, startP: 0, middleM: 19, middleF: 10, middleP: 4, endM: 1, endF: 2, endP: 3, afterQ: 11 },
    { token: 'aia', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 0, middleP: 0, endM: 0, endF: 2, endP: 0, afterQ: 0 },
    { token: 'ouie', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ou', startM: 0, startF: 0, startP: 0, middleM: 11, middleF: 6, middleP: 2, endM: 1, endF: 3, endP: 0, afterQ: 0 },
    { token: 'oya', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 2, endP: 0, afterQ: 0 },
    { token: 'ei', startM: 2, startF: 2, startP: 0, middleM: 15, middleF: 32, middleP: 1, endM: 0, endF: 1, endP: 1, afterQ: 0 },
    { token: 'oo', startM: 0, startF: 0, startP: 0, middleM: 25, middleF: 3, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'aye', startM: 0, startF: 1, startP: 0, middleM: 3, middleF: 2, middleP: 0, endM: 1, endF: 4, endP: 0, afterQ: 0 },
    { token: 'ai', startM: 3, startF: 7, startP: 0, middleM: 49, middleF: 63, middleP: 11, endM: 7, endF: 5, endP: 0, afterQ: 0 },
    { token: 'ya', startM: 4, startF: 12, startP: 0, middleM: 8, middleF: 19, middleP: 1, endM: 3, endF: 15, endP: 2, afterQ: 0 },
    { token: 'ui', startM: 0, startF: 0, startP: 0, middleM: 18, middleF: 5, middleP: 1, endM: 0, endF: 1, endP: 0, afterQ: 16 },
    { token: 'you', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'oi', startM: 0, startF: 0, startP: 0, middleM: 5, middleF: 6, middleP: 0, endM: 0, endF: 1, endP: 0, afterQ: 0 },
    { token: 'iou', startM: 0, startF: 0, startP: 0, middleM: 4, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'aou', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'yee', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'uey', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ye', startM: 1, startF: 3, startP: 1, middleM: 4, middleF: 5, middleP: 0, endM: 2, endF: 11, endP: 0, afterQ: 0 },
    { token: 'eye', startM: 0, startF: 0, startP: 0, middleM: 3, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'yo', startM: 3, startF: 4, startP: 0, middleM: 4, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'uie', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 1, endP: 0, afterQ: 2 },
    { token: 'aya', startM: 0, startF: 2, startP: 0, middleM: 4, middleF: 3, middleP: 0, endM: 0, endF: 7, endP: 0, afterQ: 0 },
    { token: 'ayo', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ao', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 3, middleP: 1, endM: 1, endF: 0, endP: 1, afterQ: 0 },
    { token: 'uo', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 2, endF: 0, endP: 0, afterQ: 0 },
    { token: 'iyo', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'oey', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 1, endF: 1, endP: 0, afterQ: 0 },
    { token: 'eau', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 1, endF: 0, endP: 0, afterQ: 0 },
    { token: 'yoe', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'yaa', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'eio', startM: 0, startF: 0, startP: 0, middleM: 2, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'eyo', startM: 0, startF: 0, startP: 0, middleM: 1, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'yu', startM: 2, startF: 4, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'yai', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'yae', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'ayaa', startM: 1, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'oue', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'uee', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 2 },
    { token: 'oie', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 2, endP: 0, afterQ: 0 },
    { token: 'oua', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'oye', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 1, endP: 0, afterQ: 0 },
    { token: 'eya', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 3, middleP: 0, endM: 0, endF: 2, endP: 0, afterQ: 0 },
    { token: 'eea', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 2, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'uia', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 1, middleP: 0, endM: 0, endF: 0, endP: 0, afterQ: 1 },
    { token: 'eia', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 1, endP: 0, afterQ: 0 },
    { token: 'oyia', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 1, endP: 0, afterQ: 0 },
    { token: 'iya', startM: 0, startF: 2, startP: 0, middleM: 0, middleF: 13, middleP: 0, endM: 0, endF: 12, endP: 0, afterQ: 0 },
    { token: 'aiya', startM: 0, startF: 1, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 2, endP: 0, afterQ: 0 },
    { token: 'uya', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 1, endM: 0, endF: 0, endP: 0, afterQ: 0 },
    { token: 'uay', startM: 0, startF: 0, startP: 0, middleM: 0, middleF: 0, middleP: 0, endM: 0, endF: 0, endP: 2, afterQ: 0 }
];

var generateName = function (length, doLastName, sex) {
    var name = "";
    var attributeSuffix = sex == cons.GENDER_MALE ? 'M' : 'F';
    if (sex == cons.GENDER_PLANET) {
        attributeSuffix = 'P';
    }

    var charsToChoose = [];
    while (name.length < length - 1) {
        charsToChoose = getCharChoices(name);
        var attribute = name.length == 0 ? 'start' : 'middle';
        attribute += attributeSuffix;
        name += getRandomWeightedNameToken(charsToChoose, attribute);
    }

    charsToChoose = getCharChoices(name);
    attribute = 'end' + attributeSuffix;
    name += getRandomWeightedNameToken(charsToChoose, attribute);

    if(doLastName) {
        var length = 2 + Math.floor(Math.random() * 2);
        name += " " + generateName(length, false, sex);
    }
    var finalName = capitalizeFirstLetter(name);
    return finalName;
};

var getCharChoices = function(name) {
    if (name.length > 0) {
        var lastCharacter = name.substr(name.length - 1);
        // if last character was not a vowel, select from vowels
        if (vowelList.indexOf(lastCharacter) == -1) {
            // if last character was a q, select from only vowels
            // that should follow q
            if (lastCharacter == "q") {
                return vowels.filter(function(entry) {
                    return (entry.afterQ > 0);
                });
            } else {
                return vowels;
            }
        } else {
            return consonants;
        }
    } else {
        // if not started, randomly choose to start with vowel or consonant
        return Math.random() > 0.5 ? vowels : consonants;
    }
};

var getRandomWeightedNameToken = function(charsToChoose, attribute) {
    var totalWeight = 0;
    for (var i = 0; i < charsToChoose.length; i++) {
        var token = charsToChoose[i];
        totalWeight += token[attribute];
    }
    var randomWeight = Math.random() * totalWeight;
    var weightPassed = 0;
    for (var i = 0; i < charsToChoose.length; i++) {
        weightPassed += charsToChoose[i][attribute];
        if (randomWeight < weightPassed) {
            return charsToChoose[i].token;
        }
    }
    return '';
};

var capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

(function() {
    module.exports = {
        shuffle: shuffle,
        hasContent: hasContent,
        getRandomItem: getRandomItem,
        getResourcesScore: getResourcesScore,
        generateComputerPlayerName: generateComputerPlayerName,
        generatePlanetName: generatePlanetName
    };
}());