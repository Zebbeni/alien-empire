var cons = require('./server_constants');

// calculate a score from a given array of resources
// score is a sum of the score for each resource R,
// calculating the area under the a hyperbolic curve
// Score = (10 * ln(R) + 10) for positive values of R
// Score = -(10 * ln(-R) + 15) for negative values of R
var getResourcesScore = function(resources) {
    var score = 0;
    for (var r = 0; r < resources.length; r++) {
        var R = resources[r];
        if (R > 0) {
            score += ((10 * Math.log(R)) + 10);
        } else if (R < 0) {
            score -= ((10 * Math.log(-1 * R)) + 15);
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
    var length = 1 + Math.ceil(Math.random() * 2);
    var gender = getRandomItem([cons.GENDER_MALE, cons.GENDER_FEMALE]);
    var doLastName = Math.random() < 0.2;
    var name = generateName(length, doLastName, gender);
    if (Math.random() < 0.1) { // occasionally put a roman numeral at the end
        name += ' ' + getRandomItem(['I','II','III','IV','V','VI','VII','VIII','IIX','IX','X','XI','XII','XIII']);
    }
    return name;
};

var generateComputerPlayerName = function() {
    var titlesOfRankMale = ['Admiral','Baron','Chancellor','Count','Emperor','General','King','Prince','Tzar'];
    var titlesOfRankFemale = ['Admiral','Baroness','Chancellor','Countess','Empress','General','Princess','Queen','Tzarina'];
    var gender = getRandomItem([cons.GENDER_FEMALE,cons.GENDER_MALE]);
    var title = gender == cons.GENDER_MALE ? getRandomItem(titlesOfRankMale) : getRandomItem(titlesOfRankFemale);
    var nameLength = 1 + Math.floor(Math.random() * 3);
    var doLastName = false;
    var name = title + " " + generateName(nameLength, doLastName, gender);
    return name;
};

// ........ for generating random computer player names ........... //

var starts = ["B","B","C","D","D","F","G","G","H","J","J","K","L","L","M","M","N","P","P","R","R","S","S","T","T","V","W","Y","Z","Z"];
var weirdStarts = ["An","Ad","Al","Ab","Ar","Am","Av","Az","Bl","Br","Ch","Cr","Cl","Dr","Ep","En","Em","Ev","Ew","Ez","Fl","Fr","Gr","Gl","Gh","Il","Ind","Kat","Kh","Kr","Od","Om","On","Ol","Ow","Pr","Qu","Rh","Sh","Shr","Sk","Sl","Sp","St","Sw","Th","Tr","Y"];
var reallyWeirdStarts = ["Art","Alb","Att","Ambr","Ang","Andr","Ast","Ant","End","Edm","Elm","Gn","Eng","Est","Eul","Jer","Kn","Ogg","Ort","Ost","Org","Ott","Str","Thr","Und","Uth","Wh"];
var vowels = ["a","e","ee","i","o","u"];
var weirdVowels = ["ago","axi","ade","ane","au","ave","ea","ei","ere","ese","ega","ede","eve","ewba","eye","ia","ife","ine","oi","oo","ove","ode","ui","uke","una","omi","oni","uma","une","ure","uve"];
var vowelCons = ["ab","ah","aid","ain","aig","an","ar","and","ask","ass","at","aw","ed","eed","ent","el","er","esk","em","ewn","ex","if","isk","ist","ish","in","ing","ink","ian","ien","iv","ob","oud","osk","ong","ol","om","on","oon","or","ort","ors","osh","ox","il","ulc","und","un","ug","utl","uth","us","usk"];
var consonants = ["b","c","d","f","g","j","k","l","m","n","p","r","s","ss","t","v","w","z"];
var weirdCons = ["bb","cc","ck","dd","dg","dr","ff","gg","jon","jur","jan","kin","kk","lb","lg","ll","lj","lan","less","man","mb","mon","mm","nn","nd","nk","nz","ph","pp","pl","ppl","rb","rd","rf","rg","rsk","rt","rr","rth","rp","rm","rn","rs","sh","shk","sk","ss","st","son","th","tt","vil","wn","x","xt","xx","zz"];
var uncommonFemaleVowelEnds = ["ay","eia","en","er","et","ene","ie","ina","ine","oon","oo","une","una","yr","yn"];
var femaleNameVowelEnds = ["ia","i","a","ah","ea","el","ey","ya"];
var femaleNameConsEnds = ["ba","bi","bel","ba","cina","cen","di","del","dya","dy","fi","fel","fea","gi","hel","ji","ki","kel","kia","li","la","luna","lina","lel","lea","ley","ma","mi","ni","na","nya","pi","qi","ri","rah","run","rya","si","sah","sa","sei","ti","tin","ta","vi","wi","xi","zi","zah","za"];
var maleNameVowelEnds = ["a","ab","ah","aid","ago","ade","ane","ave","ain","an","ay","ar","and","as","ash","ask","ass","aw","ere","ega","eye","ed","ent","el","er","esk","em","ex","if","isk","ist","in","ink","ian","ien","iv","o","o","ob","ove","ode","osk","ong","om","oma","on","or","ort","ors","osh","ox","ow","u","ulk","und","un","ug","uth","us","usk","uma"];
var maleNameConsEnds = ["b","c","ck","d","do","f","ft","g","jon","jur","jan","k","kin","ko","l","ll","lan","m","mm","man","mb","mon","n","nn","nd","nk","ns","p","r","rr","rd","rg","rsk","rt","rth","rp","rm","rn","rs","s","ss","sk","st","son","t","th","tt","v","vil","x","z","zz"];

var generateName = function (length, doLastName, sex) {
    var needVowel = true;
    var name = "";

    var randomFloat = Math.random();
    //Begin Name
    if(randomFloat < 0.5){
        name += getRandomItem(starts);
    } else if(randomFloat < 0.8) {
        name += getRandomItem(starts);
    } else {
        name += getRandomItem(reallyWeirdStarts);
    }

    for (var i = 0; i < length; i++) {
        if(i == length - 1) {
            if(needVowel) {
                if(sex == cons.GENDER_FEMALE) {
                    randomFloat = Math.random();
                    if(randomFloat > 0.25) {
                        name += getRandomItem(femaleNameVowelEnds);
                    } else {
                        name += getRandomItem(uncommonFemaleVowelEnds);
                    }
                } else {
                    name += getRandomItem(maleNameVowelEnds);
                }
            } else {
                if(sex == cons.GENDER_FEMALE) {
                    name += getRandomItem(femaleNameConsEnds);
                } else {
                    name += getRandomItem(maleNameConsEnds);
                }
            }
        } else if(needVowel) {
            randomFloat = Math.random();
            if(randomFloat > 0.9) {
                name += getRandomItem(weirdVowels);
                needVowel = false;
            } else if(randomFloat > 0.45) {
                name += getRandomItem(vowels);
                needVowel = false;
            } else {
                name += getRandomItem(vowelCons);
                needVowel = true;
            }
        } else {
            randomFloat = Math.random();
            if(randomFloat > 0.5) {
                name += getRandomItem(weirdCons);
            } else {
                name += getRandomItem(consonants);
            }
            needVowel = true;
        }
    }

    if(doLastName) {
        var gender = getRandomItem([cons.GENDER_FEMALE, cons.GENDER_MALE]);
        var length = 1 + Math.floor(Math.random() * 2);
        name += " " + generateName( length, false, gender);
    }

    return name;
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