var loader;
var is_all_loaded = false;

var loadProgress, loadProgressLabel, loadProgressBar;
var loadingColor = "rgba(131, 203, 180, .9)";

var load_assets = function() {

	if (!is_all_loaded){

		manifest = [
			{src: "images/game/metal.png", id: "metal"},
			{src: "images/game/water.png", id: "water"},
			{src: "images/game/fuel.png", id: "fuel"},
			{src: "images/game/food.png", id: "food"},
			{src: "images/game/stars.png", id: "stars"}
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
		drawBoard();
	}
};

var initProgressBar = function() {

	loadProgress = new createjs.Container();

	loadProgressLabel = new createjs.Text("Loading","20pt Arial", loadingColor);
	loadProgressLabel.lineWidth = 200;
	loadProgressLabel.textAlign = "center";
	loadProgressLabel.x = 100;
	loadProgressLabel.y = 0;

	loadProgress.addChild(loadProgressLabel);

	loadProgressBar = new createjs.Shape();
	loadProgressBar.graphics.beginFill(loadingColor).drawRect(0, 0, 1, 25);
	loadProgressBar.x = 0;
	loadProgressBar.y = 25;

	loadProgress.addChild(loadProgressBar);

	loadProgress.x = (window.innerWidth / 2.0) - 100;
	loadProgress.y = (window.innerHeight / 2.0) - 50;

};

var addProgressBar = function() {
	setCanvasSize();
	stage.addChild(loadProgress);
	stage.update();
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
};