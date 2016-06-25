var SOUND_ON = true;
var MUSIC_ON = true;
var MUSIC_PLAYING = false;
var musicInterval;

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
	musicVolume = v;
	if ( MUSIC_ON && !MUSIC_PLAYING ){
		musicPlayer = createjs.Sound.play(sound);
		musicPlayer.volume = v;
		musicInterval = setInterval( function(){
			musicPlayer = createjs.Sound.play(sound);
			musicPlayer.volume = v;
	}, interval)};
};

var toggleSound = function(){
	SOUND_ON = !SOUND_ON;
	updateSoundButton();
};

var toggleMusic = function(){
	MUSIC_ON = !MUSIC_ON;
	updateMusicButton();
	if ( MUSIC_ON ){
		playMusic("choral", 0.15, 30903);
	}
	else {
		musicPlayer.stop();
		clearInterval(musicInterval);
	}
};