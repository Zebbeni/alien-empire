
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
  	playSound("shield", 0.5);
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
  	playSound("explosion", 0.5);
	num_objects_moving += 1;
};

var checkAndPlayAnimations = function( msg ){
	if (msg.id == MSG_ACTION){
		var message = msg.message;
		if ( message.actiontype == ACT_FLEET_ATTACK 
			 || message.actiontype == ACT_BASE_ATTACK){
			triggerAttackSprite(message);
		}
		else if ( message.actiontype == ACT_MISSION_RESOLVE 
			      && message.agenttype == AGT_SABATEUR){
			triggerAttackSprite(message);
		}
	}
};

var triggerAttackSprite = function( action ){
	var planetid = action.planetid;
	var planet = clientGame.game.board.planets[planetid];
	var drawX = tiles[planetid].x;
	var drawY = tiles[planetid].y;
	var attackid = action.choice;
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
			var fleetsContainer = board.getChildByName('fleetsContainer');
			var fleetShape = fleetsContainer.getChildByName(OBJ_ENGLISH[OBJ_FLEET] + attackid);
			drawX = fleetShape.x - 16;
			drawY = fleetShape.y - 16;
			if (action.success == true){
				drawExplosion(drawX, drawY - 1, 0.5);
			}
			else {
				drawShield(drawX, drawY - 6, 0.5);
			}
			break;
		case OBJ_MINE:
		case OBJ_FACTORY:
		case OBJ_EMBASSY:
			var resource = tiles[planetid].getChildByName("resource" + attackid);
			var structure = resource.getChildByName("structure");
			drawX = drawX + resource.x + structure.x - 17;
			drawY = drawY + resource.y + structure.y + 10;
			if (action.success == true){
				drawExplosion(drawX - 2, drawY + 30, 0.5);
			}
			else {
				drawShield(drawX - 2, drawY - 11, 0.5);
			}
			break;
		default:
			break;
	}
};
