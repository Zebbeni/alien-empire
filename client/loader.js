var loader;
var is_all_loaded = false;

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
		loader.addEventListener("complete", drawBoard);
		loader.loadManifest(manifest, true);

		is_all_loaded = true;
	}
	else {
		drawBoard();
	}
};