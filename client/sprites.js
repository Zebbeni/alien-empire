
var drawSprites = function(){

	var explosion_sprite = initExplosionSprite();
	var shield_sprite = initShieldSprite();

	board.addChild(explosion_sprite);
	board.addChild(shield_sprite);
};

var initExplosionSprite = function(){
	var img = loader.getResult("explosion_sprite");
	data = {
		images: [img],
        frames: {width:200, height:200},
        animations: {
            show:[1,19]
        }
	};
	var explosion_sprite = new createjs.SpriteSheet(data);
	var sprite = new createjs.Sprite(explosion_sprite, "show");
	sprite.name = "explosion_sprite";
	sprite.visible = false;
	sprite.mouseEnabled = false;
	sprite.gotoAndStop();
	sprite.on("animationend", function() {
		this.visible = false;
		this.gotoAndStop();
		num_objects_moving -= 1;
	});
	return sprite;
};

var initShieldSprite = function(){
	var img = loader.getResult("shield_sprite");
	data = {
		images: [img],
        frames: {width:200, height:200},
        animations: {
            show:[1,19]
        }
	};
	var shield_sprite = new createjs.SpriteSheet(data);
	var sprite = new createjs.Sprite(shield_sprite, "show");
	sprite.name = "shield_sprite";
	sprite.visible = false;
	sprite.mouseEnabled = false;
	sprite.gotoAndStop();
	sprite.on("animationend", function() {
		this.visible = false;
		this.gotoAndStop();
		num_objects_moving -= 1;
	});
	return sprite;
};

var drawShield = function(x, y, scale){
	var shield = board.getChildByName("shield_sprite");
	shield.visible = true;
	shield.x = x;
	shield.y = y;
	shield.scaleX = scale;
	shield.scaleY = scale;
  	shield.gotoAndPlay("show");
	num_objects_moving += 1;
};

var drawExplosion = function(x, y, scale){
	var explosion = board.getChildByName("explosion_sprite");
	explosion.visible = true;
	explosion.x = x;
	explosion.y = y;
	explosion.scaleX = scale;
	explosion.scaleY = scale;
  	explosion.gotoAndPlay("show");
	num_objects_moving += 1;
};

var triggerAttackSprite = function( action ){
	var planetid = action.planetid;
	var planet = clientGame.game.board.planets[planetid];
	var drawX = tiles[planetid].x;
	var drawY = tiles[planetid].y;
	switch (action.objecttype){
		case OBJ_BASE:
			if (planet.w == 2){
				drawX += 1;
				drawY += 1;
			}
			else {
				drawX -= 49;
				drawY -= 49;
			}
			if (action.success == true){
				drawExplosion(drawX, drawY, 0.8);
			}
			else {
				drawShield(drawX, drawY, 0.8);
			}
			break;
		case OBJ_FLEET:
			break;
		case OBJ_MINE:
		case OBJ_FACTORY:
		case OBJ_EMBASSY:
			
			break;
		default:
			break;
	}
};
