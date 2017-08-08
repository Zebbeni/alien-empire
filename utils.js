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
    var length = 2 + Math.floor(Math.random() * 4);
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
    var titlesOfRankFemale = ['Admiral','Archbishop','Baroness','Chancellor','Countess','Empress','General','Governor','Imperatrix','Lady','Princess','Queen','Tzarina'];
    var gender = getRandomItem([cons.GENDER_FEMALE,cons.GENDER_MALE]);
    var title = gender == cons.GENDER_MALE ? getRandomItem(titlesOfRankMale) : getRandomItem(titlesOfRankFemale);
    var nameLength = 2 + Math.floor(Math.random() * 4);
    var doLastName = false;
    var name = title + " " + generateName(nameLength, doLastName, gender);
    return name;
};

// ........ for generating random computer player names ........... //

var vowelList = ['a','e','i','o','u','y'];

var consonants = [
    { token: 'b', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'bb', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.RARE },
    { token: 'bc', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bf', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bg', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bh', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bj', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bk', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bl', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bm', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bn', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bp', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bq', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'br', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bs', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.UNCOMMON },
    { token: 'bt', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bv', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bw', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bx', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'bz', start: cons.NEVER, middle: cons.RARE, endM: cons.RARE, endF: cons.NEVER },
    { token: 'c', start: cons.COMMON, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.UNCOMMON },
    { token: 'cb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cc', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ch', start: cons.COMMON, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.RARE },
    { token: 'cj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ck', start: cons.NEVER, middle: cons.COMMON, endM: cons.COMMON, endF: cons.RARE },
    { token: 'cl', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cn', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cr', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cs', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.RARE },
    { token: 'ct', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'cv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cw', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'cz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'd', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'db', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dc', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dd', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'df', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dg', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dh', start: cons.UNCOMMON, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dj', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dk', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dl', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dn', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dp', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dq', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dr', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ds', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dt', start: cons.NEVER, middle: cons.RARE, endM: cons.RARE, endF: cons.NEVER },
    { token: 'dv', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dw', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dx', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'dz', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'f', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'fb', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fc', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fd', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ff', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.UNCOMMON },
    { token: 'fg', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fh', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fj', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fl', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fm', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fn', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fp', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fq', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fr', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fs', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.RARE },
    { token: 'ft', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fv', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fw', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fx', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'fz', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'g', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'gb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gc', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gg', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'ggl', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gh', start: cons.RARE, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'gj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gl', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gn', start: cons.RARE, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gr', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gs', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gt', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gw', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'gz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'h', start: cons.COMMON, middle: cons.UNCOMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'hb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hc', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hh', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hl', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.RARE },
    { token: 'hn', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.RARE },
    { token: 'hp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hr', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hs', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.RARE },
    { token: 'ht', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hw', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'hz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'j', start: cons.COMMON, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.RARE },
    { token: 'jb', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jc', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jd', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jf', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jg', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jh', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jk', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jl', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jm', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jn', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jp', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jq', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jr', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'js', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jt', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jv', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jw', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jx', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'jz', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'k', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.RARE },
    { token: 'kb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kc', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kd', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kf', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kg', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kh', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kj', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kk', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'kl', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'km', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kn', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kp', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kq', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kr', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ks', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'kt', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'kv', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kw', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kx', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'kz', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'l', start: cons.COMMON, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.COMMON },
    { token: 'lb', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'lc', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ld', start: cons.NEVER, middle: cons.COMMON, endM: cons.COMMON, endF: cons.RARE },
    { token: 'lf', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.RARE },
    { token: 'lg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'lh', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.UNCOMMON },
    { token: 'lj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'lk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.UNCOMMON },
    { token: 'll', start: cons.RARE, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.COMMON },
    { token: 'lm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.RARE },
    { token: 'ln', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.RARE },
    { token: 'lp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.RARE },
    { token: 'lq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'lr', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ls', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.UNCOMMON },
    { token: 'lt', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'lv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'lw', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'lx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'lz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'm', start: cons.COMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.COMMON },
    { token: 'mb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.UNCOMMON },
    { token: 'mc', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'md', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mh', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ml', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mm', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.UNCOMMON },
    { token: 'mn', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.UNCOMMON },
    { token: 'mp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.RARE },
    { token: 'mq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mr', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ms', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.UNCOMMON },
    { token: 'mt', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mw', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'mz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'n', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.COMMON },
    { token: 'nb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'nc', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'nd', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'nf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.RARE },
    { token: 'ng', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.RARE },
    { token: 'nh', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.RARE },
    { token: 'nj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'nk', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'nl', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'nm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'nn', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.RARE },
    { token: 'np', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'nq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'nr', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ns', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.RARE },
    { token: 'nt', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'nv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'nw', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'nx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'nz', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'p', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'pb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pc', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ph', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.UNCOMMON },
    { token: 'pj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pl', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pn', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pp', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'pq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pr', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ps', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.RARE },
    { token: 'pt', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.RARE },
    { token: 'pv', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pw', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'px', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'pz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'q', start: cons.COMMON, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'r', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.RARE },
    { token: 'rb', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rc', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'rd', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'rf', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'rg', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rh', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rk', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rl', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rm', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rn', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.UNCOMMON },
    { token: 'rp', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'rph', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'rq', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rr', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'rs', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'rsh', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'rst', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'rt', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'rv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'rw', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'rz', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 's', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'sb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sc', start: cons.NEVER, middle: cons.COMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'sd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sh', start: cons.COMMON, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.COMMON },
    { token: 'sj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sk', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.RARE },
    { token: 'sl', start: cons.COMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sm', start: cons.COMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sn', start: cons.COMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sp', start: cons.COMMON, middle: cons.UNCOMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'sq', start: cons.COMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sr', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ss', start: cons.NEVER, middle: cons.COMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'st', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'sv', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sw', start: cons.COMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'sz', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 't', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.UNCOMMON },
    { token: 'tb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tc', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'td', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'th', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.UNCOMMON },
    { token: 'tj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tl', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tn', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tr', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ts', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.RARE },
    { token: 'tt', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.RARE },
    { token: 'tv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tw', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'tz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'v', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.RARE },
    { token: 'vb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vc', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vh', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vl', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vn', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vr', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vs', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'vt', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vw', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'vz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'w', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.RARE },
    { token: 'wb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wc', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wf', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wg', start: cons.NEVER, middle: cons.RARE, endM: cons.RARE, endF: cons.NEVER },
    { token: 'wh', start: cons.UNCOMMON, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wj', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wk', start: cons.NEVER, middle: cons.RARE, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'wl', start: cons.NEVER, middle: cons.RARE, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'wm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'wn', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.UNCOMMON },
    { token: 'wp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wr', start: cons.RARE, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ws', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'wt', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ww', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'wz', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'x', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.RARE },
    { token: 'xb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xc', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xh', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xl', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xn', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xr', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xs', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xt', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xv', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xw', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'xx', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'xz', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'z', start: cons.COMMON, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.NEVER },
    { token: 'zb', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zc', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zd', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zf', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zg', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zh', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zj', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zk', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zl', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zm', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zn', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zp', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zq', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zr', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zs', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zt', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zv', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zw', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zx', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'zz', start: cons.NEVER, middle: cons.COMMON, endM: cons.UNCOMMON, endF: cons.RARE }
];

var vowels = [
    { token: 'a', start: cons.COMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.COMMON, afterQ: true },
    { token: 'aa', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ae', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ai', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.UNCOMMON },
    { token: 'ao', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'au', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ay', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.COMMON },
    { token: 'e', start: cons.COMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.COMMON },
    { token: 'ea', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.COMMON },
    { token: 'ee', start: cons.NEVER, middle: cons.COMMON, endM: cons.NEVER, endF: cons.UNCOMMON },
    { token: 'ei', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.UNCOMMON },
    { token: 'eia', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.COMMON },
    { token: 'eo', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'eu', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ey', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.UNCOMMON },
    { token: 'i', start: cons.UNCOMMON, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.COMMON, afterQ: true },
    { token: 'ia', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.COMMON },
    { token: 'ie', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.COMMON },
    { token: 'ii', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.RARE },
    { token: 'io', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.COMMON, endF: cons.NEVER },
    { token: 'iu', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.RARE, endF: cons.NEVER },
    { token: 'iy', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'o', start: cons.COMMON, middle: cons.COMMON, endM: cons.COMMON, endF: cons.NEVER },
    { token: 'oa', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.COMMON, endF: cons.NEVER, afterQ: true },
    { token: 'oe', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'oi', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'oo', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.RARE, endF: cons.UNCOMMON },
    { token: 'ou', start: cons.RARE, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'oy', start: cons.RARE, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'u', start: cons.UNCOMMON, middle: cons.COMMON, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'ua', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER, afterQ: true},
    { token: 'ue', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER, afterQ: true},
    { token: 'ui', start: cons.NEVER, middle: cons.UNCOMMON, endM: cons.NEVER, endF: cons.NEVER, afterQ: true},
    { token: 'uo', start: cons.NEVER, middle: cons.RARE, endM: cons.NEVER, endF: cons.NEVER, afterQ: true },
    { token: 'uu', start: cons.NEVER, middle: cons.NEVER, endM: cons.NEVER, endF: cons.NEVER },
    { token: 'uy', start: cons.NEVER, middle: cons.NEVER, endM: cons.RARE, endF: cons.RARE, afterQ: true },
    { token: 'y', start: cons.RARE, middle: cons.RARE, endM: cons.RARE, endF: cons.COMMON },
    { token: 'ya', start: cons.UNCOMMON, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'ye', start: cons.UNCOMMON, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'yi', start: cons.UNCOMMON, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'yo', start: cons.UNCOMMON, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'yu', start: cons.UNCOMMON, middle: cons.RARE, endM: cons.RARE, endF: cons.RARE },
    { token: 'yy', start: cons.NEVER, middle: cons.NEVER, endM: cons.NEVER, endF: cons.NEVER }
];

var generateName = function (length, doLastName, sex) {
    var name = "";

    var charsToChoose = [];
    while (name.length < length) {
        charsToChoose = getCharChoices(name);
        var attribute = name.length == 0 ? 'start' : 'middle';
        name += getRandomWeightedNameToken(charsToChoose, attribute);
    }

    charsToChoose = getCharChoices(name);
    attribute = sex == cons.GENDER_MALE ? 'endM' : 'endF';
    name += getRandomWeightedNameToken(charsToChoose, attribute);

    if(doLastName) {
        var gender = getRandomItem([cons.GENDER_FEMALE, cons.GENDER_MALE]);
        var length = Math.floor(Math.random() * 4);
        name += " " + generateName(length, false, gender);
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
                    return (entry.afterQ == true);
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