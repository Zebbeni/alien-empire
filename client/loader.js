var loader;
var is_all_loaded = false;

var loadProgress, loadProgressLabel, loadProgressBar;
var loadingColor = "rgb(131, 203, 180)";

var load_assets = function() {

	if (!is_all_loaded){

		manifest = [
			{src: s3url + "game/metal.png", id: "metal"},
			{src: s3url + "game/water.png", id: "water"},
			{src: s3url + "game/fuel.png", id: "fuel"},
			{src: s3url + "game/food.png", id: "food"},
			{src: s3url + "game/stars.png", id: "stars"},
			{src: s3url + "game/asteroids.png", id: "asteroids"},

			{src: s3url + "game/arrow_red.png", id: "arrow_color0"},
			{src: s3url + "game/arrow_blue.png", id: "arrow_color1"},
			{src: s3url + "game/arrow_green.png", id: "arrow_color2"},
			{src: s3url + "game/arrow_yellow.png", id: "arrow_color3"},

			{src: s3url + "game/flag_red.png", id: "flag_color0"},
			{src: s3url + "game/flag_blue.png", id: "flag_color1"},
			{src: s3url + "game/flag_green.png", id: "flag_color2"},
			{src: s3url + "game/flag_yellow.png", id: "flag_color3"},

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

			{src: s3url + "game/explorer_red.png", id: "explorer0"},
			{src: s3url + "game/explorer_blue.png", id: "explorer1"},
			{src: s3url + "game/explorer_green.png", id: "explorer2"},
			{src: s3url + "game/explorer_yellow.png", id: "explorer3"},

			{src: s3url + "game/miner_red.png", id: "miner0"},
			{src: s3url + "game/miner_blue.png", id: "miner1"},
			{src: s3url + "game/miner_green.png", id: "miner2"},
			{src: s3url + "game/miner_yellow.png", id: "miner3"},

			{src: s3url + "game/surveyor_red.png", id: "surveyor0"},
			{src: s3url + "game/surveyor_blue.png", id: "surveyor1"},
			{src: s3url + "game/surveyor_green.png", id: "surveyor2"},
			{src: s3url + "game/surveyor_yellow.png", id: "surveyor3"},

			{src: s3url + "game/ambassador_red.png", id: "ambassador0"},
			{src: s3url + "game/ambassador_blue.png", id: "ambassador1"},
			{src: s3url + "game/ambassador_green.png", id: "ambassador2"},
			{src: s3url + "game/ambassador_yellow.png", id: "ambassador3"},

			{src: s3url + "game/envoy_red.png", id: "envoy0"},
			{src: s3url + "game/envoy_blue.png", id: "envoy1"},
			{src: s3url + "game/envoy_green.png", id: "envoy2"},
			{src: s3url + "game/envoy_yellow.png", id: "envoy3"},

			{src: s3url + "game/spy_red.png", id: "spy0"},
			{src: s3url + "game/spy_blue.png", id: "spy1"},
			{src: s3url + "game/spy_green.png", id: "spy2"},
			{src: s3url + "game/spy_yellow.png", id: "spy3"},

			{src: s3url + "game/smuggler_red.png", id: "smuggler0"},
			{src: s3url + "game/smuggler_blue.png", id: "smuggler1"},
			{src: s3url + "game/smuggler_green.png", id: "smuggler2"},
			{src: s3url + "game/smuggler_yellow.png", id: "smuggler3"},

			{src: s3url + "game/sabateur_red.png", id: "sabateur0"},
			{src: s3url + "game/sabateur_blue.png", id: "sabateur1"},
			{src: s3url + "game/sabateur_green.png", id: "sabateur2"},
			{src: s3url + "game/sabateur_yellow.png", id: "sabateur3"}

		];

		for ( var p = 1; p <= 29; p++ ) {
			manifest.push({src: s3url + "game/planet_" + p + ".png", id: "planet_" + p });
		}

		loader = new createjs.LoadQueue(true, null, true);
		if (offline) {
			loader = new createjs.LoadQueue(false);
		}

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
	stage.update();
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
};