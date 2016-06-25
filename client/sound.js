var SOUND_ON = true;
var MUSIC_ON = true;
var MUSIC_PLAYING = false;

var playSound = function( sound, v ){
	if ( SOUND_ON ){
		createjs.Sound.play(sound).volume = v;
	}
};

var playLobbySound = function( sound, v ){
	if ( is_lobby_loaded && SOUND_ON ){	
		createjs.Sound.play(sound).volume = v;
	}
};

var playMusic = function( sound, v, interval ){
	if ( MUSIC_ON && !MUSIC_PLAYING ){
		createjs.Sound.play(sound).volume = v;
		setInterval( function(){
			musicPlayer = createjs.Sound.play(sound);
			musicPlayer.volume = v;
	}, interval)};
};