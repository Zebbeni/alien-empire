var SOUND_ON = true;

var playSound = function( sound, v ){
	if ( SOUND_ON ){
		var player = createjs.Sound.play(sound);
		player.volume = v;
	}
};