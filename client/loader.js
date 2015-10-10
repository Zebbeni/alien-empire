var loader;
var is_all_loaded = false;

var loadProgress, loadProgressLabel, loadProgressBar;
var loadingColor = "rgb(131, 203, 180)";

var load_assets = function() {

	if (!is_all_loaded){

		var url = "https://s3-us-west-2.amazonaws.com/alien-empire/";
		if ( offline ){
			url = "images/";
		}

		manifest = [
			{src: url + "game/metal.png", id: "metal"},
			{src: url + "game/water.png", id: "water"},
			{src: url + "game/fuel.png", id: "fuel"},
			{src: url + "game/food.png", id: "food"},
			{src: url + "game/stars.png", id: "stars"},
			{src: url + "game/asteroids.png", id: "asteroids"},

			{src: url + "game/arrow_red.png", id: "arrow_color0"},
			{src: url + "game/arrow_blue.png", id: "arrow_color1"},
			{src: url + "game/arrow_green.png", id: "arrow_color2"},
			{src: url + "game/arrow_yellow.png", id: "arrow_color3"},

			{src: url + "game/mine_red.png", id: "mine0"},
			{src: url + "game/mine_blue.png", id: "mine1"},
			{src: url + "game/mine_green.png", id: "mine2"},
			{src: url + "game/mine_yellow.png", id: "mine3"},

			{src: url + "game/factory_red.png", id: "factory0"},
			{src: url + "game/factory_blue.png", id: "factory1"},
			{src: url + "game/factory_green.png", id: "factory2"},
			{src: url + "game/factory_yellow.png", id: "factory3"},
			
			{src: url + "game/embassy_red.png", id: "embassy0"},
			{src: url + "game/embassy_blue.png", id: "embassy1"},
			{src: url + "game/embassy_green.png", id: "embassy2"},
			{src: url + "game/embassy_yellow.png", id: "embassy3"},

			{src: url + "game/base_red.png", id: "base0"},
			{src: url + "game/base_blue.png", id: "base1"},
			{src: url + "game/base_green.png", id: "base2"},
			{src: url + "game/base_yellow.png", id: "base3"},

			{src: url + "game/fleet_red.png", id: "fleet0"},
			{src: url + "game/fleet_blue.png", id: "fleet1"},
			{src: url + "game/fleet_green.png", id: "fleet2"},
			{src: url + "game/fleet_yellow.png", id: "fleet3"},

			{src: url + "game/explorer_red.png", id: "explorer0"},
			{src: url + "game/explorer_blue.png", id: "explorer1"},
			{src: url + "game/explorer_green.png", id: "explorer2"},
			{src: url + "game/explorer_yellow.png", id: "explorer3"},

			{src: url + "game/miner_red.png", id: "miner0"},
			{src: url + "game/miner_blue.png", id: "miner1"},
			{src: url + "game/miner_green.png", id: "miner2"},
			{src: url + "game/miner_yellow.png", id: "miner3"},

			{src: url + "game/surveyor_red.png", id: "surveyor0"},
			{src: url + "game/surveyor_blue.png", id: "surveyor1"},
			{src: url + "game/surveyor_green.png", id: "surveyor2"},
			{src: url + "game/surveyor_yellow.png", id: "surveyor3"},

			{src: url + "game/ambassador_red.png", id: "ambassador0"},
			{src: url + "game/ambassador_blue.png", id: "ambassador1"},
			{src: url + "game/ambassador_green.png", id: "ambassador2"},
			{src: url + "game/ambassador_yellow.png", id: "ambassador3"},

			{src: url + "game/envoy_red.png", id: "envoy0"},
			{src: url + "game/envoy_blue.png", id: "envoy1"},
			{src: url + "game/envoy_green.png", id: "envoy2"},
			{src: url + "game/envoy_yellow.png", id: "envoy3"},

			{src: url + "game/spy_red.png", id: "spy0"},
			{src: url + "game/spy_blue.png", id: "spy1"},
			{src: url + "game/spy_green.png", id: "spy2"},
			{src: url + "game/spy_yellow.png", id: "spy3"},

			{src: url + "game/smuggler_red.png", id: "smuggler0"},
			{src: url + "game/smuggler_blue.png", id: "smuggler1"},
			{src: url + "game/smuggler_green.png", id: "smuggler2"},
			{src: url + "game/smuggler_yellow.png", id: "smuggler3"},

			{src: url + "game/sabateur_red.png", id: "sabateur0"},
			{src: url + "game/sabateur_blue.png", id: "sabateur1"},
			{src: url + "game/sabateur_green.png", id: "sabateur2"},
			{src: url + "game/sabateur_yellow.png", id: "sabateur3"}

		];

		for ( var p = 1; p <= 29; p++ ) {
			manifest.push({src: url + "game/planet_" + p + ".png", id: "planet_" + p });
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

	loadProgressLabel = new createjs.Text("Loading","20px Arial", loadingColor);
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
	setCanvasSize();
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