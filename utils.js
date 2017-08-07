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
            // score += ((R * R / -2) + (10 * R));
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
    var length = getRandomItem([2, 3, 4]);
    var gender = getRandomItem([cons.GENDER_MALE, cons.GENDER_FEMALE]);
    var doLastName = Math.random() < 0.1;
    var name = generateName(length, doLastName, gender);
    if (Math.random() < 0.1) { // occasionally put a roman numeral at the end
        name += ' ' + getRandomItem(['I','II','III','IV','V','VI','VII','VIII','IIX','IX','X','XI','XII','XIII']);
    }
    return name;
};

var generateComputerPlayerName = function() {
    var titlesOfRankMale = ['Admiral','Archbishop','Baron','Chancellor','Count','Emperor','General','Governor','Imperator','King','Lord','Prince','Tzar'];
    var titlesOfRankFemale = ['Admiral','Archbishop','Baroness','Chancellor','Countess','Empress','General','Governor','Imperator','Lady','Princess','Queen','Tzarina'];
    var gender = getRandomItem([cons.GENDER_FEMALE,cons.GENDER_MALE]);
    var title = gender == cons.GENDER_MALE ? getRandomItem(titlesOfRankMale) : getRandomItem(titlesOfRankFemale);
    var nameLength = getRandomItem([2, 3, 4, 5]);
    var doLastName = false;
    var name = title + " " + generateName(nameLength, doLastName, gender);
    return name;
};

// ........ for generating random computer player names ........... //

var vowelList = ['a','e','i','o','u','y'];

var consonants = [
    { token: 'b', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'br', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bs', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'bz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'c', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ch', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ck', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cs', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ct', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'cz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'db', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'df', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ds', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'dz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'f', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ff', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fs', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ft', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'fz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'g', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gs', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'gz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'h', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hs', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ht', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'j', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'js', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'jz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'k', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'km', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ks', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'kz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'l', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ld', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'll', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ln', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ls', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'lz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'md', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ml', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ms', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'mz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'n', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ng', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'np', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ns', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'p', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ph', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ps', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'px', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'pz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'q', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'r', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rs', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'rz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 's', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ss', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'st', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'sz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 't', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'tb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vs', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'vz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'w', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ws', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ww', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'wz', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'z', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zb', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zc', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zf', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zg', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zh', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zj', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zk', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zl', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zm', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zn', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zp', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zq', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zr', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zs', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zt', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zv', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zw', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zx', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'zz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.RARE }
];

var vowels = [
    { token: 'a', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON, afterQ: true },
    { token: 'aa', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ae', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ai', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ao', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'au', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ay', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'e', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON, afterQ: true },
    { token: 'ea', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ee', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ei', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'eo', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'eu', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ey', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'i', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: 1., afterQ: true },
    { token: 'ia', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ie', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ii', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'io', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'iu', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'iy', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'o', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'oa', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.COMMON, endF: cons.COMMON, afterQ: true },
    { token: 'oe', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'oi', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'oo', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ou', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'oy', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'u', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'ua', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON, afterQ: true},
    { token: 'ue', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON, afterQ: true},
    { token: 'ui', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON, afterQ: true},
    { token: 'uo', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON, afterQ: true },
    { token: 'uu', start: cons.NEVER, middle: cons.NEVER, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'uy', start: cons.NEVER, middle: cons.NEVER, endM: cons.RARE, endF: cons.RARE, afterQ: true },
    { token: 'y', start: cons.RARE, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'ya', start: cons.RARE, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'ye', start: cons.RARE, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'yi', start: cons.RARE, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'yo', start: cons.RARE, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'yu', start: cons.RARE, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'yy', start: cons.NEVER, middle: cons.NEVER, endM: cons.NEVER, endF: cons.NEVER }
];

var generateName = function (length, doLastName, sex) {
    var name = "";

    var charsToChoose = [];
    for (var i = 0; i < length; i++) {
        if (name.length > 0) {
            var lastCharacter = name.substr(name.length - 1);
            // if last character was not a vowel, select from vowels
            if (vowelList.indexOf(lastCharacter) == -1) {
                charsToChoose = vowels;
                // if last character was a q, select from only vowels
                // that should follow q
                if (lastCharacter == "q") {
                    charsToChoose = vowels.filter(function(entry) {
                        return (entry.afterQ == true);
                    });
                }
            } else {
                charsToChoose = consonants;
            }
        } else {
            // if not started, randomly choose to start with vowel or consonant
            charsToChoose = Math.random() > 0.5 ? vowels : consonants;
        }

        var attribute = 'middle';
        if (i == 0) {
            attribute = 'start';
        } else if (i == length - 1) {
            attribute = sex == cons.GENDER_MALE ? 'endM' : 'endF';
        }
        name += getRandomWeightedNameToken(charsToChoose, attribute);
    }

    if(doLastName) {
        var gender = getRandomItem([cons.GENDER_FEMALE, cons.GENDER_MALE]);
        var length = getRandomItem([1, 2, 3]);
        name += " " + generateName(length, false, gender);
    }

    return capitalizeFirstLetter(name);
};

var getRandomWeightedNameToken = function (charsToChoose, attribute) {
    var totalWeight = 0;
    for (var i = 0; i < charsToChoose.length; i++) {
        totalWeight += charsToChoose[i][attribute];
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