var loader;
var lobbyloader;

var is_all_loaded = false;
var is_lobby_loaded = false;

var loadProgress, loadProgressLabel, loadProgressBar;
var loadingColor = "rgb(131, 203, 180)";

var load_assets = function() {

	if (!is_all_loaded){

		var manifest = [
			{src: s3url + "game/metal.png", id: "metal"},
			{src: s3url + "game/water.png", id: "water"},
			{src: s3url + "game/fuel.png", id: "fuel"},
			{src: s3url + "game/food.png", id: "food"},
			{src: s3url + "game/stars2.png", id: "stars"},
			{src: s3url + "game/asteroids.png", id: "asteroids"},
			{src: s3url + "game/noflyzone.png", id: "noflyzone"},

			{src: s3url + "game/arrow_red.png", id: "arrow_color0"},
			{src: s3url + "game/arrow_blue.png", id: "arrow_color1"},
			{src: s3url + "game/arrow_green.png", id: "arrow_color2"},
			{src: s3url + "game/arrow_yellow.png", id: "arrow_color3"},

			{src: s3url + "game/flag_red.png", id: "flag_color0"},
			{src: s3url + "game/flag_blue.png", id: "flag_color1"},
			{src: s3url + "game/flag_green.png", id: "flag_color2"},
			{src: s3url + "game/flag_yellow.png", id: "flag_color3"},

			{src: s3url + "game/spy_eye_red.png", id: "spy_eye_color0"},
			{src: s3url + "game/spy_eye_blue.png", id: "spy_eye_color1"},
			{src: s3url + "game/spy_eye_green.png", id: "spy_eye_color2"},
			{src: s3url + "game/spy_eye_yellow.png", id: "spy_eye_color3"},

			{src: s3url + "interface/2x_struct_buttons_p0.png", id: "structures0"},
			{src: s3url + "interface/2x_struct_buttons_p1.png", id: "structures1"},
			{src: s3url + "interface/2x_struct_buttons_p2.png", id: "structures2"},
			{src: s3url + "interface/2x_struct_buttons_p3.png", id: "structures3"},

			{src: s3url + "game/mine_red.png", id: "mine0"},
			{src: s3url + "game/mine_blue.png", id: "mine1"},
			{src: s3url + "game/mine_green.png", id: "mine2"},
			{src: s3url + "game/mine_yellow.png", id: "mine3"},

			{src: s3url + "game/factory_red.png", id: "factory0"},
			{src: s3url + "game/factory_blue.png", id: "factory1"},
			{src: s3url + "game/factory_green.png", id: "factory2"},
			{src: s3url + "game/factory_yellow.png", id: "factory3"},
			
			{src: s3url + "game/embassy_red.png", id: "embassy0"},
			{src: s3url + "game/embassy_blue.png", id: "embassy1"},
			{src: s3url + "game/embassy_green.png", id: "embassy2"},
			{src: s3url + "game/embassy_yellow.png", id: "embassy3"},

			{src: s3url + "game/base_red.png", id: "base0"},
			{src: s3url + "game/base_blue.png", id: "base1"},
			{src: s3url + "game/base_green.png", id: "base2"},
			{src: s3url + "game/base_yellow.png", id: "base3"},

			{src: s3url + "game/fleet_red.png", id: "fleet0"},
			{src: s3url + "game/fleet_blue.png", id: "fleet1"},
			{src: s3url + "game/fleet_green.png", id: "fleet2"},
			{src: s3url + "game/fleet_yellow.png", id: "fleet3"},

			{src: s3url + "game/agent_tokens_p0.png", id: "agents0"},
			{src: s3url + "game/agent_tokens_p1.png", id: "agents1"},
			{src: s3url + "game/agent_tokens_p2.png", id: "agents2"},
			{src: s3url + "game/agent_tokens_p3.png", id: "agents3"},

			{src: s3url + "game/explosion_sprite.png", id: "explosion_sprite"},
			{src: s3url + "game/shield_sprite.png", id: "shield_sprite"},

			{src: s3url + "sounds/click1.ogg", id:"click1"},
			{src: s3url + "sounds/click2.ogg", id:"click2"},
			{src: s3url + "sounds/flutter1.ogg", id:"flutter1"},
			{src: s3url + "sounds/flutter2.ogg", id:"flutter2"},
			{src: s3url + "sounds/flutter3.ogg", id:"flutter3"},
			{src: s3url + "sounds/plink.ogg", id: "plink"},
			{src: s3url + "sounds/whoosh1.ogg", id:"whoosh1"},
			{src: s3url + "sounds/whoosh2.ogg", id:"whoosh2"},
			{src: s3url + "sounds/choral.ogg", id:"choral"},
			{src: s3url + "sounds/chirp1.ogg", id:"chirp1"},
			{src: s3url + "sounds/flit.ogg", id:"flit"},
			{src: s3url + "sounds/explosion.ogg", id: "explosion"},
			{src: s3url + "sounds/shield.ogg", id: "shield"},
			// {src: s3url + "sounds/strings.ogg", id:"strings"},
			// {src: s3url + "sounds/wave.ogg", id:"wave"},
			{src: s3url + "sounds/chime.ogg", id:"chime"},
			{src: s3url + "sounds/musicbox1.ogg", id:"musicbox1"},
			{src: s3url + "sounds/musicbox2.ogg", id:"musicbox2"}

		];

		for ( var p = 1; p <= 29; p++ ) {
			manifest.push({src: s3url + "game/planet_" + p + ".png", id: "planet_" + p });
		}

		loader = new createjs.LoadQueue(true, null, true);
		
		if (offline) {
			loader = new createjs.LoadQueue(false);
		}

		createjs.Sound.alternateExtensions = ["mp3"];
		loader.installPlugin(createjs.Sound);

		loader.addEventListener("complete", handleComplete);
		loader.addEventListener("progress", handleProgress);
		loader.loadManifest(manifest, true);

		is_all_loaded = true;
	}
	else {
		handleComplete();
	}
};

var initProgressBar = function() {

	loadProgress = new createjs.Container();

	loadProgressLabel = new createjs.Text("Loading","bold 20px Play", loadingColor);
	loadProgressLabel.lineWidth = 200;
	loadProgressLabel.textAlign = "center";
	loadProgressLabel.x = 100;
	loadProgressLabel.y = 0;

	loadProgress.addChild(loadProgressLabel);

	loadProgressBar = new createjs.Shape();
	loadProgressBar.graphics.beginFill(loadingColor).drawRect(0, 0, 1, 25);
	loadProgressBar.x = 0;
	loadProgressBar.y = 25;

	loadProgress.alpha = 0.9;
	loadProgress.addChild(loadProgressBar);

	centerProgressBar();

};

var addProgressBar = function() {
	updateCanvasSize();
	stage.addChild(loadProgress);
};

var centerProgressBar = function() {
	if (loadProgress) {
		loadProgress.x = (window.innerWidth / 2.0) - 100;
		loadProgress.y = (window.innerHeight / 2.0) - 100;
	}
};

var handleProgress = function() {

	progressPercentage = Math.round(loader.progress * 100);
	loadProgressLabel.text = "Loaded " + progressPercentage + "%";
	loadProgressBar.graphics.beginFill(loadingColor).drawRect(0, 0, 200 * loader.progress, 25);
	stage.update();
};

var handleComplete = function() {
	stage.removeChild(loadProgress);
	submitLoadingDone();
	stage.update();
};

var loadLobby = function(){
	if (!is_lobby_loaded){
		var manifest = [
			{src: s3url + "sounds/click1.ogg", id:"click1"},
			{src: s3url + "sounds/flutter1.ogg", id:"flutter1"},
			{src: s3url + "sounds/flutter2.ogg", id:"flutter2"},
			{src: s3url + "sounds/choral.ogg", id:"choral"},
			{src: s3url + "sounds/chime.ogg", id:"chime"},
			{src: s3url + "sounds/flit.ogg", id:"flit"}
		];

		lobbyloader = new createjs.LoadQueue(true, null, true);
		
		if (offline) {
			lobbyloader = new createjs.LoadQueue(false);
		}

		createjs.Sound.alternateExtensions = ["mp3"];
		lobbyloader.installPlugin(createjs.Sound);

		lobbyloader.addEventListener("complete", handleLobbyLoadComplete);
		lobbyloader.loadManifest(manifest, true);

		is_lobby_loaded = true;
	}
	else {
		handleLobbyLoadComplete();
	}
};

var handleLobbyLoadComplete = function(){
	playMusic("choral", 0.15, 30903);
};