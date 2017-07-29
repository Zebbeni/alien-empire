var cons = require('./server_constants');
var helpers = require('./game_helpers');
var staging = require('./server_staging');

/**
 * This is a module to contain all login, logout, disconnect and other 
 * functions related to user connections and related messages
 */

var login = function(socket, io, users, messages, gamesInfo, name, fn) {
	socket.join('lobby');

	fn('received login');

	var is_existing_user = false;
	var existing_user_id;
	var is_computer_user = false;
	var is_logged_in = false; // set to true if user is already logged in
	var newUser = null;

	// If a user name already exists update that users' status to ONLINE
	for (var u = 0; u < users.length; u++) {
		if (users[u].name == name) {

			// check if user already logged in
			if(users[u].isComputer) {
				is_computer_user = true;
			}
			else if(users[u].status != cons.USR_OFFLINE) {
				is_logged_in = true;
                users[u].status = cons.USR_ONLINE;
			}
			else {
				// set socket's userid only if not already logged in
				socket.userid = u;
                users[u].status = cons.USR_ONLINE;
			}

			newUser = users[u];

			is_existing_user = true;
			existing_user_id = u;

			break;
		}
	}

	if (is_logged_in) {
		socket.emit('login failed already logged in', name);
	} else if (is_computer_user) {
        socket.emit('login failed computer user', name);
	} else {

		socket.name = name;

		// Otherwise create a new one and increment num_users
		if (!is_existing_user) {

			var userid = createNewUser(users, name, cons.USR_ONLINE, false);

			socket.userid = userid;
		}

		var newMsg = helpers.addLobbyMessage( messages, 
											  cons.MSG_SERVER, 
											  name + " joined the room");

		socket.emit('login success', users, socket.userid, socket.name, 
						newMsg, gamesInfo, function(data) { 
												// debug(data); 
											}
		);

		socket.broadcast.to('lobby').emit('user login', users, newMsg);

		if (is_existing_user) {
			gameid = helpers.findGameToReconnect(existing_user_id, gamesInfo);
			if ( gameid != -1 ) {
				gameInfo = gamesInfo[gameid];
				console.log(gameInfo);
				socket.join( gameInfo.room );
				socket.emit('reconnect', gameInfo);
				var newMsg = helpers.addGameMessage( gamesInfo[gameid],
													 cons.MSG_SERVER,
													 name + " reconnected");
				io.in(gameInfo.room).emit(
									'room user reconnected', 
									newMsg );
			}
		}
	}
};

var logout = function(socket, users, messages, fn){
	var username = socket.name;

	fn('true');

	users[socket.userid].status = cons.USR_OFFLINE; // 0: OFFLINE

	socket.leave('lobby');

	var newMsg = helpers.addLobbyMessage( messages, 
										  cons.MSG_SERVER, 
										  username + " left the room" );

	socket.emit('leave lobby', function(data){ });
	socket.broadcast.to('lobby').emit('user logout', users, newMsg);
};

var disconnect = function(socket, io, users, messages, gamesInfo) {
	// if user hasn't already logged out
	if (socket.userid != undefined && users[socket.userid].status != cons.USR_OFFLINE){

		var username = socket.name;
		users[socket.userid].status = cons.USR_OFFLINE; // 0: OFFLINE

		var newMsg = helpers.addLobbyMessage( messages, 
											  cons.MSG_SERVER, 
											  username + " left the room" );

		io.in('lobby').emit('user logout', users, newMsg);

		// extra loose ends to tie up if user was in a game
		var gameid = users[socket.userid].gameid
		
		if ( gameid != null ) {
			var gameInfo = gamesInfo[gameid];

			// if game is still in staging, remove user from game and alert
			if (gameInfo.status == cons.GAME_STAGING) {

				staging.removeUserFromStaging( gamesInfo[gameid], 
											   users[socket.userid] );
				staging.removePlayerFromReady( gamesInfo[gameid], 
											   socket.userid);

				var newMsg = helpers.addGameMessage( gamesInfo[gameid], 
													 cons.MSG_SERVER,
													 username + " left the game");

				gameInfo = gamesInfo[gameid];

				socket.emit('self left game staging', gameInfo);
				io.in('lobby').emit('user left game', gameInfo);
				io.in(gameInfo.room).emit(
									'room user left staging', 
									gameInfo.players, 
									newMsg, 
									gameInfo.ready);
			}

			// otherwise, if game running, allow user to reconnect
			else if (gameInfo.status == cons.GAME_PROGRESS) {
				// in the meantime, alert users that one player is gone

				var newMsg = helpers.addGameMessage( gamesInfo[gameid],
													 cons.MSG_SERVER,
													 username + " disconnected");
				io.in(gameInfo.room).emit(
									'room user left game', 
									newMsg );
			}
		}
	}
};

var createNewUser = function(users, name, status, isComputer) {
    var userid = users.length;

	newUser = {
        userid: userid,
        name: name,
        status: status, // 0: OFFLINE, 1: LOBBY, 2: STAGING
        gameid: null, // the game id the user is in
		isComputer: isComputer
    };

    users.push(newUser);

    return userid;
};

var createNewComputerUser = function(users, status, io, messages) {
    var name = generateComputerPlayerName();

    var newMsg = helpers.addLobbyMessage( messages,
        								  cons.MSG_SERVER,
										  "computer user " + name + " added" );

    var newUserId = createNewUser(users, name, status, true);

    io.in('lobby').emit('new computer user', users, newMsg);

    return newUserId;
};

var generateComputerPlayerName = function() {
	var titlesOfRankMale = ['King','Emperor','Baron','Chancellor','Count','Admiral','General','Tzar'];
	var titlesOfRankFemale = ['Admiral','Queen','Empress','Baroness','Chancellor','Countess','General','Tzarina'];
	var gender = getRandomItem([cons.GENDER_FEMALE,cons.GENDER_MALE]);
	var title = gender == cons.GENDER_MALE ? getRandomItem(titlesOfRankMale) : getRandomItem(titlesOfRankFemale);
	var nameLength = 1 + Math.ceil(Math.random() * 2);
	var doLastName = Math.random() < 0.10 ? true : false;
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

// Returns random item from array
function getRandomItem(a) {
    var index = Math.floor(Math.random() * a.length);
    return a[index];
}

function generateName(length, doLastName, sex) {
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
		var length = 1 + Math.ceil(Math.random() * 2);
        name += " " + generateName( length, false, gender);
    }

    return name
}

// ........ for generating random computer player names ........... //

(function() { 

	module.exports = {
		login: login,
		logout: logout,
        createNewComputerUser: createNewComputerUser,
		disconnect: disconnect
	}

}());