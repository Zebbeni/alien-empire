/**
 * Does a one time drawing of an asteroid tile. 
 * This should not need to happen multiple times
 */
var drawAsteroid = function( asteroid ) {
	var asteroidTile = new createjs.Container();

	var stars = new createjs.Shape();
	var starsImg = loader.getResult("stars");
	stars.graphics.beginBitmapFill(starsImg).drawRect(0, 0, 4 * sWid, 2 * sWid);
	stars.scaleX = 0.5;
	stars.scaleY = 0.5;
	asteroidTile.addChild( stars );

	var asteroids = new createjs.Shape();
	var asteroidsImg = loader.getResult("asteroids");
	asteroids.graphics.beginBitmapFill(asteroidsImg).drawRect(0, 0, 2 * sWid, sWid);
	asteroidTile.addChild( asteroids );

	var darkscreen = new createjs.Shape();
	darkscreen.graphics.beginFill("rgba(0, 0, 0, 0.4)");
	darkscreen.graphics.drawRect(0, 0, 2 * sWid, sWid);
	asteroidTile.addChild( darkscreen );

	var border = new createjs.Shape();
	border.graphics.setStrokeStyle(10);
	border.graphics.beginStroke("rgba(0,0,0,0.9)");
	border.graphics.drawRect(0, 0, 2 * sWid, sWid);
	asteroidTile.addChild( border );

	asteroidTile.x = (asteroid.x + asteroid.r) * sWid;
	asteroidTile.y = asteroid.y * sWid;
	asteroidTile.rotation = 90 * asteroid.r;

	board.addChild( asteroidTile );
};