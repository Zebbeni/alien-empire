var loader;
var is_all_loaded = false;

var loadProgress, loadProgressLabel, loadProgressBar;
var loadingColor = "rgb(131, 203, 180)";

var load_assets = function() {

	if (!is_all_loaded){

		manifest = [
			{src: "images/game/metal.png", id: "metal"},
			{src: "images/game/water.png", id: "water"},
			{src: "images/game/fuel.png", id: "fuel"},
			{src: "images/game/food.png", id: "food"},
			{src: "images/game/stars.png", id: "stars"},
			{src: "images/game/asteroids.png", id: "asteroids"},

			{src: "images/game/arrow_red.png", id: "arrow_color0"},
			{src: "images/game/arrow_blue.png", id: "arrow_color1"},
			{src: "images/game/arrow_green.png", id: "arrow_color2"},
			{src: "images/game/arrow_yellow.png", id: "arrow_color3"},

			{src: "images/game/mine_red.png", id: "mine0"},
			{src: "images/game/mine_blue.png", id: "mine1"},
			{src: "images/game/mine_green.png", id: "mine2"},
			{src: "images/game/mine_yellow.png", id: "mine3"},

			{src: "images/game/factory_red.png", id: "factory0"},
			{src: "images/game/factory_blue.png", id: "factory1"},
			{src: "images/game/factory_green.png", id: "factory2"},
			{src: "images/game/factory_yellow.png", id: "factory3"},
			
			{src: "images/game/embassy_red.png", id: "embassy0"},
			{src: "images/game/embassy_blue.png", id: "embassy1"},
			{src: "images/game/embassy_green.png", id: "embassy2"},
			{src: "images/game/embassy_yellow.png", id: "embassy3"},

			{src: "images/game/base_red.png", id: "base0"},
			{src: "images/game/base_blue.png", id: "base1"},
			{src: "images/game/base_green.png", id: "base2"},
			{src: "images/game/base_yellow.png", id: "base3"},

			{src: "images/game/fleet_red.png", id: "fleet0"},
			{src: "images/game/fleet_blue.png", id: "fleet1"},
			{src: "images/game/fleet_green.png", id: "fleet2"},
			{src: "images/game/fleet_yellow.png", id: "fleet3"}
		];

		for ( var p = 1; p <= 29; p++ ) {
			manifest.push({src: "images/game/planet_" + p + ".png", id: "planet_" + p });
		}

		loader = new createjs.LoadQueue(false);
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
	drawBoard();
	showInterface();
	socket_loadingDone();
};