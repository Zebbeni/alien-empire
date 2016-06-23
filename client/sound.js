var SOUND_ON = true;
var MUSIC_ON = true;
var MUSIC_PLAYING = false;

var playSound = function( sound, v ){
	if ( SOUND_ON ){
		var player = createjs.Sound.play(sound);
		player.volume = v;
	}
};

var playMusic = function( sound, v, interval ){
	if ( MUSIC_ON && !MUSIC_PLAYING ){
		MUSIC_PLAYING = true;
		createjs.Sound.play(sound).volume = v;
		var music = setInterval( function(){
			createjs.Sound.play(sound).volume = v;
		}, interval);
	}
};